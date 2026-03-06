"""Beholder — live news stream aggregator"""
import asyncio
import collections
import hashlib
import hmac
import json
import os
import re
import secrets
import time
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from contextlib import asynccontextmanager
from typing import Optional

import asyncpg
import httpx
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.security import APIKeyHeader
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

DATABASE_URL     = os.environ.get("DATABASE_URL", "postgresql://beholder:beholder@db:5432/beholder")
API_KEY          = os.environ.get("API_KEY")
YT_KEY           = os.environ.get("YT_KEY", "")
REFRESH_INTERVAL = int(os.environ.get("REFRESH_INTERVAL", 1800))  # rotating streams poll interval (default 30 min)
STABLE_REFRESH_INTERVAL = int(os.environ.get("STABLE_REFRESH_INTERVAL", 21600))  # stable-video-id poll interval (default 6 hours)

ADMIN_PHONE_NUM   = os.environ.get("ADMIN_PHONE_NUM", "")
ADMIN_SECRET      = os.environ.get("ADMIN_SECRET", secrets.token_hex(32))
STYTCH_PROJECT_ID = os.environ.get("STYTCH_PROJECT_ID", "")
STYTCH_SECRET     = os.environ.get("STYTCH_SECRET", "")

def _stytch_base() -> str:
    return "https://test.stytch.com/v1" if "test" in STYTCH_PROJECT_ID else "https://api.stytch.com/v1"

def _make_admin_token() -> str:
    ts = str(int(time.time()))
    sig = hmac.new(ADMIN_SECRET.encode(), ts.encode(), hashlib.sha256).hexdigest()
    return f"{ts}.{sig}"

def _verify_admin_token(token: str) -> bool:
    try:
        ts, sig = token.rsplit(".", 1)
        expected = hmac.new(ADMIN_SECRET.encode(), ts.encode(), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected):
            return False
        if time.time() - int(ts) > 86400:
            return False
        return True
    except Exception:
        return False

_api_key_header   = APIKeyHeader(name="X-API-Key",    auto_error=False)
_admin_key_header = APIKeyHeader(name="X-Admin-Token", auto_error=False)

async def require_api_key(key: str = Security(_api_key_header)):
    if not API_KEY or key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API key")
    return key

async def require_admin(token: str = Security(_admin_key_header)):
    if not token or not _verify_admin_token(token):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    return token

RSS_FEEDS = [
    ("BBC",      "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("CNN",      "http://rss.cnn.com/rss/edition.rss"),
    ("REUTERS",  "https://feeds.reuters.com/reuters/worldNews"),
    ("AP",       "https://feeds.apnews.com/apnews/topnews"),
    ("FT",       "https://www.ft.com/world?format=rss"),
    ("RCP",      "https://www.realclearpolitics.com/index.xml"),
    ("AXIOS",    "https://api.axios.com/feed/"),
    ("THEHILL",  "https://thehill.com/feed/"),
    ("POLITICO", "https://rss.politico.com/congress.xml"),
]


# ── Pydantic models ────────────────────────────────────────────────────────────

class StreamOut(BaseModel):
    name:       str
    tag:        str
    color:      str
    embed_url:  Optional[str]
    video_id:   Optional[str] = None
    last_live_at: Optional[float] = None
    is_live:    bool = False
    link:       str
    region:     Optional[str] = None
    subregion:  Optional[str] = None
    bias_label: Optional[str] = None
    bias_color: Optional[str] = None
    bias_title: Optional[str] = None
    government_funded: Optional[bool] = None
    icon_url: Optional[str] = None

    model_config = {"from_attributes": True}


class StreamCreate(BaseModel):
    name:       str
    tag:        str
    color:      str = "#444444"
    channel_id: Optional[str] = None
    video_id:   Optional[str] = None
    link:       str
    icon_url:   Optional[str] = None


class VideoIdUpdate(BaseModel):
    video_id: str


class NewsItem(BaseModel):
    source: str
    title:  str
    link:   str



# ── Helpers ────────────────────────────────────────────────────────────────────

def build_embed_url(row: asyncpg.Record) -> Optional[str]:
    if row["video_id"]:
        return f"https://www.youtube.com/embed/{row['video_id']}?autoplay=1&modestbranding=1&enablejsapi=1"
    return None


# How long after `last_live_at` we consider a stream to still be "live" (seconds)
LIVE_TTL = max(int(REFRESH_INTERVAL * 1.5), 300)




async def fetch_channel_video_ids(client: httpx.AsyncClient, channel_id: str) -> list[str]:
    """Fetch the 15 most recent video IDs for a channel using YouTube Data API activities.list.
    This replaces the previous RSS-based approach. If `YT_KEY` is not configured, returns an empty list.
    Uses `activities.list?part=contentDetails&channelId=...` and extracts upload videoIds.
    """
    if not YT_KEY:
        return []
    url = (
        f"https://www.googleapis.com/youtube/v3/activities"
        f"?part=contentDetails&channelId={channel_id}&maxResults=15&key={YT_KEY}"
    )
    try:
        r = await client.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=15)
        if r.status_code != 200:
            _log.warning("[fetch_channel_video_ids] non-200 for channel %s: %s", channel_id, r.status_code)
            return []
        items = r.json().get("items", [])
        vids: list[str] = []
        for it in items:
            cd = it.get("contentDetails", {})
            # uploads
            if cd.get("upload") and cd["upload"].get("videoId"):
                vids.append(cd["upload"]["videoId"])
            # for completeness, check other possible fields
            elif cd.get("videoId"):
                vids.append(cd.get("videoId"))
        _log.debug("[fetch_channel_video_ids] channel %s -> %d vids", channel_id, len(vids))
        return vids[:15]
    except Exception:
        _log.exception("[fetch_channel_video_ids] error fetching channel %s", channel_id)
        return []


async def batch_check_live(client: httpx.AsyncClient, video_ids: list[str]) -> set[str]:
    """Return the set of video IDs that are currently live.
    Batches 50 IDs per videos.list call (1 quota unit per batch)."""
    if not YT_KEY or not video_ids:
        return set()
    live: set[str] = set()
    for i in range(0, len(video_ids), 50):
        batch = video_ids[i:i + 50]
        url = (
            f"https://www.googleapis.com/youtube/v3/videos"
            f"?part=snippet&id={','.join(batch)}&key={YT_KEY}"
            f"&fields=items(id,snippet/liveBroadcastContent)"
        )
        try:
            _log.debug("[batch_check_live] checking batch size=%d", len(batch))
            r = await client.get(url, headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code != 200:
                _log.warning("[batch_check_live] videos.list returned %s for batch starting %s", r.status_code, batch[0])
                continue
            for item in r.json().get("items", []):
                if item.get("snippet", {}).get("liveBroadcastContent") == "live":
                    live.add(item["id"])
        except Exception:
            _log.exception("[batch_check_live] error checking videos: %s", batch[:3])
    return live



async def refresh_loop(pool: asyncpg.Pool) -> None:
    await asyncio.sleep(5)
    while True:
        try:
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    "SELECT tag, channel_id, video_id, stable_video_id FROM streams "
                    "WHERE channel_id IS NOT NULL AND channel_id != ''"
                )
            _log.info("[refresh] fetched %d channel rows (stable=%d rotating=%d)",
                      len(rows),
                      len([r for r in rows if r["stable_video_id"]]),
                      len([r for r in rows if not r["stable_video_id"]]),
            )

            # If a stream is marked `stable_video_id` but has no `video_id` stored,
            # clear the `stable_video_id` flag so we treat it as rotating.
            if rows:
                tags_to_clear = [r['tag'] for r in rows if r['stable_video_id'] and not r['video_id']]
                if tags_to_clear:
                    async with pool.acquire() as _conn:
                        await _conn.execute(
                            "UPDATE streams SET stable_video_id = FALSE WHERE tag = ANY($1::text[])",
                            tags_to_clear,
                        )
                    _log.info("[refresh] cleared stable_video_id for %d streams (missing video_id): %s", len(tags_to_clear), tags_to_clear[:10])

            if not rows:
                _log.warning("[refresh] no streams with channel_id — skipping")
                await asyncio.sleep(REFRESH_INTERVAL)
                continue

            stable_rows   = [r for r in rows if r["stable_video_id"]]
            rotating_rows = [r for r in rows if not r["stable_video_id"]]

            # current time used for scheduling stable checks
            now = time.time()

            async with httpx.AsyncClient(timeout=15) as client:
                channel_videos: dict[str, list[str]] = {}
                all_video_ids: list[str] = []
                seen: set[str] = set()

                # Stable channels: only poll these every STABLE_REFRESH_INTERVAL
                stable_last_checked: dict = getattr(app.state, "stable_last_checked", {})
                for row in stable_rows:
                    tag = row["tag"]
                    vid = row["video_id"]
                    last = stable_last_checked.get(tag, 0)
                    # include in this run only if we have a vid and it's due for a check
                    if vid and (now - last >= STABLE_REFRESH_INTERVAL):
                        channel_videos[tag] = [vid]
                        if vid not in seen:
                            seen.add(vid)
                            all_video_ids.append(vid)
                        stable_last_checked[tag] = now
                    else:
                        channel_videos[tag] = [vid] if vid else []
                # log which stable channels we included vs skipped
                included = [r['tag'] for r in stable_rows if r['video_id'] and (now - stable_last_checked.get(r['tag'], 0) < 1e-6)]
                skipped = [r['tag'] for r in stable_rows if r['video_id'] and (now - stable_last_checked.get(r['tag'], 0) >= STABLE_REFRESH_INTERVAL)]
                _log.info("[refresh] stable included=%d skipped=%d", len(included), len(skipped))

                # Rotating channels: use YouTube Data API activities.list (replaces RSS)
                rss_results = await asyncio.gather(
                    *[fetch_channel_video_ids(client, r["channel_id"]) for r in rotating_rows],
                    return_exceptions=True,
                )
                for row, result in zip(rotating_rows, rss_results):
                    vids = result if isinstance(result, list) else []
                    channel_videos[row["tag"]] = vids
                    for vid in vids:
                        if vid not in seen:
                            seen.add(vid)
                            all_video_ids.append(vid)

                # Single batched API call to find which videos are live
                live_ids = await batch_check_live(client, all_video_ids)

                now = time.time()
                async with pool.acquire() as conn:
                    for row in rows:
                        tag = row["tag"]
                        vids = channel_videos.get(tag, [])
                        live_vid = next((v for v in vids if v in live_ids), None)

                        if live_vid:
                            await conn.execute(
                                "UPDATE streams SET video_id = $1, last_live_at = to_timestamp($2) WHERE tag = $3",
                                live_vid, now, tag,
                            )
                            _log.info("[refresh] live: %s → %s", tag, live_vid)
                        else:
                            cur = await conn.fetchrow(
                                "SELECT last_live_at FROM streams WHERE tag = $1", tag
                            )
                            if cur and cur["last_live_at"]:
                                if now - cur["last_live_at"].timestamp() > LIVE_TTL:
                                    if row["stable_video_id"]:
                                        # Preserve video_id — same ID will come back live
                                        await conn.execute(
                                            "UPDATE streams SET last_live_at = NULL WHERE tag = $1",
                                            tag,
                                        )
                                    else:
                                        # Rotating: clear video_id too — it won't be reused
                                        await conn.execute(
                                            "UPDATE streams SET video_id = NULL, last_live_at = NULL WHERE tag = $1",
                                            tag,
                                        )
                                    _log.info("[refresh] cleared stale: %s", tag)
                    # persist updated stable check timestamps back to app state
                    try:
                        app.state.stable_last_checked = stable_last_checked
                    except Exception:
                        pass
            _log.info(
                "[refresh] done — %d live, %d channels checked, %d unique videos tested",
                len(live_ids), len(rows), len(all_video_ids),
            )
            try:
                app.state.last_refresh = time.time()
            except Exception:
                pass
        except Exception as e:
            _log.error("[refresh] error: %s", e)
        await asyncio.sleep(REFRESH_INTERVAL)


# ── App ────────────────────────────────────────────────────────────────────────

ADMIN_ENABLED = bool(ADMIN_PHONE_NUM and STYTCH_PROJECT_ID and STYTCH_SECRET)


import logging
_log = logging.getLogger("uvicorn.error")

class _LogBuffer(logging.Handler):
    def __init__(self, maxlen: int = 500):
        super().__init__()
        self._records: collections.deque = collections.deque(maxlen=maxlen)

    def emit(self, record: logging.LogRecord) -> None:
        self._records.append({
            "ts":    record.created,
            "level": record.levelname,
            "msg":   record.getMessage(),
        })

    def entries(self) -> list:
        return list(self._records)

_log_buffer = _LogBuffer()
logging.getLogger().addHandler(_log_buffer)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if ADMIN_ENABLED:
        _log.info("[admin] admin panel enabled")
    else:
        missing = [k for k, v in {
            "ADMIN_PHONE_NUM": ADMIN_PHONE_NUM,
            "STYTCH_PROJECT_ID": STYTCH_PROJECT_ID,
            "STYTCH_SECRET": STYTCH_SECRET,
        }.items() if not v]
        _log.warning("[admin] admin panel disabled — missing env vars: %s", ", ".join(missing))
    pool = await asyncpg.create_pool(DATABASE_URL)
    app.state.pool = pool
    # Track last-checked timestamps for stable-video-id channels so we poll them less often
    app.state.stable_last_checked = {}
    task = asyncio.create_task(refresh_loop(pool))
    yield
    task.cancel()
    await pool.close()


app = FastAPI(
    title="Beholder",
    description="Live news stream aggregator — streams and headlines API.",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Stream routes ──────────────────────────────────────────────────────────────

@app.get(
    "/api/streams",
    response_model=list[StreamOut],
    tags=["Streams"],
    summary="List all streams",
    description="Returns all configured live streams ordered by insertion order, with prebuilt YouTube embed URLs.",
)
async def get_streams():
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM streams ORDER BY id")
    out = []
    now = time.time()
    for r in rows:
        last_ts = (r["last_live_at"].timestamp() if r["last_live_at"] else None)
        is_live = bool(last_ts and (now - last_ts) <= LIVE_TTL)
        embed = build_embed_url(r) if is_live else None
        out.append(StreamOut(
            name=r["name"], tag=r["tag"], color=r["color"],
            embed_url=embed,
            video_id=r.get("video_id"),
            last_live_at=last_ts,
            is_live=is_live,
            link=r["link"],
            region=r["region"], subregion=r["subregion"],
            bias_label=r["bias_label"], bias_color=r["bias_color"], bias_title=r["bias_title"],
            government_funded=r["government_funded"],
            icon_url=r["icon_url"],
        ))
    return out


@app.post(
    "/api/streams",
    response_model=StreamOut,
    tags=["Streams"],
    summary="Add a new stream",
    status_code=201,
    dependencies=[Depends(require_api_key)],
)
async def create_stream(body: StreamCreate):
    """Add a new live stream channel to the database."""
    async with app.state.pool.acquire() as conn:
        try:
            row = await conn.fetchrow(
                """INSERT INTO streams (name, tag, color, channel_id, video_id, link)
                   VALUES ($1, $2, $3, $4, $5, $6) RETURNING *""",
                body.name, body.tag.upper(), body.color,
                body.channel_id, body.video_id, body.link,
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Tag already exists")
    return StreamOut(
        name=row["name"], tag=row["tag"], color=row["color"],
        embed_url=build_embed_url(row),
        video_id=row.get("video_id"),
        last_live_at=(row["last_live_at"].timestamp() if row["last_live_at"] else None),
        is_live=bool(row["last_live_at"] and (time.time() - row["last_live_at"].timestamp() <= LIVE_TTL)),
        link=row["link"],
        region=row["region"], subregion=row["subregion"],
        bias_label=row["bias_label"], bias_color=row["bias_color"], bias_title=row["bias_title"],
        government_funded=row.get("government_funded"),
        icon_url=row["icon_url"],
    )



@app.patch(
    "/api/streams/{tag}/video_id",
    response_model=StreamOut,
    tags=["Streams"],
    summary="Update a stream's video ID",
    description="Manually set the live video ID for a stream. Use this when YouTube rotates the stream URL.",
    dependencies=[Depends(require_api_key)],
)
async def update_video_id(tag: str, body: VideoIdUpdate):
    async with app.state.pool.acquire() as conn:
        row = await conn.fetchrow(
            "UPDATE streams SET video_id = $1 WHERE UPPER(tag) = UPPER($2) RETURNING *",
            body.video_id, tag,
        )
        if not row:
            raise HTTPException(status_code=404, detail="Stream not found")
    return StreamOut(
        name=row["name"], tag=row["tag"], color=row["color"],
        embed_url=build_embed_url(row),
        video_id=row.get("video_id"),
        last_live_at=(row["last_live_at"].timestamp() if row["last_live_at"] else None),
        is_live=bool(row["last_live_at"] and (time.time() - row["last_live_at"].timestamp() <= LIVE_TTL)),
        link=row["link"],
        region=row["region"], subregion=row["subregion"],
        bias_label=row["bias_label"], bias_color=row["bias_color"], bias_title=row["bias_title"],
        government_funded=row.get("government_funded"),
        icon_url=row["icon_url"],
    )


# ── Drudge scraper ─────────────────────────────────────────────────────────────

class _DrudgeParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self._href = ''
        self._in_a = False
        self.items: list[tuple[str, str]] = []

    def handle_starttag(self, tag, attrs):
        if tag == 'a':
            self._in_a = True
            self._href = dict(attrs).get('href', '')

    def handle_endtag(self, tag):
        if tag == 'a':
            self._in_a = False

    def handle_data(self, data):
        text = data.strip()
        if (self._in_a and len(text) > 20
                and self._href.startswith('http')
                and 'drudgereport' not in self._href):
            self.items.append((text, self._href))


async def fetch_drudge(client: httpx.AsyncClient) -> list[NewsItem]:
    try:
        r = await client.get(
            'https://www.drudgereport.com',
            headers={'User-Agent': 'Mozilla/5.0'},
        )
        p = _DrudgeParser()
        p.feed(r.text)
        seen = set()
        items = []
        for title, link in p.items:
            if link not in seen:
                seen.add(link)
                items.append(NewsItem(source='DRUDGE', title=title, link=link))
        return items[:30]
    except Exception:
        return []


# ── News routes ────────────────────────────────────────────────────────────────

_news_cache: dict = {"ts": 0.0, "data": []}
NEWS_CACHE_TTL = 300  # 5 minutes

@app.get(
    "/api/news",
    response_model=list[NewsItem],
    tags=["News"],
    summary="Get latest headlines",
    description="Fetches and aggregates the latest headlines from BBC, CNN, Reuters, AP, and FT RSS feeds. Cached for 5 minutes.",
)
async def get_news():
    now = time.time()
    if now - _news_cache["ts"] < NEWS_CACHE_TTL and _news_cache["data"]:
        return _news_cache["data"]
    items = []
    async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
        rss_task = asyncio.gather(*[
            asyncio.to_thread(_fetch_rss, source, url)
            for source, url in RSS_FEEDS
        ])
        rss_results, drudge_items = await asyncio.gather(rss_task, fetch_drudge(client))
        for batch in rss_results:
            items.extend(batch)
        items.extend(drudge_items)
    
    if items:
        # Group headlines by source for round-robin ordering
        by_source = {}
        source_order = [source for source, _ in RSS_FEEDS] + ["DRUDGE"]
        
        for item in items:
            if item.source not in by_source:
                by_source[item.source] = []
            by_source[item.source].append(item)
        
        # Interleave headlines from different sources in round-robin fashion
        # Iterate through sources in consistent order, taking one item at a time from each
        ordered_items = []
        max_per_source = max(len(headlines) for headlines in by_source.values()) if by_source else 0
        
        for i in range(max_per_source):
            for source in source_order:
                if source in by_source and i < len(by_source[source]):
                    ordered_items.append(by_source[source][i])
        
        _news_cache["ts"] = now
        _news_cache["data"] = ordered_items
        return ordered_items
    return items


def _fetch_rss(source: str, url: str) -> list[NewsItem]:
    import httpx as _httpx
    try:
        r = _httpx.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=10, follow_redirects=True)
        root = ET.fromstring(r.text)
        return [
            NewsItem(source=source, title=(i.findtext("title") or "").strip(), link=(i.findtext("link") or "").strip())
            for i in root.findall(".//item")[:10]
            if (i.findtext("title") or "").strip()
        ]
    except Exception:
        return []


# ── Stocks ─────────────────────────────────────────────────────────────────────

STOCK_SYMBOLS = [
    # US Indices
    "^GSPC", "^DJI", "^IXIC", "^RUT", "^VIX",
    # Europe indices
    "^FTSE", "^GDAXI", "^FCHI", "^STOXX50E",
    # Asia indices
    "^N225", "^HSI", "^AXJO", "000001.SS",
    # Mega-cap tech
    "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA",
    # Finance / energy
    "JPM", "GS", "BAC", "XOM", "WMT", "BRK-B",
    # Defense / MIC
    "LMT", "RTX", "NOC", "GD", "BA", "LHX", "HII", "LDOS", "SAIC", "KTOS", "PLTR",
    # Commodities
    "GC=F", "SI=F", "CL=F",
    # Crypto
    "BTC-USD", "ETH-USD",
]

class StockItem(BaseModel):
    symbol:  str
    name:    str
    price:   float
    change:  float
    pct:     float

_stock_cache: dict = {"ts": 0.0, "data": [], "crumb": "", "cookies": {}}

async def _yahoo_crumb(client: httpx.AsyncClient) -> str:
    await client.get("https://fc.yahoo.com", headers={"User-Agent": "Mozilla/5.0"})
    r = await client.get("https://query2.finance.yahoo.com/v1/test/getcrumb", headers={"User-Agent": "Mozilla/5.0"})
    return r.text.strip()

async def _fetch_stocks() -> list[StockItem]:
    import time
    now = time.monotonic()
    if now - _stock_cache["ts"] < 60 and _stock_cache["data"]:
        return _stock_cache["data"]
    symbols = ",".join(STOCK_SYMBOLS)
    fields = "regularMarketPrice,regularMarketChange,regularMarketChangePercent,shortName"
    try:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            crumb = await _yahoo_crumb(client)
            quote_url = f"https://query2.finance.yahoo.com/v7/finance/quote?symbols={symbols}&crumb={crumb}&fields={fields}"
            r = await client.get(quote_url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
        results = r.json().get("quoteResponse", {}).get("result", [])
        items = [
            StockItem(
                symbol=q["symbol"],
                name=q.get("shortName", q["symbol"]),
                price=q.get("regularMarketPrice", 0),
                change=q.get("regularMarketChange", 0),
                pct=q.get("regularMarketChangePercent", 0),
            )
            for q in results
        ]
        if items:
            _stock_cache["ts"] = now
            _stock_cache["data"] = items
        return items
    except Exception:
        return _stock_cache.get("data", [])


@app.get("/api/stocks", response_model=list[StockItem], tags=["Stocks"], summary="Market quotes")
async def get_stocks():
    return await _fetch_stocks()


# ── Admin models ───────────────────────────────────────────────────────────────

class OTPRequest(BaseModel):
    phone: str

class OTPVerify(BaseModel):
    method_id: str
    code: str

class StreamUpdate(BaseModel):
    name:             Optional[str]  = None
    color:            Optional[str]  = None
    link:             Optional[str]  = None
    region:           Optional[str]  = None
    subregion:        Optional[str]  = None
    bias_label:       Optional[str]  = None
    bias_color:       Optional[str]  = None
    bias_title:       Optional[str]  = None
    government_funded: Optional[bool] = None
    video_id:         Optional[str]  = None
    icon_url:         Optional[str]  = None
    stable_video_id:  Optional[bool] = None


# ── Admin auth routes ───────────────────────────────────────────────────────────

@app.post("/api/admin/send-otp", tags=["Admin"])
async def admin_send_otp(body: OTPRequest):
    if not ADMIN_ENABLED:
        raise HTTPException(status_code=503, detail="Admin panel not configured")
    phone = body.phone.strip()
    if phone != ADMIN_PHONE_NUM:
        raise HTTPException(status_code=403, detail="Phone number not authorized")
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_stytch_base()}/otps/sms/send",
            auth=(STYTCH_PROJECT_ID, STYTCH_SECRET),
            json={"phone_number": phone},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail=resp.json().get("message", "Stytch error"))
    return {"method_id": resp.json()["phone_id"]}


@app.post("/api/admin/verify-otp", tags=["Admin"])
async def admin_verify_otp(body: OTPVerify):
    if not ADMIN_ENABLED:
        raise HTTPException(status_code=503, detail="Admin panel not configured")
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            f"{_stytch_base()}/otps/authenticate",
            auth=(STYTCH_PROJECT_ID, STYTCH_SECRET),
            json={"method_id": body.method_id, "code": body.code, "session_duration_minutes": 1440},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired code")
    return {"token": _make_admin_token()}


# ── Admin stream routes ─────────────────────────────────────────────────────────

@app.get("/api/admin/streams", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_list_streams():
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM streams ORDER BY region NULLS LAST, tag")
    return [
        {k: (v.isoformat() if hasattr(v, 'isoformat') else v) for k, v in dict(r).items()}
        for r in rows
    ]


@app.post("/api/admin/streams/lookup", tags=["Admin"])
async def admin_lookup_stream(body: dict):
    handle = body.get("handle", "").strip().lstrip("@")
    if not handle:
        raise HTTPException(status_code=400, detail="Handle required")
    if not YT_KEY:
        raise HTTPException(status_code=503, detail="YT_KEY not configured — cannot look up channel")

    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(
            f"https://www.googleapis.com/youtube/v3/channels"
            f"?part=snippet&forHandle=@{handle}&key={YT_KEY}"
        )
    items = r.json().get("items", [])
    if not items:
        raise HTTPException(status_code=404, detail=f"Channel @{handle} not found via YouTube API")

    item = items[0]
    channel_id = item["id"]
    snippet = item.get("snippet", {})
    name = snippet.get("title", handle)
    icon_url = snippet.get("thumbnails", {}).get("default", {}).get("url", "")
    tag = re.sub(r'[^A-Z0-9]', '', handle.upper())[:10]
    link = f"https://www.youtube.com/@{handle}/live"

    return {
        "name": name, "tag": tag, "link": link,
        "video_id": "", "color": "#444444",
        "channel_id": channel_id, "icon_url": icon_url,
    }


@app.put("/api/admin/streams/{tag}", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_update_stream(tag: str, body: StreamUpdate):
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="Nothing to update")
    set_parts = [f"{k} = ${i + 2}" for i, k in enumerate(fields)]
    async with app.state.pool.acquire() as conn:
        result = await conn.execute(
            f"UPDATE streams SET {', '.join(set_parts)} WHERE tag = $1",
            tag, *fields.values(),
        )
    if result == "UPDATE 0":
        raise HTTPException(status_code=404, detail="Stream not found")
    return {"ok": True}


@app.delete("/api/admin/streams/{tag}", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_delete_stream(tag: str):
    async with app.state.pool.acquire() as conn:
        result = await conn.execute("DELETE FROM streams WHERE tag = $1", tag)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Stream not found")
    return {"ok": True}


@app.post("/api/admin/streams", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_create_stream(body: dict):
    tag  = re.sub(r'\s+', '', (body.get("tag") or "").upper())
    name = (body.get("name") or "").strip()
    link = (body.get("link") or "").strip()
    if not tag or not name or not link:
        raise HTTPException(status_code=400, detail="tag, name, and link are required")
    async with app.state.pool.acquire() as conn:
        try:
            await conn.execute(
                """INSERT INTO streams
                   (tag, name, color, link, video_id, region, subregion,
                    bias_label, bias_color, bias_title, government_funded, icon_url)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)""",
                tag, name,
                body.get("color", "#444444"),
                link,
                body.get("video_id") or None,
                body.get("region") or None,
                body.get("subregion") or None,
                body.get("bias_label") or None,
                body.get("bias_color") or None,
                body.get("bias_title") or None,
                bool(body.get("government_funded", False)),
                body.get("icon_url") or None,
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail=f"Tag '{tag}' already exists")
    return {"ok": True, "tag": tag}


@app.post("/api/admin/streams/rescrape", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_rescrape_streams():
    """Manually trigger a refresh of all streams via RSS + YouTube Data API."""
    async with app.state.pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT tag, channel_id, video_id, stable_video_id FROM streams "
            "WHERE channel_id IS NOT NULL AND channel_id != ''"
        )
    if not rows:
        return {"ok": True, "updated": 0, "skipped": 0, "message": "No streams with channel_id"}

    stable_rows   = [r for r in rows if r["stable_video_id"]]
    rotating_rows = [r for r in rows if not r["stable_video_id"]]

    async with httpx.AsyncClient(timeout=30) as client:
        channel_videos: dict[str, list[str]] = {}
        all_video_ids: list[str] = []
        seen: set[str] = set()

        # Stable: check existing video_id directly
        for row in stable_rows:
            vid = row["video_id"]
            channel_videos[row["tag"]] = [vid] if vid else []
            if vid and vid not in seen:
                seen.add(vid)
                all_video_ids.append(vid)

        # Rotating: RSS to find recent candidates
        rss_results = await asyncio.gather(
            *[fetch_channel_video_ids(client, r["channel_id"]) for r in rotating_rows],
            return_exceptions=True,
        )
        for row, result in zip(rotating_rows, rss_results):
            vids = result if isinstance(result, list) else []
            channel_videos[row["tag"]] = vids
            for vid in vids:
                if vid not in seen:
                    seen.add(vid)
                    all_video_ids.append(vid)

        live_ids = await batch_check_live(client, all_video_ids)

        now = time.time()
        updated = 0
        skipped = 0
        async with app.state.pool.acquire() as conn:
            for row in rows:
                tag = row["tag"]
                vids = channel_videos.get(tag, [])
                live_vid = next((v for v in vids if v in live_ids), None)
                if live_vid:
                    await conn.execute(
                        "UPDATE streams SET video_id = $1, last_live_at = to_timestamp($2) WHERE tag = $3",
                        live_vid, now, tag,
                    )
                    updated += 1
                else:
                    skipped += 1

    return {"ok": True, "updated": updated, "skipped": skipped}


@app.get("/api/admin/logs", tags=["Admin"], dependencies=[Depends(require_admin)])
async def admin_logs():
    return _log_buffer.entries()


from fastapi.responses import FileResponse

@app.get("/api/refresh_status")
async def refresh_status():
    """Public endpoint reporting last refresh timestamp and interval (seconds)."""
    last = getattr(app.state, 'last_refresh', None)
    return {"last_refresh": last, "interval": REFRESH_INTERVAL, "stable_interval": STABLE_REFRESH_INTERVAL}


@app.get("/admin", include_in_schema=False)
@app.get("/admin/{rest:path}", include_in_schema=False)
async def spa_fallback():
    return FileResponse("static/index.html")

app.mount("/", StaticFiles(directory="static", html=True), name="static")
