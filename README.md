# Beholder

![Beholder](logo.png)

> **[beholder.aaronjenkins.net](https://beholder.aaronjenkins.net/)** · Vibe coded with [Claude](https://claude.ai) · Logo via [PNGWing](https://www.pngwing.com/en/free-png-dwzvq) · [MIT License](LICENSE)
>
> ☕ **[Support this project on Ko-fi](https://ko-fi.com/aaronjenkins)**

Live global news stream aggregator. Watch up to 60+ simultaneous YouTube live streams in a resizable multistream grid, with scrolling news and market tickers.

## Features

- **Multistream viewer** — select any number of channels; grid auto-layouts to fill the screen at 16:9
- **Smart column defaults** — 1 stream → 1 column, 2 streams → 2 columns, 3+ → auto-layout; manually override with ±
- **Region toggles** — hover a region to see its channels in a dropdown grid; click the region name to toggle all at once
- **Subregion menus** — channels grouped by country/city in a 4-column grid; click a subregion label to toggle all its streams
- **Bias filter toolbar** — after selecting a region, filter by political leaning (L / L– / C / R– / R)
- **Bias & government-funding badges** — per-channel indicators on stream pills
- **Modes dropdown** — Big Brain (60+ simultaneous streams) and All Channels presets
- **Channel icons** — thumbnail icons on stream pills and stream cell hover bars
- **Per-stream controls** — hover any stream cell to reveal a top bar with mute, focus, open-on-YouTube (↗), and close (✕)
- **Focus / pin** — expand a stream into a pinned panel above the grid (double-row height); hover to return it to the grid
- **Global mute / per-stream mute** — mute all at once or individual streams independently
- **Subtitles** — CC toggle for all streams simultaneously
- **Live count indicator** — blinking red dot and live channel count in the header, excluding break streams
- **Raw Webcam Feeds** — live OSINT and intel camera feeds (INQUIZE, INTELUA, INTELME, OSINTUA, OSINTIR)
- **Take a Break** — curated 24/7 relaxation streams (lo-fi, aquariums, nature, retro TV); picks one at random; hides tickers and stream controls
- **News ticker** — scrolling headlines from BBC, CNN, Reuters, AP, FT, RCP, Axios, The Hill, Politico, Drudge; per-source toggles
- **Market ticker** — live quotes for US/Europe/Asia indices, tech, finance, energy, defense, commodities, and crypto; group toggles; hover to pause; click to open Yahoo Finance
- **Mobile** — single-column vertical stack on small screens; swipe left to close the channel menu
**Auto-refresh** — background job polls YouTube for live status and keeps stream IDs current.
 Rotating streams are polled every `REFRESH_INTERVAL` (default 30 minutes).
 Streams with a stable video ID are polled less frequently every `STABLE_REFRESH_INTERVAL` (default 6 hours).
 This polling uses the YouTube Data API and requires a `YT_KEY` API key (see env vars below).


## Channels

Bias ratings based on [AllSides](https://www.allsides.com/media-bias/ratings) and [Ad Fontes Media](https://adfontesmedia.com/).

| Tag | Network | Region | Bias |
|-----|---------|--------|------|
| NBC | NBC News Now | US | Lean Left |
| ABC | ABC News Live | US | Lean Left |
| CBS | CBS News | US | Lean Left |
| Scripps | Scripps News | US | Center |
| FOXNOW | Fox News Now | US | Right |
| FOXBIZ | Fox Business | US | Lean Right |
| FOXWX | Fox Weather | US | Center |
| OAN | OAN | US | Right |
| THEHILL | The Hill | US | Center |
| CSPAN | C-SPAN | US | Center |
| PBS | PBS NewsHour | US | Center |
| BBG | Bloomberg | US | Center |
| CNBC | CNBC Television | US | Center |
| AP | Associated Press | US | Center |
| FORBES | Forbes Breaking News | US | Center |
| COURTTV | Court TV | US | Center |
| BBC | BBC News | Europe / UK | Center |
| SKY | Sky News | Europe / UK | Center |
| CH4 | Channel 4 News | Europe / UK | Lean Left |
| ITV | ITV News | Europe / UK | Center |
| GBNEWS | GB News | Europe / UK | Lean Right |
| LBC | LBC | Europe / UK | Center |
| F24 | France 24 English | Europe / France | Center |
| BFMTV | BFM TV | Europe / France | Center |
| LCI | LCI | Europe / France | Center |
| DW | DW News | Europe / Germany | Center |
| ZDFTV | ZDF | Europe / Germany | Center |
| TAGESSCHAU | Tagesschau | Europe / Germany | Center |
| EU | Euronews | Europe / International | Center |
| REUTERS | Reuters | Europe / International | Center |
| SKYTG24 | Sky TG24 | Europe / Italy | Center |
| RAINEWS | Rai News | Europe / Italy | Center |
| RTVE | RTVE | Europe / Spain | Center |
| NOS | NOS | Europe / Netherlands | Center |
| TVPWORLD | TVP World | Europe / Poland | Center |
| AJE | Al Jazeera English | Middle East | Lean Left |
| i24 | i24 News | Middle East / Israel | Lean Right |
| TRT | TRT World | Middle East / Turkey | Lean Right |
| ALARABIYA | Al Arabiya | Middle East / Saudi/Gulf | Lean Right |
| IRANINTL | Iran International | Middle East / Iran | Lean Right |
| NDTV | NDTV | India | Center |
| WION | WION | India | Lean Right |
| FP | Firstpost | India | Lean Right |
| CNN18 | CNN-News18 | India | Center |
| ZEE | Zee News | India | Right |
| GEO | Geo News | Pakistan | Center |
| ARY | ARY News | Pakistan | Center |
| SAMAA | Samaa TV | Pakistan | Center |
| NHK | NHK World Japan | Asia-Pacific / Japan | Center |
| CNA | CNA | Asia-Pacific / Singapore | Center |
| ABCAU | ABC News Australia | Asia-Pacific / Australia | Lean Left |
| SKYAU | Sky News Australia | Asia-Pacific / Australia | Right |
| ARIRANG | Arirang News | Asia-Pacific / South Korea | Center |
| CGTN | CGTN | Asia-Pacific / China | Left |
| TLMD | Noticias Telemundo | Central & South America | Lean Left |
| TODON | Todo Noticias | Central & South America / Argentina | Lean Right |
| CNNBR | CNN Brasil | Central & South America / Brazil | Lean Left |
| MLN | Milenio | Central & South America / Mexico | Center |
| CARACOL | Noticias Caracol | Central & South America / Colombia | Center |
| BBCM | BBC News Mundo | Central & South America | Center |
| INQUIZE | Inquize X | Raw Webcam Feeds | — |
| INQUIZE2 | Inquize X 2 | Raw Webcam Feeds | — |
| INQUIZE3 | Inquize X 3 | Raw Webcam Feeds | — |
| INTELUA | Intel Cam Ukraine | Raw Webcam Feeds | — |
| INTELME | Intel Cam Middle East | Raw Webcam Feeds | — |
| OSINTUA | OSINT Collective Ukraine | Raw Webcam Feeds | — |
| OSINTIR | OSINT Collective Iran/Israel | Raw Webcam Feeds | — |

## News Sources

| Source | Publication | Bias |
|--------|-------------|------|
| BBC | BBC News | Center |
| CNN | CNN | Lean Left |
| REUTERS | Reuters | Center |
| AP | Associated Press | Center |
| FT | Financial Times | Center |
| RCP | RealClearPolitics | Lean Right |
| AXIOS | Axios | Lean Left |
| THEHILL | The Hill | Center |
| POLITICO | Politico | Lean Left |
| DRUDGE | Drudge Report | Right |

## Market Data

| Group | Symbols |
|-------|---------|
| US | S&P 500, DOW, NASDAQ, RUSSELL 2000, VIX |
| Europe | FTSE 100, DAX, CAC 40, Euro Stoxx 50 |
| Asia | Nikkei 225, Hang Seng, ASX 200, Shanghai Composite |
| Tech | AAPL, MSFT, NVDA, GOOGL, AMZN, META, TSLA |
| Finance | JPM, GS, BAC, BRK-B, WMT |
| Energy | XOM, Oil (CL=F) |
| Defense | LMT, RTX, NOC, GD, BA, LHX, HII, LDOS, SAIC, KTOS, PLTR |
| Commodities | Gold, Silver, Oil |
| Crypto | BTC, ETH |

## Stack

- **Frontend** — Vite + React 18
- **Backend** — FastAPI + asyncpg
- **Database** — PostgreSQL 16
- **Deploy** — Docker Compose

## Setup

1. Generate the `.env` file:
   ```bash
   printf "API_KEY=$(openssl rand -hex 32)\nADMIN_SECRET=$(openssl rand -hex 32)\nADMIN_PHONE_NUM=+15550001234\nSTYTCH_PROJECT_ID=project-live-...\nSTYTCH_SECRET=secret-live-...\nYT_KEY=YOUR_YT_API_KEY\nREFRESH_INTERVAL=1800\nSTABLE_REFRESH_INTERVAL=21600\n" > .env
   ```

2. Build and run:
   ```bash
   docker compose up --build -d
   ```
   App at `http://localhost:8001` · Admin at `/admin` · Swagger docs at `/docs`

## API

GET endpoints are public. POST/PATCH endpoints require an `X-API-Key` header. Admin endpoints require an `X-Admin-Token` header obtained via OTP login.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/streams` | — | List all streams |
| `POST` | `/api/streams` | API key | Add a new stream |
| `PATCH` | `/api/streams/{tag}/video_id` | API key | Update a stream's video ID |
| `GET` | `/api/news` | — | Latest headlines |
| `GET` | `/api/stocks` | — | Live market quotes |
| `POST` | `/api/admin/send-otp` | — | Send SMS OTP to admin phone |
| `POST` | `/api/admin/verify-otp` | — | Verify OTP, receive session token |
| `GET` | `/api/admin/streams` | Admin token | List all streams with full detail |
| `POST` | `/api/admin/streams` | Admin token | Create stream |
| `PUT` | `/api/admin/streams/{tag}` | Admin token | Update any stream field |
| `DELETE` | `/api/admin/streams/{tag}` | Admin token | Delete stream |
| `POST` | `/api/admin/streams/lookup` | — | Fetch channel info from YouTube handle |

Full interactive docs at `/docs`.

## Dev

```bash
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api to :8001)
```

## Admin Panel

A password-protected admin interface lives at `/admin` and provides full CRUD for streams, inline editing, and quick rescrape controls. The admin UI uses SMS OTP via Stytch and a short-lived signed session.

Authentication and behavior:
- **Authentication** uses [Stytch](https://stytch.com) SMS OTP — only the phone number set in `ADMIN_PHONE_NUM` can log in. Sessions last 24 hours and are signed with `ADMIN_SECRET`.
- Use the **Rescrape** button in the admin to trigger an immediate refresh of all streams (this calls the same backend refresh logic used by the background job).

Features:
- Scrollable grid of all streams with every DB field visible
- Inline editing — click any cell to edit; changes save immediately
- Delete — two-step confirmation per row
- Add stream — enter a YouTube channel handle → auto-fetches channel name and current live video ID → fill in remaining fields and save
- Filter — search bar to filter streams by tag, name, region, or link

Required env vars for admin and polling:

| Variable | Description |
|----------|-------------|
| `API_KEY` | API key required for non-admin POST/PATCH operations (set in `.env`) |
| `ADMIN_PHONE_NUM` | E.164 phone number allowed to log in (e.g. `+15550001234`) |
| `ADMIN_SECRET` | Secret for signing session tokens — generate with `openssl rand -hex 32` |
| `STYTCH_PROJECT_ID` | Stytch project ID (`project-live-...` or `project-test-...`) |
| `STYTCH_SECRET` | Stytch secret key |
| `YT_KEY` | YouTube Data API v3 key (required for refresh/polling) |
| `REFRESH_INTERVAL` | Rotating-stream poll interval in seconds (default `1800`) |
| `STABLE_REFRESH_INTERVAL` | Stable-video-id poll interval in seconds (default `21600`) |

Notes:
- The background poller uses the YouTube Data API (`YT_KEY`) to check live status; without a key the service will skip API-based checks and rotating channels won't be polled.
- Default YouTube Data API quota is 10,000 units/day. The app's default polling (rotating every 30m, stable every 6h) is tuned to stay well under typical quotas for moderate channel counts — monitor usage in the Google Cloud Console and request increases if needed.
