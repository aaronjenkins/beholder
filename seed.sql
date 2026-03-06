CREATE TABLE IF NOT EXISTS streams (
    id                SERIAL PRIMARY KEY,
    name              TEXT NOT NULL,
    tag               TEXT NOT NULL UNIQUE,
    color             TEXT NOT NULL,
    channel_id        TEXT,
    video_id          TEXT,
    link              TEXT NOT NULL,
    region            TEXT,
    subregion         TEXT,
    bias_label        TEXT,
    bias_color        TEXT,
    bias_title        TEXT,
    government_funded BOOLEAN DEFAULT FALSE,
    last_live_at      TIMESTAMPTZ,
    icon_url          TEXT
);

INSERT INTO streams (name, tag, color, channel_id, video_id, link) VALUES
-- US Networks
('NBC News Now',       'NBC',     '#0057a8', 'UCeY0bbntWzzVIaj2z3QigXg', NULL, 'https://www.youtube.com/@NBCNews/live'),
('ABC News Live',      'ABC',     '#0b1f6b', 'UCBi2mrWuNuyYy4gbM6fU18Q', NULL, 'https://www.youtube.com/@ABCNews/live'),
('CBS News',           'CBS',     '#1e3a8a', 'UC8p1vwvWtl6T73JiExfWs1g', NULL, 'https://www.youtube.com/@CBSNews/live'),
('Scripps News',       'Scripps', '#003366', 'UCTln5ss6h6L_xNfMeujfPbg', NULL, 'https://www.youtube.com/@scrippsnews/live'),
('Fox News Now',       'FOXNOW',  '#003087', 'UCXIJgqnII2ZOINSWNOGFThA', NULL, 'https://www.youtube.com/@FoxNews/live'),
('Fox Business',       'FOXBIZ',  '#0033a0', 'UCCXoCcu9Rp7NPbTzIvogpZg', NULL, 'https://www.youtube.com/@FoxBusiness/live'),
('Fox Weather',        'FOXWX',   '#f26522', 'UC1FbPiXx59_ltnFVx7IxWow', NULL, 'https://www.youtube.com/@FoxWeather/live'),
('OAN',                'OAN',     '#c8001a', 'UCNbIDJNNgaRrXOD7VllIMRQ', NULL, 'https://www.youtube.com/@OANN/live'),
('The Hill',           'THEHILL', '#1a3a6b', 'UCPWXiRWZ29zrxPFIQT7eHSA', NULL, 'https://www.youtube.com/@thehill/live'),
('C-SPAN',             'CSPAN',   '#004990', 'UCY-0eE6fX-tkicr2mh8e_kA', NULL, 'https://www.youtube.com/@cspan/live'),
('PBS NewsHour',       'PBS',     '#1a6aaa', 'UC6ZFN9Tx6xh-skXCuRHCDpQ', NULL, 'https://www.youtube.com/@pbsnewshour/live'),
('Bloomberg',          'BBG',     '#1b1b1b', 'UCUMZ7gohGI9HcU9VNsr2FJQ', NULL, 'https://www.youtube.com/@business/live'),
('CNBC Television',    'CNBC',    '#0080c7', 'UCrp_UI8XtuYfpiqluWLD7Lw', NULL, 'https://www.youtube.com/@CNBCtelevision/live'),
('Associated Press',   'AP',      '#cc0000', 'UC52X5wxOL_s5yw0dQk7NtgA', NULL, 'https://www.youtube.com/@AssociatedPress/live'),
('Forbes Breaking News','FORBES', '#003366', 'UCg40OxZ1GYh3u3jBntB6DLg', NULL, 'https://www.youtube.com/@ForbesBreakingNews/live'),
('Court TV',           'COURTTV', '#2d2d2d', 'UCo5E9pEhK_9kWG7-5HHcyRg', NULL, 'https://www.youtube.com/@CourtTV/live'),
-- Europe
('BBC News',           'BBC',        '#bb1919', 'UC16niRr50-MSBwiO3YDb3RA', NULL, 'https://www.youtube.com/@BBCNews/live'),
('Sky News',           'SKY',        '#e8002d', 'UCoMdktPbSTixAyNGwb-UYkQ', NULL, 'https://www.youtube.com/@SkyNews/live'),
('Channel 4 News',     'CH4',        '#6d2077', 'UCTrQ7HXWRRxr7OsOtodr2_w', NULL, 'https://www.youtube.com/@Channel4News/live'),
('ITV News',           'ITV',        '#003366', 'UCFQgi22Ht00CpaOQLtvZx2A', NULL, 'https://www.youtube.com/@itvnews/live'),
('GB News',            'GBNEWS',     '#1a3a6b', 'UC0vn8ISa4LKMunLbzaXLnOQ', NULL, 'https://www.youtube.com/@gbnewsonline/live'),
('LBC',                'LBC',        '#2d2d2d', 'UCb1Ti1WKPauPpXkYKVHNpsw', NULL, 'https://www.youtube.com/@lbcofficial/live'),
('France 24 English',  'F24',        '#003f8a', 'UCQfwfsi5VrQ8yKZ-UWmAEFg', NULL, 'https://www.youtube.com/@France24_en/live'),
('BFMTV',              'BFMTV',      '#e8002d', 'UCXwDLMDV86ldKoFVc_g8P0g', NULL, 'https://www.youtube.com/@bfmtv/live'),
('LCI',                'LCI',        '#003087', 'UCewhc0fvja891XkpIPGRMxQ', NULL, 'https://www.youtube.com/@lci/live'),
('DW News',            'DW',         '#c00000', 'UCknLrEdhRCp1aegoMqRaCZg', NULL, 'https://www.youtube.com/@DWNews/live'),
('ZDF heute',          'ZDFTV',      '#003087', 'UCeqKIgPQfNInOswGRWt48kQ', NULL, 'https://www.youtube.com/@zdfheute/live'),
('tagesschau',         'TAGESSCHAU', '#003087', 'UC5NOEUbkLheQcaaRldYW5GA', NULL, 'https://www.youtube.com/@tagesschau/live'),
('Euronews',           'EU',         '#003399', 'UCSrZ3UV4jOidv8ppoVuvW9Q', NULL, 'https://www.youtube.com/@euronews/live'),
('Reuters',            'REUTERS',    '#ff6600', 'UChqUTb7kYRX8-EiaN3XFrSQ', NULL, 'https://www.youtube.com/@Reuters/live'),
('Sky TG24',           'SKYTG24',    '#003087', 'UCz6E3lF72mb6uoJ-mOlNo2A', NULL, 'https://www.youtube.com/@skytg24/live'),
('RaiNews',            'RAINEWS',    '#003087', 'UCxqR9g_1XlnfrqwHK9viwCw', NULL, 'https://www.youtube.com/@rainews/live'),
('RTVE Noticias',      'RTVE',       '#c8001a', 'UC7QZIf0dta-XPXsp9Hv4dTw', NULL, 'https://www.youtube.com/@rtvenoticias/live'),
('NOS',                'NOS',        '#003087', 'UC5xziMuoFAOpX9mwUVhe2Jw', NULL, 'https://www.youtube.com/@nos/live'),
('TVP World',          'TVPWORLD',   '#cc0000', 'UCBjUPsHj7bXt24SUWNoZ0zA', NULL, 'https://www.youtube.com/@tvpworld/live'),
-- Middle East
('Al Jazeera English', 'AJE',        '#c8a000', 'UCNye-wNBqNL5ZzHSJj3l8Bg', NULL, 'https://www.youtube.com/@aljazeeraenglish/live'),
('Middle East Eye',    'MEE',        '#003087', 'UCR0fZh5SBxxMNYdg0VzRFkg', NULL, 'https://www.youtube.com/@middleeasteye/live'),
('i24 News',           'i24',        '#0070c0', 'UCvHDpsWKADrDia0c99X37vg', NULL, 'https://www.youtube.com/@i24NEWS_EN/live'),
('The Jerusalem Post', 'JPOST',      '#003087', 'UCLLLdCANnMAdMyrXdYbSlxg', NULL, 'https://www.youtube.com/@thejerusalem_post/live'),
('TRT World',          'TRT',        '#e30a17', 'UC7fWeaHhqgM4Ry-RMpM2YYw', NULL, 'https://www.youtube.com/@TRTWorld/live'),
('Al Arabiya English', 'ALARABIYA',  '#003087', 'UCIZJ9a6P_nxCFJTmL0gh_IQ', NULL, 'https://www.youtube.com/@alarabiyaenglish/live'),
('Arab News',          'ARABNEWS',   '#1a1a2e', 'UCI8DegIWgK51cGakXcf1dOQ', NULL, 'https://www.youtube.com/@arabnews/live'),
('Iran International', 'IRANINTL',   '#c8001a', 'UCWUREZPvqB6L1MuDV5ngiiw', NULL, 'https://www.youtube.com/@iranintlenglish/live'),
('Al Mayadeen English','ALMAYADEEN', '#1a3a1a', 'UCzW1oJMWo5BpHys5QGbpJrA', NULL, 'https://www.youtube.com/@almayadeenenglish/live'),
('MTV Lebanon News',   'MTVLB',      '#c8001a', 'UC9_XmAwE5szLHF76FjMylaw', NULL, 'https://www.youtube.com/@mtvlebanonnews/live'),
('Al Jadeed News',     'ALJADEED',   '#1a1a2e', 'UC4JCsTLFcHGk10qpiNMh0Ww', NULL, 'https://www.youtube.com/@aljadeednewslb/live'),
('Kurdistan 24',       'KURD24',     '#a08000', 'UCDf50m6KorFbRRPxV6-r3yw', NULL, 'https://www.youtube.com/@kurdistan24tv/live'),
('eXtra News',         'EXTRANEWS',  '#003087', 'UC65F33K2cXk9hGDbOQYhTOw', NULL, 'https://www.youtube.com/@extranewsstream/live'),
-- India
-- TV5 News = Telugu-language, Andhra Pradesh/Telangana
('Times Now',          'TN',      '#e8211a', 'UC6RJ7-PaXg6TIH2BzZfTV7w', NULL, 'https://www.youtube.com/@TimesNow/live'),
('Zee News',           'ZEE',     '#e31837', 'UCIvaYmXn910QMdemBG3v1pQ', NULL, 'https://www.youtube.com/@ZeeNews/live'),
('India Today',        'IT',      '#e31837', 'UCYPvAwZP8pZhSMW8qs7cVCw', NULL, 'https://www.youtube.com/@IndiaToday/live'),
('NDTV',               'NDTV',    '#e31837', 'UCZFMm1mMw0F81Z37aaEzTUA', NULL, 'https://www.youtube.com/@NDTV/live'),
('WION',               'WION',    '#c0392b', 'UC_gUM8rL-Lrg6O3adPW9K1g', NULL, 'https://www.youtube.com/@WION/live'),
('Firstpost',          'FP',      '#e63946', 'UCz8QaiQxApLq8sLNcszYyJw', NULL, 'https://www.youtube.com/@firstpost/live'),
('CNN-News18',         'CNN18',   '#cc0000', 'UCef1-8eOpJgud7szVPlZQAQ', NULL, 'https://www.youtube.com/@CNNNews18/live'),
('Republic World',     'REPWORLD','#cc4400', 'UCwqusr8YDwM-3mEYTDeJHzw', NULL, 'https://www.youtube.com/@republicworld/live'),
('Mirror Now',         'MIRNOW',  '#003087', 'UCWCEYVwSqr7Epo6sSCfUgiw', NULL, 'https://www.youtube.com/@mirrornow/live'),
('DD News',            'DDNEWS',  '#003087', 'UCKwucPzHZ7zCUIf7If-Wo1g', NULL, 'https://www.youtube.com/@ddnews/live'),
('TV5 News',           'TV5IN',   '#cc0000', 'UCAR3h_9fLV82N2FH4cE4RKw', NULL, 'https://www.youtube.com/@tv5news/live'),
-- Pakistan
('Geo News',           'GEO',     '#00843d', 'UC_vt34wimdCzdkrzVejwX9g', NULL, 'https://www.youtube.com/@GeoNews/live'),
('ARY News',           'ARY',     '#003087', 'UCMmpLL2ucRHAXbNHiCPyIyg', NULL, 'https://www.youtube.com/@ArynewsTvofficial/live'),
('SAMAA TV',           'SAMAA',   '#003087', 'UCJekW1Vj5fCVEGdye_mBN6Q', NULL, 'https://www.youtube.com/@samaatv/live'),
('Dawn News English',  'DAWNEN',  '#003366', 'UC_xWTNsx7zA2uI0ydQikViA', NULL, 'https://www.youtube.com/@dawnnewsenglish/live'),
('HUM News',           'HUM',     '#003087', 'UC0Um3pnZ2WGBEeoA3BX2sKw', NULL, 'https://www.youtube.com/@humnewspakistan/live'),
('Aaj TV',             'AAJPK',   '#003366', 'UCgBAPAcLsh_MAPvJprIz89w', NULL, 'https://www.youtube.com/@aajtvofficial/live'),
('Express News',       'EXPRESS', '#cc0000', 'UCTur7oM6mLL0rM2k0znuZpQ', NULL, 'https://www.youtube.com/@expressnewspkofficial/live'),
('Dunya News',         'DUNYA',   '#003087', 'UCnMBV5Iw4WqKILKue1nP6Hg', NULL, 'https://www.youtube.com/@dunyanewsofficial/live'),
('24 News HD',         'NEWS24PK','#003366', 'UCcmpeVbSSQlZRvHfdC-CRwg', NULL, 'https://www.youtube.com/@24newshd/live'),
-- Asia-Pacific
('ABC News Australia', 'ABCAU',    '#003087', 'UCVgO39Bk5sMo66-6o6Spn6Q', NULL, 'https://www.youtube.com/@abcnewsaustralia/live'),
('Sky News Australia', 'SKYAU',    '#e8002d', 'UCO0akufu9MOzyz3nvGIXAAw', NULL, 'https://www.youtube.com/@skynewsaustralia/live'),
('9 News Australia',   '9NEWS_AU', '#003087', 'UCIYLOcEUX6TbBo7HQVF2PKA', NULL, 'https://www.youtube.com/@9newsaus/live'),
('NHK World Japan',    'NHK',      '#0033a0', 'UCSPEjw8F2nQDtmUKPFNF7_A', NULL, 'https://www.youtube.com/@NHKWORLDJAPAN/live'),
('Arirang News',       'ARIRANG',  '#003087', 'UCzznO4xSV8BKnUBPyswtCUw', NULL, 'https://www.youtube.com/@arirangcokrarirangnews/live'),
('KBS World News',     'KBSWORLD', '#003366', 'UCO-BnpYUlovos0AWqcRJRvA', NULL, 'https://www.youtube.com/@kbsworldnews/live'),
('CGTN',               'CGTN',     '#c00000', 'UCgrNz-aDmcr2uuto8_DL2jg', NULL, 'https://www.youtube.com/@cgtn/live'),
('TaiwanPlus News',    'TWPLUS',   '#003087', 'UCCJBSLNtozkO-NqjpPZujiQ', NULL, 'https://www.youtube.com/@taiwanplusnews/live'),
('CNA',                'CNA',      '#cc0001', 'UC83jt4dlz1Gjl58fzQrrKZg', NULL, 'https://www.youtube.com/@ChannelNewsAsia/live'),
('GMA Integrated News','GMA',      '#003087', 'UCqYw-CTd1dU2yGI71sEyqNw', NULL, 'https://www.youtube.com/@gmanews/live'),
('ABS-CBN News',       'ABSCBN',   '#003366', 'UCE2606prvXQc_noEqKxVJXA', NULL, 'https://www.youtube.com/@abscbnnews/live'),
-- Central & South America
('Noticias Telemundo', 'TLMD',       '#6b2d8b', 'UCRwA1NUcUnwsly35ikGhp0A', NULL, 'https://www.youtube.com/@noticias/live'),
('BBC News Mundo',     'BBCM',       '#bb1919', 'UCUBIrDsIVzRpKsClMlSlTpQ', NULL, 'https://www.youtube.com/@BBCMundo/live'),
('Milenio',            'MLN',        '#002244', 'UCFxHplbcoJK9m70c4VyTIxg', NULL, 'https://www.youtube.com/@milenio/live'),
('Azteca Noticias',    'AZTECAN',    '#cc0000', 'UCUP6qv-_EIL0hwTsJaKYnvw', NULL, 'https://www.youtube.com/@aztecanoticias/live'),
('NMás',               'NMAS',       '#003087', 'UCUsm-fannqOY02PNN67C0KA', NULL, 'https://www.youtube.com/@nmas/live'),
('CNN Brasil',         'CNNBR',      '#cc0000', 'UCvdwhh_fDyWccR42-rReZLw', NULL, 'https://www.youtube.com/@CNNBrasil/live'),
('Globo News',         'GLOBONEWS',  '#003087', 'UCp6RRaz93Pt2xYZoEye_rLA', NULL, 'https://www.youtube.com/@globonews/live'),
('Record News',        'RECORDNEWS', '#cc4400', 'UCuiLR4p6wQ3xLEm15pEn1Xw', NULL, 'https://www.youtube.com/@recordnews/live'),
('Noticias Caracol',   'CARACOL',    '#0057b8', 'UC2Xq2PK-got3Rtz9ZJ32hLQ', NULL, 'https://www.youtube.com/@NoticiasCaracol/live'),
('Todo Noticias',      'TODON',      '#002366', 'UCj6PcyLvpnIRT_2W_mwa9Aw', NULL, 'https://www.youtube.com/@todonoticias/live'),
('C5N',                'C5N',        '#cc0000', 'UCFgk2Q2mVO1BklRQhSv6p0w', NULL, 'https://www.youtube.com/@c5n/live'),
('Crónica TV',         'CRONICA',    '#003087', 'UCT7KFGv6s2a-rh2Jq8ZdM1g', NULL, 'https://www.youtube.com/@cronicatv/live'),
('Teletrece',          'T13CL',      '#003087', 'UCsRnhjcUCR78Q3Ud6OXCTNg', NULL, 'https://www.youtube.com/@t13_cl/live'),
('Meganoticias',       'MEGA',       '#cc0000', 'UCkccyEbqhhM3uKOI6Shm-4Q', NULL, 'https://www.youtube.com/@meganoticiasoficial/live'),
('RPP Noticias',       'RPP',        '#cc0000', 'UC5j8-2FT0ZMMBkmK72R4aeA', NULL, 'https://www.youtube.com/@rppnoticias/live'),
-- US Regional
('ABC13 Houston',  'ABC13H',  '#003087', NULL, NULL, 'https://www.youtube.com/@ABC13Houston/live'),
('ABC7 New York',  'ABC7NY',  '#003087', NULL, NULL, 'https://www.youtube.com/@abc7NY/live'),
('LiveNOW from FOX','LIVENOW','#cc0000', NULL, NULL, 'https://www.youtube.com/@livenowfox/live'),
('News 12',        'NEWS12',  '#1a5fa5', NULL, NULL, 'https://www.youtube.com/@news12/live'),
('PIX11 New York', 'PIX11',   '#003366', NULL, NULL, 'https://www.youtube.com/@PIX11News/live'),
('KTLA Los Angeles','KTLA',   '#004080', NULL, NULL, 'https://www.youtube.com/@KTLA/live'),
('ABC7 Chicago',   'ABC7CHI', '#003087', NULL, NULL, 'https://www.youtube.com/@abc7chicago/live'),
('WGN News',       'WGN',     '#1a3a6b', NULL, NULL, 'https://www.youtube.com/@WGNNews/live'),
('KHOU Houston',   'KHOU',    '#003087', NULL, NULL, 'https://www.youtube.com/@KHOU11/live'),
('KPRC2 Houston',  'KPRC2',   '#003087', 'UCKQECjul8nw1KW_JzfBTP1A', NULL, 'https://www.youtube.com/@kprc2click2houston/live'),
('NBC 5 DFW',      'NBCDFW',  '#003087', 'UC_0RDXvWZPaveq0fcYZhE6A', NULL, 'https://www.youtube.com/@nbcdfw/live'),
('FOX 4 DFW',      'FOX4DFW', '#cc4400', 'UCruQg25yVBppUWjza8AlyZA', NULL, 'https://www.youtube.com/@fox4news/live'),
('KSAT San Antonio','KSAT',   '#003087', 'UCETE4rKzRRjqM0JaB7TlPpQ', NULL, 'https://www.youtube.com/@ksatnews/live'),
('KENS 5 San Antonio','KENS5','#003366', 'UCVnjt9mMx46gMUeTtONXimQ', NULL, 'https://www.youtube.com/@kens5/live'),
('KVUE Austin',    'KVUE',    '#003087', 'UCxXTyFekH99JnS3qaXIQW7A', NULL, 'https://www.youtube.com/@kvuetv/live'),
('KXAN Austin',    'KXAN',    '#003366', 'UCgBVz3EzHYKpPS0BITvLRsg', NULL, 'https://www.youtube.com/@kxan_news/live'),
('KVIA El Paso',   'KVIA',    '#003087', 'UCu3-J9APpJZlz_RF_zkoyJg', NULL, 'https://www.youtube.com/@kviaabc7news/live'),
('Local 10 Miami', 'LOCAL10', '#003087', NULL, NULL, 'https://www.youtube.com/@local10/live'),
('WSB-TV Atlanta', 'WSB',     '#003087', NULL, NULL, 'https://www.youtube.com/@wsbtv/live'),
('KING 5 Seattle', 'KING5',   '#003087', NULL, NULL, 'https://www.youtube.com/@KING5Seattle/live'),
('9NEWS Denver',   '9NEWS',   '#003087', NULL, NULL, 'https://www.youtube.com/@9news/live'),
('WCVB Boston',    'WCVB',    '#003087', NULL, NULL, 'https://www.youtube.com/@WCVB/live'),
('WFAA Dallas',    'WFAA',    '#003087', NULL, NULL, 'https://www.youtube.com/@wfaa/live'),
('WLWT Cincinnati','WLWT',   '#003087', 'UCkr9qZ5tj9dGd7JvE3a8X4Q', NULL, 'https://www.youtube.com/@wlwt/live'),
('WCPO Cincinnati','WCPO',   '#003366', 'UCQaDjAIpg-pd44ats-HXCyA', NULL, 'https://www.youtube.com/@wcpo9/live'),
('Local 12 Cincinnati','LOCAL12','#1a3a6b','UC673WfesrYoCgG9VsekGlEQ', NULL, 'https://www.youtube.com/@local12wkrc/live'),
('FOX 19 Cincinnati','FOX19', '#cc4400', 'UCiOEUz7UCTSo6NUcQ86nFvA', NULL, 'https://www.youtube.com/@fox19now/live'),
('WKYC Cleveland', 'WKYC',   '#003087', 'UCNBmxc6FvKyxtCpUygcdINA', NULL, 'https://www.youtube.com/@wkycchannel3/live'),
('WBNS Columbus',  'WBNS',   '#003087', 'UCAKK8dbcSmckr2sWJhv5ezA', NULL, 'https://www.youtube.com/@wbns/live'),
('WTHR Indianapolis','WTHR', '#003087', 'UCSFLs1nwzqSC3Tq6cXhJkLg', NULL, 'https://www.youtube.com/@wthr13news/live'),
('WRTV Indianapolis','WRTV', '#003366', 'UCfLYcp8eh4VAC8_BBRsHhFg', NULL, 'https://www.youtube.com/@wrtv6/live'),
('WKYT Lexington', 'WKYT',   '#003087', 'UCFbkdkrsMNzADTwoat4lepg', NULL, 'https://www.youtube.com/@27newsfirst/live'),
('LEX18 Lexington','LEX18',  '#003366', 'UCeu1N74PUB5qo5qbx3aSgdw', NULL, 'https://www.youtube.com/@lex18news/live'),
('WXYZ Detroit',   'WXYZ',   '#003087', 'UC6HyKpYWmX4zsy6_bJZIK7A', NULL, 'https://www.youtube.com/@wxyztvdetroit/live'),
('WDIV Detroit',   'WDIV',   '#003366', 'UCqMdEOPBZbGPykVOhUqWqfA', NULL, 'https://www.youtube.com/@clickondetroitlocal4wdiv/live'),
('WPXI Pittsburgh','WPXI',   '#003087', 'UCBnnls7hGYmkQmuFTDDe10g', NULL, 'https://www.youtube.com/@wpxi11news/live'),
('WTAE Pittsburgh','WTAE',   '#003366', 'UCWAsWgFVqxDzwExfOdYjAcg', NULL, 'https://www.youtube.com/@wtae/live'),
-- Raw Webcam Feeds
('Inquize X',                    'INQUIZE',  '#2a4a1a', NULL, '-zGuR1qVKrU', 'https://www.youtube.com/@inquizex/live'),
('Intel Cam Ukraine',            'INTELUA',  '#1a3a2a', NULL, '11mdFpvFvqU', 'https://www.youtube.com/@intelcamslive/live'),
('Intel Cam Middle East',        'INTELME',  '#3a3a1a', NULL, '4E-iFtUM2kk', 'https://www.youtube.com/@intelcamslive/live'),
('OSINT Collective Ukraine',     'OSINTUA',  '#1a2a3a', NULL, 'SPjyFKVjWwo', 'https://www.youtube.com/@osintcollective/live'),
('OSINT Collective Iran/Israel', 'OSINTIR',  '#3a1a2a', NULL, '2yDOfFgcl9Q', 'https://www.youtube.com/@osintcollective/live'),
-- Take a Break
('CONtv',            'CONTV',    '#8b1a1a', NULL, NULL,           'https://www.youtube.com/@CONtv/live'),
('Cartoon Network',  'CN',       '#003087', NULL, NULL,           'https://www.youtube.com/@cartoonnetwork/live'),
('Adventure Time',   'ADVTIME',  '#1a6b3a', NULL, NULL,           'https://www.youtube.com/@AdventureTime/live'),
('Disney DuckTales', 'DUCKTAL',  '#003087', NULL, 'XD50huu0M24', 'https://www.youtube.com/watch?v=XD50huu0M24'),
('WB Classics',      'WBCLASSIC','#cc0000', NULL, NULL,           'https://www.youtube.com/@warnerbrosclassics/live'),
('MXC',              'MXC',      '#c8a000', NULL, '5Pv5fkwNA3w', 'https://www.youtube.com/watch?v=5Pv5fkwNA3w'),
('MXC OG',           'MXCOG',   '#c8a000', NULL, 'zT79PW9ZxCE', 'https://www.youtube.com/watch?v=zT79PW9ZxCE'),
('Mystery Science Theater 3000', 'MST3K',     '#cc0000', NULL, NULL, 'https://www.youtube.com/@MST3K/live'),
('Parks and Recreation',         'PARKSREC',  '#2d6a4f', NULL, NULL, 'https://www.youtube.com/@ParksandRecreation/live'),
('National Geographic',          'NATGEO',    '#cc9900', NULL, NULL, 'https://www.youtube.com/@NatGeo/live'),
('Ghost Hunters',                'GHOSTHNT',  '#2a2a4a', NULL, NULL, 'https://www.youtube.com/@ghosthunters/live'),
('Harry Potter',                 'HP',        '#740001', NULL, NULL, 'https://www.youtube.com/@harrypotter/live'),
('TokuSHOUTsu',                  'TOKUSHOUT', '#cc0000', NULL, NULL, 'https://www.youtube.com/@TokuSHOUTsu/live'),
('The Office',                   'OFFICE',    '#1a3a6b', NULL, NULL, 'https://www.youtube.com/@TheOffice/live'),
('WKUK',                         'WKUK',      '#5c1a8a', NULL, NULL, 'https://www.youtube.com/@OfficialWKUK/live'),
('Lofi Girl',                    'LOFIGIRL',  '#6b48c8', 'UCSJ4gkVC6NrvII8umztf0Ow', NULL, 'https://www.youtube.com/@lofigirl/live'),
('RetroClassicsTV',              'RETROTV',   '#8b4513', 'UCB4JmEyGSxq-R00f3OCnqBg', NULL, 'https://www.youtube.com/@retroclassicstv/live'),
('Boomerang UK',                 'BOOMERANG', '#cc6600', 'UCmst562fALOY2cKb4IFgqEg', NULL, 'https://www.youtube.com/@boomeranguk/live'),
('Francis Aquarium 4K',          'AQUARIUM',  '#006994', 'UCfSCCk0RpoEM3b0-z2Ndg8A', NULL, 'https://www.youtube.com/@francisaquarium4k/live'),
('Relaxing Fire Sound',          'FIREPLACE', '#cc3300', 'UCMlIZGBeueCZBUmEP-PddJg', NULL, 'https://www.youtube.com/@relaxingfiresound/live'),
('Monterey Bay Aquarium',        'MONTBAY',   '#005f73', 'UCnM5iMGiKsZg-iOlIO2ZkdQ', NULL, 'https://www.youtube.com/@montereybayaquarium/live'),
('432Hz Healing Radio',          'VIBE432',   '#4a1a6b', 'UC7KBaNMkPOn4S2e3IncY54w', NULL, 'https://www.youtube.com/@vibe432official/live'),
('Live Owl Camera',              'OWLCAM',    '#4a3000', 'UCgRm5ghF8ohRAooh-NDKUqQ', NULL, 'https://www.youtube.com/@liveowlcamera2837/live')
ON CONFLICT (tag) DO NOTHING;

-- ── Region / bias / gov metadata ───────────────────────────────────────────────
-- US Networks
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
-- US Networks — government funded
UPDATE streams SET government_funded=TRUE WHERE tag IN ('PBS','CSPAN');
-- US Regional
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
-- Europe
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
-- Europe — government funded
UPDATE streams SET government_funded=TRUE WHERE tag IN ('BBC','F24','DW','ZDFTV','TAGESSCHAU','RTVE','NOS','TVPWORLD','RAINEWS','EU');
-- Middle East
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
-- Middle East — government funded
UPDATE streams SET government_funded=TRUE WHERE tag IN ('TRT','AJE','ALARABIYA','ARABNEWS','KURD24');
-- India
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
-- India — government funded
UPDATE streams SET government_funded=TRUE WHERE tag IN ('DDNEWS','NHK','CGTN','ABCAU','KBSWORLD','ARIRANG');
-- Pakistan
UPDATE streams SET region='Pakistan', bias_label='C', bias_color='#6b7280', bias_title='Center' WHERE tag IN ('GEO','ARY','SAMAA','DAWNEN','HUM','AAJPK','EXPRESS','DUNYA','NEWS24PK');
-- Asia-Pacific
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
-- Central & South America
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
-- Raw Webcam Feeds
UPDATE streams SET region='Raw Webcam Feeds' WHERE tag IN ('INQUIZE','INTELUA','INTELME','OSINTUA','OSINTIR');
-- Take a Break
UPDATE streams SET region='Take a Break' WHERE tag IN ('CONTV','CN','ADVTIME','DUCKTAL','WBCLASSIC','MXC','MXCOG','MST3K','PARKSREC','NATGEO','GHOSTHNT','HP','TOKUSHOUT','OFFICE','WKUK','LOFIGIRL','RETROTV','BOOMERANG','AQUARIUM','FIREPLACE','MONTBAY','VIBE432','OWLCAM');
