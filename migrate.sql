ALTER TABLE streams ADD COLUMN IF NOT EXISTS icon_url TEXT;
-- Migration: add region, subregion, and bias columns
ALTER TABLE streams ADD COLUMN IF NOT EXISTS region     TEXT;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS subregion  TEXT;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS bias_label TEXT;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS bias_color TEXT;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS bias_title TEXT;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS government_funded BOOLEAN DEFAULT FALSE;
ALTER TABLE streams DROP COLUMN IF EXISTS video_ids;
ALTER TABLE streams ADD COLUMN IF NOT EXISTS last_live_at TIMESTAMPTZ;

-- ── US Networks ───────────────────────────────────────────────────────────────
UPDATE streams SET region='US', bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='NBC';
UPDATE streams SET region='US', bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='ABC';
UPDATE streams SET region='US', bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='CBS';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='Scripps';
UPDATE streams SET region='US', bias_label='R',  bias_color='#dc2626', bias_title='Right'      WHERE tag='FOXNOW';
UPDATE streams SET region='US', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='FOXBIZ';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='FOXWX';
UPDATE streams SET region='US', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='LIVENOW';
UPDATE streams SET region='US', bias_label='R',  bias_color='#dc2626', bias_title='Right'      WHERE tag='OAN';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='THEHILL';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CSPAN';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='PBS';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='BBG';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CNBC';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='AP';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='FORBES';
UPDATE streams SET region='US', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='COURTTV';

-- ── US Regional ───────────────────────────────────────────────────────────────
UPDATE streams SET region='US Regional', subregion='New York',     bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='ABC7NY';
UPDATE streams SET region='US Regional', subregion='New York',     bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='NEWS12';
UPDATE streams SET region='US Regional', subregion='New York',     bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='PIX11';
UPDATE streams SET region='US Regional', subregion='Los Angeles',  bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KTLA';
UPDATE streams SET region='US Regional', subregion='Chicago',      bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='ABC7CHI';
UPDATE streams SET region='US Regional', subregion='Chicago',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WGN';
UPDATE streams SET region='US Regional', subregion='Dallas',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WFAA';
UPDATE streams SET region='US Regional', subregion='Dallas',       bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='NBCDFW';
UPDATE streams SET region='US Regional', subregion='Dallas',       bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='FOX4DFW';
UPDATE streams SET region='US Regional', subregion='Houston',      bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='ABC13H';
UPDATE streams SET region='US Regional', subregion='Houston',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KHOU';
UPDATE streams SET region='US Regional', subregion='Houston',      bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='KPRC2';
UPDATE streams SET region='US Regional', subregion='San Antonio',  bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KSAT';
UPDATE streams SET region='US Regional', subregion='San Antonio',  bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KENS5';
UPDATE streams SET region='US Regional', subregion='Austin',       bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='KVUE';
UPDATE streams SET region='US Regional', subregion='Austin',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KXAN';
UPDATE streams SET region='US Regional', subregion='El Paso',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KVIA';
UPDATE streams SET region='US Regional', subregion='Miami',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='LOCAL10';
UPDATE streams SET region='US Regional', subregion='Atlanta',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WSB';
UPDATE streams SET region='US Regional', subregion='Seattle',      bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='KING5';
UPDATE streams SET region='US Regional', subregion='Denver',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='9NEWS';
UPDATE streams SET region='US Regional', subregion='Boston',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WCVB';
UPDATE streams SET region='US Regional', subregion='Cincinnati',   bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='WLWT';
UPDATE streams SET region='US Regional', subregion='Cincinnati',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WCPO';
UPDATE streams SET region='US Regional', subregion='Cincinnati',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='LOCAL12';
UPDATE streams SET region='US Regional', subregion='Cincinnati',   bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='FOX19';
UPDATE streams SET region='US Regional', subregion='Cleveland',    bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='WKYC';
UPDATE streams SET region='US Regional', subregion='Columbus',     bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WBNS';
UPDATE streams SET region='US Regional', subregion='Detroit',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WXYZ';
UPDATE streams SET region='US Regional', subregion='Detroit',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WDIV';
UPDATE streams SET region='US Regional', subregion='Indianapolis', bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='WTHR';
UPDATE streams SET region='US Regional', subregion='Indianapolis', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WRTV';
UPDATE streams SET region='US Regional', subregion='Lexington',    bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WKYT';
UPDATE streams SET region='US Regional', subregion='Lexington',    bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='LEX18';
UPDATE streams SET region='US Regional', subregion='Pittsburgh',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WPXI';
UPDATE streams SET region='US Regional', subregion='Pittsburgh',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='WTAE';

-- ── Europe ────────────────────────────────────────────────────────────────────
UPDATE streams SET region='Europe', subregion='UK',            bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='BBC';
UPDATE streams SET region='Europe', subregion='UK',            bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='SKY';
UPDATE streams SET region='Europe', subregion='UK',            bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='CH4';
UPDATE streams SET region='Europe', subregion='UK',            bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='ITV';
UPDATE streams SET region='Europe', subregion='UK',            bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='GBNEWS';
UPDATE streams SET region='Europe', subregion='UK',            bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='LBC';
UPDATE streams SET region='Europe', subregion='International', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='REUTERS';
UPDATE streams SET region='Europe', subregion='International', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='EU';
UPDATE streams SET region='Europe', subregion='France',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='F24';
UPDATE streams SET region='Europe', subregion='France',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='BFMTV';
UPDATE streams SET region='Europe', subregion='France',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='LCI';
UPDATE streams SET region='Europe', subregion='Germany',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='DW';
UPDATE streams SET region='Europe', subregion='Germany',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='ZDFTV';
UPDATE streams SET region='Europe', subregion='Germany',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='TAGESSCHAU';
UPDATE streams SET region='Europe', subregion='Italy',         bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='SKYTG24';
UPDATE streams SET region='Europe', subregion='Italy',         bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='RAINEWS';
UPDATE streams SET region='Europe', subregion='Spain',         bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='RTVE';
UPDATE streams SET region='Europe', subregion='Netherlands',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='NOS';
UPDATE streams SET region='Europe', subregion='Poland',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='TVPWORLD';

-- ── Middle East ───────────────────────────────────────────────────────────────
UPDATE streams SET region='Middle East', subregion='Regional',   bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='AJE';
UPDATE streams SET region='Middle East', subregion='Regional',   bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='MEE';
UPDATE streams SET region='Middle East', subregion='Israel',     bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='i24';
UPDATE streams SET region='Middle East', subregion='Israel',     bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='JPOST';
UPDATE streams SET region='Middle East', subregion='Turkey',     bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='TRT';
UPDATE streams SET region='Middle East', subregion='Saudi/Gulf', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='ALARABIYA';
UPDATE streams SET region='Middle East', subregion='Saudi/Gulf', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='ARABNEWS';
UPDATE streams SET region='Middle East', subregion='Iran',       bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='IRANINTL';
UPDATE streams SET region='Middle East', subregion='Lebanon',    bias_label='L',  bias_color='#1d4ed8', bias_title='Left'       WHERE tag='ALMAYADEEN';
UPDATE streams SET region='Middle East', subregion='Lebanon',    bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='MTVLB';
UPDATE streams SET region='Middle East', subregion='Lebanon',    bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='ALJADEED';
UPDATE streams SET region='Middle East', subregion='Kurdistan',  bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KURD24';
UPDATE streams SET region='Middle East', subregion='Egypt',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='EXTRANEWS';

-- ── India ─────────────────────────────────────────────────────────────────────
UPDATE streams SET region='India', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='NDTV';
UPDATE streams SET region='India', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='WION';
UPDATE streams SET region='India', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='FP';
UPDATE streams SET region='India', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CNN18';
UPDATE streams SET region='India', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='TN';
UPDATE streams SET region='India', bias_label='R',  bias_color='#dc2626', bias_title='Right'      WHERE tag='ZEE';
UPDATE streams SET region='India', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='IT';
UPDATE streams SET region='India', bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='REPWORLD';
UPDATE streams SET region='India', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='MIRNOW';
UPDATE streams SET region='India', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='DDNEWS';

-- ── Pakistan ──────────────────────────────────────────────────────────────────
UPDATE streams SET region='Pakistan', bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag IN ('GEO','ARY','SAMAA','DAWNEN','HUM','AAJPK','EXPRESS','DUNYA','NEWS24PK');

-- ── Asia-Pacific ──────────────────────────────────────────────────────────────
UPDATE streams SET region='Asia-Pacific', subregion='Australia',   bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='ABCAU';
UPDATE streams SET region='Asia-Pacific', subregion='Australia',   bias_label='R',  bias_color='#dc2626', bias_title='Right'      WHERE tag='SKYAU';
UPDATE streams SET region='Asia-Pacific', subregion='Australia',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='9NEWS_AU';
UPDATE streams SET region='Asia-Pacific', subregion='Japan',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='NHK';
UPDATE streams SET region='Asia-Pacific', subregion='South Korea', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='ARIRANG';
UPDATE streams SET region='Asia-Pacific', subregion='South Korea', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='KBSWORLD';
UPDATE streams SET region='Asia-Pacific', subregion='China',       bias_label='L',  bias_color='#1d4ed8', bias_title='Left'       WHERE tag='CGTN';
UPDATE streams SET region='Asia-Pacific', subregion='Taiwan',      bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='TWPLUS';
UPDATE streams SET region='Asia-Pacific', subregion='Singapore',   bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CNA';
UPDATE streams SET region='Asia-Pacific', subregion='Philippines', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='GMA';
UPDATE streams SET region='Asia-Pacific', subregion='Philippines', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='ABSCBN';

-- ── Central & South America ───────────────────────────────────────────────────
UPDATE streams SET region='Central & South America', subregion='Pan-Regional', bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag='TLMD';
UPDATE streams SET region='Central & South America', subregion='Pan-Regional', bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='BBCM';
UPDATE streams SET region='Central & South America', subregion='Mexico',       bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag IN ('MLN','AZTECAN','NMAS');
UPDATE streams SET region='Central & South America', subregion='Brazil',       bias_label='L–', bias_color='#60a5fa', bias_title='Lean Left'  WHERE tag IN ('CNNBR','GLOBONEWS');
UPDATE streams SET region='Central & South America', subregion='Brazil',       bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='RECORDNEWS';
UPDATE streams SET region='Central & South America', subregion='Colombia',     bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CARACOL';
UPDATE streams SET region='Central & South America', subregion='Argentina',    bias_label='R–', bias_color='#f97316', bias_title='Lean Right' WHERE tag='TODON';
UPDATE streams SET region='Central & South America', subregion='Argentina',    bias_label='L',  bias_color='#1d4ed8', bias_title='Left'       WHERE tag='C5N';
UPDATE streams SET region='Central & South America', subregion='Argentina',    bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='CRONICA';
UPDATE streams SET region='Central & South America', subregion='Chile',        bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag IN ('T13CL','MEGA');
UPDATE streams SET region='Central & South America', subregion='Peru',         bias_label='C',  bias_color='#6b7280', bias_title='Center'     WHERE tag='RPP';

-- ── Raw Webcam Feeds ──────────────────────────────────────────────────────────
UPDATE streams SET region='Raw Webcam Feeds' WHERE tag IN ('INQUIZE','INTELUA','INTELME','OSINTUA','OSINTIR');

-- ── Take a Break ──────────────────────────────────────────────────────────────
UPDATE streams SET region='Take a Break' WHERE tag IN ('CONTV','CN','ADVTIME','DUCKTAL','WBCLASSIC','MXC','MXCOG','MST3K','PARKSREC','NATGEO','GHOSTHNT','HP','TOKUSHOUT','OFFICE','WKUK');
