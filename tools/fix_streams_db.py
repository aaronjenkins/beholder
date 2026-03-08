#!/usr/bin/env python3
"""
One-time repair script to ensure seed streams exist and to resolve missing
YouTube channel IDs for streams whose `link` contains a channel handle (/@...).

Usage:
  DATABASE_URL=... YT_KEY_1=... python tools/fix_streams_db.py [--dry-run]

The script will:
 - Parse `seed.sql` INSERT rows and insert any missing tags (ON CONFLICT DO NOTHING).
 - For streams with NULL `channel_id` and a `link` containing a handle, call
   the YouTube Data API (requires `YT_KEY_1`) to resolve the channel ID and update DB.

Be careful: run once and inspect output before re-running without `--dry-run`.
"""
import os
import re
import sys
import asyncio
import json
import asyncpg
import httpx

DRY_RUN = "--dry-run" in sys.argv
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))
SEED_SQL = os.path.join(PROJECT_ROOT, 'seed.sql')
DATABASE_URL = os.environ.get('DATABASE_URL')
YT_KEY = os.environ.get('YT_KEY_1') or os.environ.get('YT_KEY')


def parse_seed_insert_block(sql_text: str) -> list[tuple]:
    """Extract the VALUES(...) tuples from the INSERT INTO streams (...) VALUES ... ON CONFLICT block.
    Returns list of tuples: (name, tag, color, channel_id, video_id, link)
    """
    m = re.search(r"INSERT INTO streams .*?VALUES(.*?)ON CONFLICT", sql_text, re.S)
    if not m:
        return []
    block = m.group(1).strip()
    # Split tuples: top-level '),\n(' separators. Normalize whitespace.
    parts = re.split(r"\),\s*\n\(|\),\s*\n", block)
    rows = []
    for p in parts:
        p = p.strip()
        if p.startswith('('):
            p = p[1:]
        if p.endswith(');'):
            p = p[:-2]
        if p.endswith(')'):
            p = p[:-1]
        # Replace SQL NULL with Python None and convert single quotes to double quotes
        py_s = p.replace("NULL", "None")
        # Protect escaped single quotes by replacing doubled single-quotes with placeholder
        py_s = py_s.replace("''", "\\'\\'")
        py_s = py_s.replace("'", '"')
        py_s = py_s.replace('""', '"')
        py_s = py_s.replace("\\'\\'", "''")
        try:
            tup = eval(f"({py_s},)")
        except Exception:
            # fallback: try a simpler split for 6 columns
            cols = []
            cur = ''
            inq = False
            for ch in p:
                if ch == "'":
                    inq = not inq
                    cur += ch
                elif ch == ',' and not inq:
                    cols.append(cur.strip())
                    cur = ''
                else:
                    cur += ch
            if cur:
                cols.append(cur.strip())
            # Normalize values
            def norm(v):
                v = v.strip()
                if v == 'NULL':
                    return None
                if v.startswith("'") and v.endswith("'"):
                    return v[1:-1]
                return v
            tup = tuple(norm(c) for c in cols)
        # We expect at least 6 columns: name, tag, color, channel_id, video_id, link
        if len(tup) >= 6:
            rows.append((tup[0], tup[1], tup[2], tup[3], tup[4], tup[5]))
    return rows


def handle_from_link(link: str) -> str | None:
    m = re.match(r"https?://www\.youtube\.com/(@[^/]+)", link or "")
    return m.group(1) if m else None


async def resolve_handle_to_channel_id(handle: str, client: httpx.AsyncClient) -> str | None:
    # handle may be like '@NBCNews' or '@NBCNews/live' — strip leading @
    h = handle.lstrip('@')
    if not YT_KEY:
        return None
    url = f"https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@{h}&key={YT_KEY}"
    try:
        r = await client.get(url, timeout=10)
        r.raise_for_status()
        j = r.json()
        items = j.get('items') or []
        if items:
            return items[0].get('id')
    except Exception:
        pass
    # fallback: try search.list (less reliable)
    try:
        url2 = f"https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={h}&key={YT_KEY}"
        r2 = await client.get(url2, timeout=10)
        r2.raise_for_status()
        j2 = r2.json()
        items2 = j2.get('items') or []
        if items2:
            return items2[0].get('snippet', {}).get('channelId')
    except Exception:
        pass
    return None


async def main():
    if not DATABASE_URL:
        print('DATABASE_URL is required in environment')
        return
    sql_text = ''
    try:
        with open(SEED_SQL, 'r') as f:
            sql_text = f.read()
    except FileNotFoundError:
        print('seed.sql not found; aborting')
        return

    seed_rows = parse_seed_insert_block(sql_text)
    print(f'Parsed {len(seed_rows)} seed rows')

    pool = await asyncpg.create_pool(DATABASE_URL)
    async with pool.acquire() as conn:
        existing = {r['tag'] for r in await conn.fetch('SELECT tag FROM streams')}

    to_insert = []
    for name, tag, color, channel_id, video_id, link in seed_rows:
        tag_u = tag.upper() if isinstance(tag, str) else tag
        if tag_u not in existing:
            to_insert.append((name, tag_u, color or '#444444', channel_id, video_id, link))

    if to_insert:
        print(f'{len(to_insert)} missing streams will be inserted')
        if DRY_RUN:
            for t in to_insert[:20]:
                print('  would insert', t[1], t[0])
        else:
            async with pool.acquire() as conn:
                for name, tag, color, channel_id, video_id, link in to_insert:
                    await conn.execute(
                        """INSERT INTO streams (name, tag, color, channel_id, video_id, link)
                           VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (tag) DO NOTHING""",
                        name, tag, color, channel_id, video_id, link,
                    )
                    print('  inserted', tag, name)
    else:
        print('No missing seed rows')

    # Now resolve missing channel_id values for links containing handles
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT tag, link, channel_id FROM streams ORDER BY id")

    need_resolve = [r for r in rows if (not r['channel_id']) and r['link'] and '/@' in r['link']]
    print(f'{len(need_resolve)} streams need channel_id resolution')

    async with httpx.AsyncClient(timeout=10) as client:
        for r in need_resolve:
            tag = r['tag']
            handle = handle_from_link(r['link'])
            if not handle:
                print('  skipping', tag, '(no handle found)')
                continue
            cid = await resolve_handle_to_channel_id(handle, client)
            if not cid:
                print('  could not resolve', tag, handle)
                continue
            print(f'  resolved {tag}: {cid}')
            if not DRY_RUN:
                async with pool.acquire() as conn:
                    await conn.execute('UPDATE streams SET channel_id = $1 WHERE tag = $2', cid, tag)

    await pool.close()
    print('done')


if __name__ == '__main__':
    asyncio.run(main())
