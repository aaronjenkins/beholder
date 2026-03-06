"""
Match AllSides bias ratings to Beholder channels and output SQL UPDATE statements.
Usage: python3 match_bias.py
"""
import csv
import difflib

RATING_MAP = {
    "left":         ("L",  "#1d4ed8", "Left"),
    "left-center":  ("L–", "#60a5fa", "Lean Left"),
    "center":       ("C",  "#6b7280", "Center"),
    "right-center": ("R–", "#f97316", "Lean Right"),
    "right":        ("R",  "#dc2626", "Right"),
}

# Channels from Beholder DB — tag: display name
channels = {
    "ABC":        "ABC News",
    "AP":         "Associated Press",
    "BBC":        "BBC News",
    "BBG":        "Bloomberg",
    "CBS":        "CBS News",
    "CNBC":       "CNBC",
    "CSPAN":      "C-SPAN",
    "JPOST":      "The Jerusalem Post",
    "PBS":        "PBS NewsHour",
    "REUTERS":    "Reuters",
    "THEHILL":    "The Hill",
    "AJE":        "Al Jazeera English",
    "FOXNOW":     "Fox News",
    "FOXBIZ":     "Fox Business",
    "OAN":        "OAN",
    "NBC":        "NBC News",
    "SKY":        "Sky News",
    "F24":        "France 24",
    "DW":         "Deutsche Welle",
    "NDTV":       "NDTV",
    "CH4":        "Channel 4 News",
    "ITV":        "ITV News",
    "GBNEWS":     "GB News",
    "FORBES":     "Forbes",
    "SKYAU":      "Sky News Australia",
    "NATGEO":     "National Geographic",
    "EU":         "Euronews",
    "TRT":        "TRT World",
    "CGTN":       "CGTN",
    "MEE":        "Middle East Eye",
    "WION":       "WION",
    "IT":         "India Today",
    "TN":         "Times Now",
    "ZEE":        "Zee News",
    "REPWORLD":   "Republic World",
    "IRANINTL":   "Iran International",
    "KBSWORLD":   "KBS World",
    "NHK":        "NHK World",
    "CNA":        "CNA",
    "TVPWORLD":   "TVP World",
    "Scripps":    "Scripps News",
    "LIVENOW":    "LiveNOW from FOX",
    "MIRNOW":     "Mirror Now",
    "FP":         "Firstpost",
    "COURTTV":    "Court TV",
    "TLMD":       "Noticias Telemundo",
    "CNN18":      "CNN-News18",
    "ALARABIYA":  "Al Arabiya",
}

# Manual overrides: channels we know the bias for but AllSides dataset won't match well.
# Format: tag -> allsides rating string
MANUAL = {
    "FOXNOW":    "right",        # Fox News
    "FOXBIZ":    "right-center", # Fox Business
    "OAN":       "right",        # One America News
    "GBNEWS":    "right",        # GB News UK
    "SKYAU":     "right",        # Sky News Australia
    "SKY":       "right-center", # Sky News UK
    "CH4":       "left-center",  # Channel 4 News UK
    "ITV":       "center",       # ITV News UK
    "DW":        "center",       # Deutsche Welle
    "EU":        "center",       # Euronews
    "F24":       "center",       # France 24
    "NHK":       "center",       # NHK World Japan
    "TRT":       "center",       # TRT World (state-funded Turkish)
    "CGTN":      "right",        # CGTN (Chinese state media)
    "WION":      "right-center", # WION India
    "REPWORLD":  "right-center", # Republic World India
    "ALARABIYA": "right-center", # Al Arabiya
    "LIVENOW":   "right",        # LiveNOW from FOX
    "AJE":       "left-center",  # Al Jazeera English (AllSides: left-center)
    "NBC":       "left-center",  # NBC News
    "CNA":       "center",       # CNA Singapore public broadcaster
    "Scripps":   "center",       # Scripps News
    "NDTV":      "left-center",  # NDTV India
    "IT":        "center",       # India Today
    "TN":        "right-center", # Times Now India (right-leaning)
    "ZEE":       "right",        # Zee News India (right-leaning)
    "TVPWORLD":  "right-center", # TVP World Poland (state-funded, right-leaning government)
    "KBSWORLD":  "center",       # KBS World South Korea (public broadcaster)
    "NHK":       "center",       # NHK World Japan (public broadcaster)
}

# Load AllSides CSV
allsides = []
with open("allsides_data.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):
        if row["rating"] in RATING_MAP:
            allsides.append(row)

allsides_names = [r["news_source"].lower() for r in allsides]

FUZZY_THRESHOLD = 0.82  # high bar — only very close matches

auto_matched = []
manual_applied = []
fuzzy_matched = []
unmatched = []

for tag, name in sorted(channels.items()):
    name_lower = name.lower()

    # 1. manual override
    if tag in MANUAL:
        label, color, title = RATING_MAP[MANUAL[tag]]
        manual_applied.append((tag, name, MANUAL[tag], label, color, title))
        continue

    # 2. exact match
    exact = next((r for r in allsides if r["news_source"].lower() == name_lower), None)
    if exact:
        label, color, title = RATING_MAP[exact["rating"]]
        auto_matched.append((tag, name, exact["news_source"], exact["rating"], label, color, title, "exact"))
        continue

    # 3. fuzzy match (high threshold only)
    scores = [(difflib.SequenceMatcher(None, name_lower, n).ratio(), i)
              for i, n in enumerate(allsides_names)]
    best_score, best_idx = max(scores, key=lambda x: x[0])
    if best_score >= FUZZY_THRESHOLD:
        row = allsides[best_idx]
        label, color, title = RATING_MAP[row["rating"]]
        fuzzy_matched.append((tag, name, row["news_source"], row["rating"], label, color, title, best_score))
    else:
        unmatched.append((tag, name, allsides[best_idx]["news_source"], best_score))

# ── Output ──────────────────────────────────────────────────────────────────────

print("-- ============================================================")
print("-- AUTO-MATCHED (exact name match against AllSides dataset)")
print("-- ============================================================\n")
for tag, name, src, rating, label, color, title, method in auto_matched:
    print(f"-- {name}  →  {src} [{rating}]")
    print(f"UPDATE streams SET bias_label='{label}', bias_color='{color}', bias_title='{title}' WHERE tag='{tag}';\n")

print("\n-- ============================================================")
print("-- MANUAL OVERRIDES (well-known ratings not in dataset / poor match)")
print("-- ============================================================\n")
for tag, name, rating, label, color, title in manual_applied:
    print(f"-- {name}  [{rating}]  (manual)")
    print(f"UPDATE streams SET bias_label='{label}', bias_color='{color}', bias_title='{title}' WHERE tag='{tag}';\n")

print("\n-- ============================================================")
print(f"-- FUZZY-MATCHED (score >= {FUZZY_THRESHOLD}) — review carefully")
print("-- ============================================================\n")
for tag, name, src, rating, label, color, title, score in fuzzy_matched:
    print(f"-- {name}  →  {src} [{rating}]  (score={score:.2f})")
    print(f"UPDATE streams SET bias_label='{label}', bias_color='{color}', bias_title='{title}' WHERE tag='{tag}';\n")

print("\n-- ============================================================")
print("-- NO RELIABLE MATCH — fill in manually or skip")
print("-- ============================================================")
for tag, name, best, score in unmatched:
    print(f"--   {tag:12s}  {name:30s}  best candidate: {best!r} ({score:.2f})")
