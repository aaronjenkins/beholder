-- ============================================================
-- AUTO-MATCHED (exact name match against AllSides dataset)
-- ============================================================

-- ABC News  →  ABC News [left-center]
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='ABC';

-- Associated Press  →  Associated Press [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='AP';

-- BBC News  →  BBC News [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='BBC';

-- Bloomberg  →  Bloomberg [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='BBG';

-- CBS News  →  CBS News [left-center]
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='CBS';

-- CNBC  →  CNBC [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='CNBC';

-- C-SPAN  →  C-SPAN [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='CSPAN';

-- Forbes  →  Forbes [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='FORBES';

-- The Jerusalem Post  →  The Jerusalem Post [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='JPOST';

-- PBS NewsHour  →  PBS NewsHour [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='PBS';

-- Reuters  →  Reuters [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='REUTERS';

-- The Hill  →  The Hill [center]
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='THEHILL';


-- ============================================================
-- MANUAL OVERRIDES (well-known ratings not in dataset / poor match)
-- ============================================================

-- Al Jazeera English  [left-center]  (manual)
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='AJE';

-- Al Arabiya  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='ALARABIYA';

-- CGTN  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='CGTN';

-- Channel 4 News  [left-center]  (manual)
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='CH4';

-- CNA  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='CNA';

-- Deutsche Welle  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='DW';

-- Euronews  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='EU';

-- France 24  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='F24';

-- Fox Business  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='FOXBIZ';

-- Fox News  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='FOXNOW';

-- GB News  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='GBNEWS';

-- India Today  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='IT';

-- ITV News  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='ITV';

-- KBS World  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='KBSWORLD';

-- LiveNOW from FOX  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='LIVENOW';

-- NBC News  [left-center]  (manual)
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='NBC';

-- NDTV  [left-center]  (manual)
UPDATE streams SET bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left' WHERE tag='NDTV';

-- NHK World  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='NHK';

-- OAN  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='OAN';

-- Republic World  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='REPWORLD';

-- Sky News  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='SKY';

-- Sky News Australia  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='SKYAU';

-- Scripps News  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='Scripps';

-- Times Now  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='TN';

-- TRT World  [center]  (manual)
UPDATE streams SET bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag='TRT';

-- TVP World  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='TVPWORLD';

-- WION  [right-center]  (manual)
UPDATE streams SET bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='WION';

-- Zee News  [right]  (manual)
UPDATE streams SET bias_label='R', bias_color='#dc2626', bias_title='Right' WHERE tag='ZEE';


-- ============================================================
-- FUZZY-MATCHED (score >= 0.82) — review carefully
-- ============================================================


-- ============================================================
-- NO RELIABLE MATCH — fill in manually or skip
-- ============================================================
--   CNN18         CNN-News18                      best candidate: 'CNS News' (0.67)
--   COURTTV       Court TV                        best candidate: 'Countable' (0.47)
--   FP            Firstpost                       best candidate: 'Kirsten Powers' (0.61)
--   IRANINTL      Iran International              best candidate: 'PRI (Public Radio International)' (0.68)
--   MEE           Middle East Eye                 best candidate: 'Daily Beast' (0.54)
--   MIRNOW        Mirror Now                      best candidate: 'MIT News' (0.56)
--   NATGEO        National Geographic             best candidate: 'National Journal' (0.69)
--   TLMD          Noticias Telemundo              best candidate: 'Nicholas Kristof' (0.47)
