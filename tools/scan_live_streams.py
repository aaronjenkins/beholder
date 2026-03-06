#!/usr/bin/env python3
"""
Scan all YouTube channels in the Beholder DB for concurrent live streams
and insert any additional ones as new entries.

NOTE: This script performs HTML scraping of YouTube pages (parsing
`ytInitialData`). Scraping YouTube may violate YouTube's Terms of
Service and can be less reliable than using the YouTube Data API.

The scraper is DISABLED by default. To run it locally for experimentation
set the environment variable `ENABLE_SCRAPER=1` before executing.

Usage (from project root):
    # disabled by default
    ENABLE_SCRAPER=1 docker cp tools/scan_live_streams.py beholder:/app/scan.py
    ENABLE_SCRAPER=1 docker exec beholder python scan.py [--dry-run]
"""
import os
import re
import json
import sys
import asyncio
import asyncpg
import httpx

DATABASE_URL = "postgresql://beholder:beholder@db:5432/beholder"
HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"}
DRY_RUN = "--dry-run" in sys.argv


def find_live_video_ids(html: str) -> list[tuple[str, str]]:
    """
    Parse ytInitialData from a YouTube /streams page and return
    [(video_id, title)] for every video currently marked LIVE.

    YouTube embeds ytInitialData as:
        var ytInitialData = {...};
    We parse that JSON and walk the tree looking for videoRenderer
    objects whose thumbnailOverlays contain a
    thumbnailOverlayTimeStatusRenderer with style == "LIVE".
    """
    start = html.find("var ytInitialData = ")
    if start == -1:
        return []
    start += len("var ytInitialData = ")
    end = html.find(";</script>", start)
    if end == -1:
        return []
    try:
        data = json.loads(html[start:end])
    except json.JSONDecodeError:
        return []

    results: list[tuple[str, str]] = []
    seen: set[str] = set()

    def is_live_overlay(overlays: list) -> bool:
        for o in overlays:
            renderer = o.get("thumbnailOverlayTimeStatusRenderer", {})
            if renderer.get("style") == "LIVE":
                return True
        return False

    def walk(obj):
        if isinstance(obj, dict):
            if "videoId" in obj and obj["videoId"] not in seen:
                overlays = obj.get("thumbnailOverlays", [])
                if is_live_overlay(overlays):
                    vid = obj["videoId"]
                    seen.add(vid)
                    title_runs = obj.get("title", {}).get("runs", [])
                    title = title_runs[0]["text"] if title_runs else vid
                    results.append((vid, title))
            for v in obj.values():
                walk(v)
        elif isinstance(obj, list):
            for item in obj:
                walk(item)

    walk(data)
    return results


def handle_from_link(link: str) -> str | None:
    """Extract @handle from a YouTube channel URL, e.g. '@NBCNews'."""
    m = re.match(r"https?://www\.youtube\.com/(@[^/]+)", link)
    return m.group(1) if m else None


async def fetch_channel_icon(client, handle):
    url = f"https://www.youtube.com/{handle}"
    try:
        r = await client.get(url)
        # Try to find the avatar URL in a meta tag or initial JSON
        m = re.search(r'<meta property="og:image" content="([^"]+)"', r.text)
        if m:
            return m.group(1)
        # Fallback: look for "avatar" in ytInitialData
        start = r.text.find("var ytInitialData = ")
        if start != -1:
            start += len("var ytInitialData = ")
            end = r.text.find(";</script>", start)
            if end != -1:
                try:
                    data = json.loads(r.text[start:end])
                    # Traverse for avatar URL
                    def walk(obj):
                        if isinstance(obj, dict):
                            if "avatar" in obj:
                                thumbs = obj["avatar"].get("thumbnails")
                                if thumbs:
                                    return thumbs[-1]["url"]
                            for v in obj.values():
                                result = walk(v)
                                if result:
                                    return result
                        elif isinstance(obj, list):
                            for item in obj:
                                result = walk(item)
                                if result:
                                    return result
                        return None
                    return walk(data)
                except Exception:
                    pass
    except Exception:
        pass
    return None


async def main():
    pool = await asyncpg.create_pool(DATABASE_URL)

    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, tag, name, link, color FROM streams ORDER BY id")

    # Only process channel-based streams; skip specific watch?v= entries
    channel_rows = [r for r in rows if "/@" in r["link"]]
    print(f"Scanning {len(channel_rows)} channel-based streams...\n")

    async with pool.acquire() as conn:
        existing_vids: set[str] = {
            r["video_id"]
            for r in await conn.fetch("SELECT video_id FROM streams WHERE video_id IS NOT NULL")
        }
        existing_tags: set[str] = {r["tag"] for r in await conn.fetch("SELECT tag FROM streams")}

    summary: list[str] = []

    async with httpx.AsyncClient(timeout=20, follow_redirects=True, headers=HEADERS) as client:
        for row in channel_rows:
            handle = handle_from_link(row["link"])
            if not handle:
                continue

            # Fetch channel icon
            icon_url = await fetch_channel_icon(client, handle)

            streams_url = f"https://www.youtube.com/{handle}/streams"
            try:
                r = await client.get(streams_url)
                live_vids = find_live_video_ids(r.text)
            except Exception as e:
                print(f"  {row['tag']:12s} ERROR: {e}")
                continue

            count = len(live_vids)
            status = f"{count} live" if count else "offline"
            print(f"  {row['tag']:12s} {handle:30s} {status}")

            if count > 1:
                for i, (vid, title) in enumerate(live_vids[1:], start=2):
                    if vid in existing_vids:
                        print(f"               -> {vid} already in DB, skipping")
                        continue

                    # Build a unique tag like NBC2, NBC3, …
                    n = i
                    new_tag = f"{row['tag']}{n}"
                    while new_tag in existing_tags:
                        n += 1
                        new_tag = f"{row['tag']}{n}"

                    existing_tags.add(new_tag)
                    existing_vids.add(vid)
                    new_link = f"https://www.youtube.com/watch?v={vid}"
                    new_name = f"{row['name']} #{n}"

                    if DRY_RUN:
                        print(f"               -> [DRY RUN] would add {new_tag}: {title} ({vid})")
                    else:
                        async with pool.acquire() as conn:
                            await conn.execute(
                                """INSERT INTO streams (name, tag, color, channel_id, video_id, link, icon_url)
                                   VALUES ($1, $2, $3, NULL, $4, $5, $6)
                                   ON CONFLICT (tag) DO NOTHING""",
                                new_name, new_tag, row["color"], vid, new_link, icon_url,
                            )
                        print(f"               -> Added {new_tag}: {title} ({vid})")
                        summary.append(f"{new_tag}: {new_name}")

            else:
                # Update icon for main stream if needed
                if not DRY_RUN and icon_url:
                    async with pool.acquire() as conn:
                        await conn.execute(
                            "UPDATE streams SET icon_url = $1 WHERE tag = $2",
                            icon_url, row["tag"]
                        )

    await pool.close()

    if summary:
        print(f"\nAdded {len(summary)} stream(s):")
        for s in summary:
            print(f"  {s}")
    else:
        print("\nNo new streams added.")


if __name__ == "__main__":
    # Only run when explicitly enabled via environment variable to avoid
    # accidental scraping and to encourage use of the YouTube Data API.
    if os.environ.get("ENABLE_SCRAPER", "0") == "1":
        asyncio.run(main())
    else:
        print("tools/scan_live_streams.py: scraper disabled by default. Set ENABLE_SCRAPER=1 to run (local testing only).")
