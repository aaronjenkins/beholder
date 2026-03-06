# Adding Channels to Beholder

## URL patterns

### Single live stream (main channel feed)

Use the channel's `/live` URL. YouTube redirects this to whatever the channel is currently broadcasting.

```
https://www.youtube.com/@ChannelHandle/live
```

The background refresh job scrapes this URL every 30 minutes to keep the `video_id` current. No video ID needs to be specified manually.

**Use this for**: news networks, sports channels, 24/7 streams — anything with one primary live feed.

---

### Fixed video (specific stream, never changes)

Use the full `watch?v=` URL and set `video_id` directly.

```
https://www.youtube.com/watch?v=VIDEO_ID
```

The refresh job will still scrape this URL, but since it always returns the same video ID, it stays stable.

**Use this for**: playlist-style "always-on" streams (e.g. DuckTales marathon, MXC), webcam feeds pinned to a specific video.

---

### All concurrent live streams from a channel

Some channels run multiple simultaneous live streams (OSINT feeds, Indian news channels, entertainment channels with parallel shows).

To discover all current live streams for a channel, fetch its `/streams` tab:

```
https://www.youtube.com/@ChannelHandle/streams
```

YouTube embeds a `ytInitialData` JSON blob in this page. Videos that are currently LIVE have the following structure in their `videoRenderer` object:

```json
{
  "videoId": "XXXXXXXXXXX",
  "title": { "runs": [{ "text": "Stream title here" }] },
  "thumbnailOverlays": [
    {
      "thumbnailOverlayTimeStatusRenderer": {
        "style": "LIVE",
        "icon": { "iconType": "LIVE" }
      }
    }
  ]
}
```

The key indicator is:
```
thumbnailOverlays[].thumbnailOverlayTimeStatusRenderer.style == "LIVE"
```

Any `videoRenderer` with this overlay is currently live. Extract its `videoId` and use `https://www.youtube.com/watch?v=VIDEO_ID` as the stream link.

---

## Adding a channel manually

### Via the API

```bash
curl -X POST http://localhost:8001/api/streams \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Channel Name",
    "tag": "MYTAG",
    "color": "#cc0000",
    "link": "https://www.youtube.com/@ChannelHandle/live"
  }'
```

### Via seed.sql (persists across DB resets)

Add a row to the `INSERT INTO streams` block in `seed.sql`:

```sql
-- For a channel with a single main live stream:
('Channel Name', 'TAG', '#cc0000', 'UC_channel_id_optional', NULL, 'https://www.youtube.com/@Handle/live'),

-- For a fixed video stream:
('Channel Name', 'TAG', '#cc0000', NULL, 'VIDEO_ID_11CHARS', 'https://www.youtube.com/watch?v=VIDEO_ID_11CHARS'),
```

Then add the tag to the appropriate region in `frontend/src/components/LiveStreams.jsx`:

```js
const REGIONS = [
  { label: 'My Region', tags: ['TAG', ...] },
  ...
]
```

---

## Scanning all channels for concurrent streams

`tools/scan_live_streams.py` queries the database for all channel-based streams, fetches each channel's `/streams` page, and inserts any additional concurrent live streams as new entries (tagged `TAG2`, `TAG3`, etc.).

```bash
# Copy into the running container and execute
docker cp tools/scan_live_streams.py beholder:/app/scan.py
docker exec beholder python scan.py

# Preview without writing to DB
docker exec beholder python scan.py --dry-run
```

The script:
1. Fetches `/@handle/streams` for every channel-based entry in the DB
2. Parses `ytInitialData` and finds all videos with `style: "LIVE"` in `thumbnailOverlays`
3. Skips any `video_id` already present in the DB
4. Inserts new entries with auto-generated tags (`NBC2`, `NDTV15`, etc.)

Run this periodically to pick up new concurrent streams. Since the added entries use fixed `watch?v=` links, they will only remain valid while that specific broadcast is live — stale entries should be cleaned up manually or via a future prune script.

---

## Picking a color

Use the channel's brand color. A few conventions used in this project:

| Color | Usage |
|-------|-------|
| `#cc0000` | Red — breaking news, US cable |
| `#003087` | Dark blue — established networks |
| `#1b1b1b` | Near-black — finance/business |
| `#cc9900` | Gold/amber — documentaries |
| `#2d6a4f` | Dark green — nature/lifestyle |
| `#5c1a8a` | Purple — entertainment |
