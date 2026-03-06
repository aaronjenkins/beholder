import { useState, useEffect, useRef, useMemo } from 'react'
// using raw iframe embeds instead of ReactPlayer / react-youtube
import { TbDeviceTv } from 'react-icons/tb'
import { LuBrain } from 'react-icons/lu'
import { FiPlus, FiMenu, FiX, FiMaximize2 } from 'react-icons/fi'
// removed drag-and-drop for simpler iframe-based player grid

const BIAS_OPTIONS = [
  { label: 'L',  color: '#1d4ed8', title: 'Left' },
  { label: 'L–', color: '#60a5fa', title: 'Lean Left' },
  { label: 'C',  color: '#6b7280', title: 'Center' },
  { label: 'R–', color: '#f97316', title: 'Lean Right' },
  { label: 'R',  color: '#dc2626', title: 'Right' },
]

// Defines display order of regions. Subregions within each region are alphabetized automatically.
const REGION_ORDER = [
  'US', 'US Regional', 'Europe', 'Middle East', 'India', 'Pakistan',
  'Asia-Pacific', 'Central & South America', 'Take a Break',
]

const BREAK_LABEL = 'Take a Break'

function calcLayout(n, w, h) {
  if (n === 0 || w === 0 || h === 0) return { cols: 1, cellH: h }
  let bestCols = 1, bestArea = 0
  for (let c = 1; c <= n; c++) {
    const rows = Math.ceil(n / c)
    const cellW = w / c
    const cellH = cellW * 9 / 16
    if (cellH * rows <= h) {
      const area = cellW * cellH
      if (area > bestArea) { bestArea = area; bestCols = c }
    }
  }
  return { cols: bestCols, cellH: (w / bestCols) * 9 / 16 }
}

// Using simple static grid cells (no reordering)


export default function LiveStreams({ onBreakMode, onLiveCount }) {
    // Track menu visibility for desktop
    const [menuVisible, setMenuVisible] = useState(true)
  const [streams, setStreams] = useState([])
  // Single source of truth: { [tag]: 'grid' | 'pinned' }
  const [watchList, setWatchList] = useState(() => {
    if (localStorage.getItem('autoplay') === 'false') return {}
    try {
      const saved = localStorage.getItem('watchList')
      if (saved) return JSON.parse(saved)
      // migrate from old separate active/poppedTag storage
      const savedActive = JSON.parse(localStorage.getItem('active') || '[]')
      const savedPopped = localStorage.getItem('poppedTag')
      const wl = {}
      if (Array.isArray(savedActive)) savedActive.forEach(t => { wl[t] = 'grid' })
      if (savedPopped) wl[savedPopped] = 'pinned'
      return wl
    } catch { return {} }
  })
  const active = useMemo(() => Object.keys(watchList), [watchList])
  const poppedTag = useMemo(() => Object.keys(watchList).find(t => watchList[t] === 'pinned') || null, [watchList])
  const [cc, setCc] = useState(() => localStorage.getItem('cc') !== 'false')
  const [muted, setMuted] = useState(() => {
    try {
      const saved = localStorage.getItem('watchList')
      const wl = saved ? JSON.parse(saved) : null
      if (wl && Object.keys(wl).length > 0) return true
      const savedActive = JSON.parse(localStorage.getItem('active') || '[]')
      if (savedActive.length > 0) return true
    } catch {}
    return localStorage.getItem('muted') !== 'false'
  })
  const [streamMutes, setStreamMutes] = useState({})
  const [gridSize, setGridSize] = useState({ w: 0, h: 0 })
  const [selectorH, setSelectorH] = useState(0)
  const [userCols, setUserCols] = useState(() => {
    const v = localStorage.getItem('cols')
    return v !== null ? Number(v) : 3
  })
  const [isBreak, setIsBreak] = useState(false)
  const [fontSize, setFontSize] = useState(() => {
    const v = localStorage.getItem('fontSize')
    return v !== null ? Number(v) : 14
  })
  const breakIndexRef = useRef(Math.floor(Math.random() * 1000))
  const [hiddenBias, setHiddenBias] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('hiddenBias')) || []) } catch { return new Set() }
  })
  const [openRegion, setOpenRegion] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpandedRegion, setMobileExpandedRegion] = useState(null)
  const [modesOpen, setModesOpen] = useState(false)
  const [activeOrder, setActiveOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem('activeOrder')) || [] } catch { return [] }
  })

  // --- Ensure streamMap is declared before any usage ---
  const streamMap = useMemo(() => Object.fromEntries(streams.map(s => [s.tag, s])), [streams])
  const count = active.length
  const activeStreams = useMemo(() =>
    Object.keys(watchList)
      .filter(t => watchList[t] === 'grid')
      .sort((a, b) => a.localeCompare(b))
      .map(t => streamMap[t])
      .filter(Boolean)
      .filter(s => !s.bias_label || !hiddenBias.has(s.bias_label))
  , [watchList, streamMap, hiddenBias])

  const gridRef = useRef(null)
  const selectorRef = useRef(null)
  const drawerTouchX = useRef(null)
  const iframeRefs = useRef({})
  const mutedRef = useRef(muted)
  const streamMutesRef = useRef(streamMutes)

  // no drag-and-drop sensors — static grid

  function fetchStreams() {
    fetch('/api/streams')
      .then(r => r.json())
      .then(data => {
        const live = data.filter(s => s.embed_url)
        setStreams(live)
        setWatchList(prev => Object.fromEntries(Object.entries(prev).filter(([tag]) => live.some(s => s.tag === tag))))
        setActiveOrder(prev => prev.filter(tag => live.some(s => s.tag === tag)))
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchStreams()
    // Re-fetch every 90 seconds so the UI picks up newly live streams
    // without requiring a manual page refresh
    const interval = setInterval(fetchStreams, 90_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!gridRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setGridSize({ w: e.contentRect.width, h: e.contentRect.height })
    })
    ro.observe(gridRef.current)
    return () => ro.disconnect()
  // re-run when the grid element appears or active stream count changes
  }, [gridRef.current, count])

  useEffect(() => {
    if (!selectorRef.current) return
    const ro = new ResizeObserver(([e]) => setSelectorH(e.contentRect.height))
    ro.observe(selectorRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  useEffect(() => { localStorage.setItem('watchList', JSON.stringify(watchList)) }, [watchList])
  useEffect(() => { localStorage.setItem('cols', userCols ?? '') }, [userCols])
  useEffect(() => { localStorage.setItem('muted', muted) }, [muted])
  useEffect(() => { localStorage.setItem('cc', cc) }, [cc])

  // Keep refs current for use in stable callbacks
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { streamMutesRef.current = streamMutes }, [streamMutes])

  function sendMuteCmd(tag, iframe) {
    const isStreamMuted = streamMutesRef.current[tag] !== undefined
      ? streamMutesRef.current[tag]
      : mutedRef.current
    try {
      iframe.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: isStreamMuted ? 'mute' : 'unMute', args: [] }),
        '*'
      )
    } catch {}
  }

  // Sync mute state to all iframes via postMessage (no iframe reload needed)
  useEffect(() => {
    Object.entries(iframeRefs.current).forEach(([tag, iframe]) => {
      if (iframe) sendMuteCmd(tag, iframe)
    })
  }, [muted, streamMutes]) // eslint-disable-line react-hooks/exhaustive-deps

  // When a YouTube player reports ready, apply current mute state immediately
  useEffect(() => {
    function onMessage(e) {
      if (!e.data) return
      try {
        const data = JSON.parse(e.data)
        if (data.event === 'onReady') {
          const entry = Object.entries(iframeRefs.current).find(([, el]) => el?.contentWindow === e.source)
          if (entry) sendMuteCmd(entry[0], entry[1])
        }
      } catch {}
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { localStorage.setItem('hiddenBias', JSON.stringify([...hiddenBias])) }, [hiddenBias])


  useEffect(() => {
    if (!openRegion && !modesOpen) return
    function handle(e) {
      if (
        e.target.closest('.region-dropdown') ||
        e.target.closest('.region-toggle') ||
        e.target.closest('.mobile-sheet-overlay')
      ) return
      setOpenRegion(null)
      setModesOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [openRegion, modesOpen])

  function exitBreak() {
    onBreakMode?.(false)
    setIsBreak(false)
    setUserCols(3)
  }

  function addRegion(tags) {
    exitBreak()
    const available = tags.filter(t => streams.some(s => s.tag === t))
    setWatchList(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([t]) => !breakTags.has(t)))
      available.forEach(t => { if (!next[t]) next[t] = 'grid' })
      return next
    })
  }

  function toggle(tag) {
    const isBreakTag = breakTags.has(tag)
    if (!isBreakTag) exitBreak()
    setWatchList(prev => {
      const next = isBreakTag
        ? { ...prev }
        : Object.fromEntries(Object.entries(prev).filter(([t]) => !breakTags.has(t)))
      if (next[tag]) {
        delete next[tag]
      } else {
        next[tag] = 'grid'
      }
      if (Object.keys(next).length <= 2) setUserCols(null)
      return next
    })
  }


  function toggleStreamMute(tag) {
    setStreamMutes(prev => {
      const current = prev[tag] !== undefined ? prev[tag] : muted
      return { ...prev, [tag]: !current }
    })
  }

  function takeBreak(tags) {
    const available = tags.filter(t => streams.some(s => s.tag === t))
    if (!available.length) return
    const pick = available[breakIndexRef.current % available.length]
    breakIndexRef.current += 1
    setWatchList({ [pick]: 'grid' })
    setUserCols(1)
    setIsBreak(true)
    onBreakMode?.(true)
  }

  function toggleRegion(tags) {
    exitBreak()
    const available = tags.filter(t => streams.some(s => s.tag === t))
    const allOn = available.every(t => watchList[t] !== undefined)
    setWatchList(prev => {
      const next = Object.fromEntries(Object.entries(prev).filter(([t]) => !breakTags.has(t)))
      if (allOn) {
        available.forEach(t => delete next[t])
      } else {
        available.forEach(t => { if (!next[t]) next[t] = 'grid' })
      }
      return next
    })
  }

  // no drag-and-drop handling in simpler iframe mode

  // Build a lookup for quick access
  // ...existing code...

  // keep activeOrder in sync with selected streams
  useEffect(() => {
    setActiveOrder(prev => {
      // preserve existing order; append new tags at end
      const kept = prev.filter(t => active.includes(t))
      const added = active.filter(t => !kept.includes(t))
      return [...kept, ...added]
    })
  }, [active])

  // When rendering we keep the DOM order stable (alphabetical) and
  // use CSS "order" to position cells according to activeOrder. That way
  // the iframe elements themselves never move, avoiding reloads.
  // ...existing code...

  // Only show bias filter buttons for biases present in currently selected streams
  const activeBiasOptions = useMemo(() => {
    const present = new Set(streams.filter(s => active.includes(s.tag)).map(s => s.bias_label).filter(Boolean))
    return BIAS_OPTIONS.filter(b => present.has(b.label))
  }, [streams, active])
  const w = gridSize.w, h = gridSize.h

  const isMobile = w > 0 && w <= 640
  const isTablet = w > 640 && w <= 1024

  const { cols, cellH } = useMemo(() => {
    // if we haven't measured the grid yet, give a reasonable default height
    if (w === 0 || h === 0) return { cols: 1, cellH: 150 }
    // Available vertical space: viewport minus header (~57px), selector, tickers (56px when visible), gaps/padding (~16px)
    const tickerH = isBreak ? 0 : 56
    const availableH = window.innerHeight - 57 - selectorH - tickerH - 16
    const capH = (h) => availableH > 100 ? Math.min(h, availableH) : h
    if (isMobile) {
      return { cols: 1, cellH: capH(w * 9 / 16) }
    }
    if (isTablet) {
      return { cols: 2, cellH: capH((w / 2) * 9 / 16) }
    }
    // desktop: default 3 columns unless user overrides
    const autoCols = 3
    const c = userCols !== null ? Math.min(Math.max(1, userCols), 20) : autoCols
    return { cols: c, cellH: capH((w / c) * 9 / 16) }
  }, [count, w, h, selectorH, isMobile, isTablet, userCols, isBreak])

  const gridStyle = {
    '--cols': cols,
    '--cellH': `${cellH}px`,
  }
  const ccParam = cc ? '&cc_load_policy=1&cc_lang_pref=en' : ''

  // using raw iframe embeds for players

  useEffect(() => { localStorage.setItem('activeOrder', JSON.stringify(activeOrder)) }, [activeOrder])

  // Build regions structure from DB data, respecting REGION_ORDER for display order
  const regions = useMemo(() => {
    const byRegion = {}
    for (const s of streams) {
      const r = s.region ?? '__unknown__'
      if (!byRegion[r]) byRegion[r] = {}
      const sg = s.subregion ?? '__flat__'
      if (!byRegion[r][sg]) byRegion[r][sg] = []
      byRegion[r][sg].push(s)
    }
    return REGION_ORDER
      .filter(label => byRegion[label])
      .map(label => {
        const sgMap = byRegion[label]
        const keys = Object.keys(sgMap)
        const isFlat = keys.length === 1 && keys[0] === '__flat__'
        if (isFlat) {
          return { label, tags: sgMap['__flat__'].map(s => s.tag) }
        }
        return {
          label,
          subgroups: keys
            .filter(sg => sg !== '__flat__')
            .sort((a, b) => a.localeCompare(b))
            .map(sg => ({ label: sg, tags: sgMap[sg].map(s => s.tag) })),
        }
      })
  }, [streams])

  const breakTags = useMemo(() => {
    const br = regions.find(r => r.label === BREAK_LABEL)
    return new Set(br?.tags ?? [])
  }, [regions])

  // Emit live count (excluding break channels) to parent
  useEffect(() => {
    const count = streams.filter(s => !breakTags.has(s.tag)).length
    onLiveCount?.(count)
  }, [streams, breakTags])

  return (
    <div className="live-streams">

      {/* Mobile-only sticky bar */}
      <div className="mobile-menu-bar">
        <button className="mobile-menu-open-btn" onClick={() => setMobileMenuOpen(true)}>
          <FiMenu />
          <span>Streams</span>
          {count > 0 && <span className="mobile-menu-badge">{count}</span>}
        </button>
        <div style={{ flex: 1 }} />
        <button className={'stream-pill stream-pill--mute' + (muted ? ' on' : '')} onClick={() => { setMuted(v => !v); setStreamMutes({}) }}>
          {muted ? <i className="fas fa-volume-xmark" /> : <i className="fas fa-volume-high" />}
        </button>
        <button className={'stream-pill stream-pill--cc' + (cc ? ' on' : '')} onClick={() => setCc(v => !v)}>
          {cc ? <i className="fas fa-closed-captioning" /> : <i className="far fa-closed-captioning" />}
        </button>
        {count > 0 && (
          <button className="stream-pill stream-pill--clear" onClick={() => { exitBreak(); setWatchList({}) }}>
            ✕ {count}
          </button>
        )}
      </div>

      {/* Mobile stream drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}
            onTouchStart={e => { drawerTouchX.current = e.touches[0].clientX }}
            onTouchEnd={e => {
              if (drawerTouchX.current === null) return
              const dx = e.changedTouches[0].clientX - drawerTouchX.current
              drawerTouchX.current = null
              if (dx < -60) setMobileMenuOpen(false)
            }}
          >
            <div className="mobile-drawer-header">
              <span className="mobile-drawer-title">STREAMS</span>
              {count > 0 && <span className="mobile-menu-badge">{count} active</span>}
              <div style={{ flex: 1 }} />
              {count > 0 && (
                <button className="stream-pill stream-pill--clear" onClick={() => { exitBreak(); setWatchList({}) }}>
                  ✕ Clear
                </button>
              )}
              <button className="mobile-drawer-close" onClick={() => setMobileMenuOpen(false)}><FiX /></button>
            </div>

            <div className="mobile-drawer-body">
              {regions.map(region => {
                const allTags = region.tags ?? region.subgroups?.flatMap(sg => sg.tags) ?? []
                const regionStreams = allTags.map(t => streamMap[t]).filter(Boolean)
                if (regionStreams.length === 0) return null
                const isBreakRegion = region.label === BREAK_LABEL
                const allOn = regionStreams.every(s => active.includes(s.tag))
                const anyOn = regionStreams.some(s => active.includes(s.tag))
                const isExpanded = mobileExpandedRegion === region.label
                return (
                  <div key={region.label} className="mobile-drawer-region">
                    <div
                      className={'mobile-drawer-region-hdr' + (allOn ? ' on' : anyOn ? ' partial' : '')}
                      onClick={() => {
                        if (isBreakRegion) { takeBreak(allTags); setMobileMenuOpen(false); return }
                        setMobileExpandedRegion(isExpanded ? null : region.label)
                      }}
                    >
                      <span className="mobile-drawer-region-name">{region.label}</span>
                      {!isBreakRegion && (
                        <button
                          className="mobile-drawer-add-btn"
                          onClick={e => { e.stopPropagation(); addRegion(allTags) }}
                          title={`Add all ${region.label}`}
                        ><FiPlus /></button>
                      )}
                      {!isBreakRegion && (
                        <span className={'mobile-drawer-caret' + (isExpanded ? ' open' : '')}>▾</span>
                      )}
                    </div>
                    {isExpanded && !isBreakRegion && (
                      <div className="mobile-drawer-streams">
                        {region.subgroups ? region.subgroups.map(sg => {
                          const sgStreams = sg.tags.map(t => streamMap[t]).filter(Boolean)
                          if (!sgStreams.length) return null
                          return (
                            <div key={sg.label} className="mobile-drawer-subgroup">
                              <span className="mobile-drawer-subgroup-lbl">{sg.label}</span>
                              <div className="mobile-drawer-pills">
                                {sgStreams.map(s => (
                                  <button key={s.tag} className={'stream-pill stream-pill--touch' + (active.includes(s.tag) ? ' on' : '')} onClick={() => toggle(s.tag)}>
                                    {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                                    {s.tag}
                                    {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        }) : (
                          <div className="mobile-drawer-pills">
                            {regionStreams.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                              <button key={s.tag} className={'stream-pill stream-pill--touch' + (active.includes(s.tag) ? ' on' : '')} onClick={() => toggle(s.tag)}>
                                {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                                {s.tag}
                                {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mobile-drawer-footer">
              <div className="col-picker">
                <button className="col-btn" onClick={() => setUserCols(c => Math.max(1, (c ?? cols) - 1))}>−</button>
                <span className="col-count">{cols} col{cols !== 1 ? 's' : ''}</span>
                <button className="col-btn" onClick={() => setUserCols(c => Math.min(20, (c ?? cols) + 1))}>+</button>
              </div>
              <button className={'stream-pill stream-pill--mute' + (muted ? ' on' : '')} onClick={() => { setMuted(v => !v); setStreamMutes({}) }}>
                {muted ? <i className="fas fa-volume-xmark" /> : <i className="fas fa-volume-high" />}
              </button>
              <button className={'stream-pill stream-pill--cc' + (cc ? ' on' : '')} onClick={() => setCc(v => !v)}>
                {cc ? <i className="fas fa-closed-captioning" /> : <i className="far fa-closed-captioning" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stream selector */}
      <div className="streams-selector-wrap" ref={selectorRef} style={{ display: menuVisible ? undefined : 'none' }}>
      <div className="streams-selector">
        <div className="selector-section selector-section--regions">
        {regions.map(region => {
          const allTags = region.tags ?? region.subgroups.flatMap(sg => sg.tags)
          const regionStreams = allTags.map(t => streamMap[t]).filter(Boolean)
          if (regionStreams.length === 0) return null
          const allOn = regionStreams.every(s => active.includes(s.tag))
          const anyOn = regionStreams.some(s => active.includes(s.tag))
          const isBreakRegion = region.label === BREAK_LABEL

          const regionEl = (
            <div key={region.label} className="region-group">
              <button
                className={'region-toggle' + (allOn ? ' on' : anyOn ? ' partial' : '') + (isBreakRegion ? ' region-toggle--break' : '') + (!isBreakRegion && openRegion === region.label ? ' dropdown-open' : '')}
                onClick={e => {
                  e.stopPropagation()
                  if (isBreakRegion) { takeBreak(allTags); return }
                  setOpenRegion(openRegion === region.label ? null : region.label)
                  setModesOpen(false)
                }}
                title={isBreakRegion ? 'Pick a random break stream' : `Toggle all ${region.label}`}
              >
                {isBreakRegion ? <><TbDeviceTv /> Take a Break</> : region.label}
                {!isBreakRegion && <span className={'region-caret' + (openRegion === region.label ? ' open' : '')}>▾</span>}
              </button>
              {!isBreakRegion && openRegion === region.label && (() => {
                const activeSgs = region.subgroups?.filter(sg => sg.tags.some(t => streamMap[t]))
                const cols = region.subgroups
                  ? Math.min(4, activeSgs?.length ?? 1)
                  : Math.min(4, Math.max(1, Math.ceil(regionStreams.length / 5)))
                return (
                <div className={'region-dropdown' + (region.subgroups ? ' region-dropdown--subgroups' : '') + ' open'} style={{ gridTemplateColumns: `repeat(${cols}, minmax(120px, 1fr))` }}>
                  <button className="region-all-btn" style={{ gridColumn: '1/-1' }} onClick={() => { addRegion(allTags); setOpenRegion(null) }}>
                    <FiPlus /> All
                  </button>
                  {region.subgroups ? (
                    region.subgroups.map(sg => {
                      const sgStreams = sg.tags.map(t => streamMap[t]).filter(Boolean)
                      if (sgStreams.length === 0) return null
                      return (
                        <div key={sg.label} className="dropdown-subgroup">
                          <button
                            className={'dropdown-subgroup-label' + (sgStreams.every(s => active.includes(s.tag)) ? ' on' : sgStreams.some(s => active.includes(s.tag)) ? ' partial' : '')}
                            onClick={() => toggleRegion(sg.tags)}
                            title={`Toggle all ${sg.label}`}
                          >{sg.label}</button>
                          {sgStreams.map(s => {
                            const on = active.includes(s.tag)
                            return (
                              <button key={s.tag} className={'stream-pill' + (on ? ' on' : '')} onClick={() => toggle(s.tag)} title={s.bias_title ? `${s.name} — Bias: ${s.bias_title}` : s.name}>
                                {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                                {s.tag}
                                {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                                {s.government_funded && <span className="stream-gov-badge" title="Government funded"><i className="fas fa-building-columns" /></span>}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })
                  ) : (<>
                    {regionStreams.sort((a, b) => a.name.localeCompare(b.name)).map(s => {
                      const on = active.includes(s.tag)
                      return (
                        <button key={s.tag} className={'stream-pill' + (on ? ' on' : '')} onClick={() => toggle(s.tag)} title={s.bias_title ? `${s.name} — Bias: ${s.bias_title}` : s.name}>
                          {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                          {s.tag}
                          {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                          {s.government_funded && <span className="stream-gov-badge"><i className="fas fa-building-columns" /></span>}
                        </button>
                      )
                    })}</>
                  )}
                </div>
                )
              })()}
            </div>
          )

          if (region.label === 'Central & South America') {
            const wildTags = ['ALMAYADEEN','OAN','ZEE','IRANINTL','CGTN','i24','AJE','GBNEWS','SKYAU','GEO','ARY','CRONICA','C5N']
            const available = wildTags.filter(t => streams.some(s => s.tag === t))
            const bigBrainOn = poppedTag === 'ZEE' && available.every(t => active.includes(t)) && active.length === available.length
            const nonBreak = streams.filter(s => !breakTags.has(s.tag))
            const modesEl = (
              <div key="__modes__" className="region-group">
                <button
                  className={'region-toggle' + (modesOpen ? ' dropdown-open' : '')}
                  onClick={e => { e.stopPropagation(); setModesOpen(v => !v); setOpenRegion(null) }}
                  title="Special modes"
                >
                  MODES <span className={'region-caret' + (modesOpen ? ' open' : '')}>▾</span>
                </button>
                {modesOpen && (
                  <div className="region-dropdown open">
                    <button
                      className="stream-pill stream-pill--all"
                      style={{ gridColumn: '1/-1' }}
                      onClick={() => { exitBreak(); const wl = {}; nonBreak.forEach(s => { wl[s.tag] = 'grid' }); setWatchList(wl); setModesOpen(false) }}
                      data-tooltip="Loading all streams may impact browser performance"
                    >
                      ⚠ All {nonBreak.length} Channels
                    </button>
                    <button
                      className={'stream-pill stream-pill--bigbrainmode' + (bigBrainOn ? ' on' : '')}
                      style={{ gridColumn: '1/-1' }}
                      onClick={() => {
                        if (bigBrainOn) { exitBreak(); setWatchList({}) }
                        else { exitBreak(); const wl = {}; available.forEach(t => { wl[t] = 'grid' }); wl['ZEE'] = 'pinned'; setWatchList(wl) }
                        setModesOpen(false)
                      }}
                    >
                      <LuBrain /> Big Brain Mode
                    </button>
                  </div>
                )}
              </div>
            )
            return [regionEl, modesEl]
          }

          return regionEl
        })}
        </div>{/* end selector-section regions */}

        <div className="streams-selector-divider" />

        <div className="selector-section selector-section--controls">
          <div className="col-pickers-stack">
            <div className="col-picker">
              <button className="col-btn" onClick={() => setUserCols(c => Math.max(1, (c ?? cols) - 1))}>−</button>
              <span className="col-count">{cols} col{cols !== 1 ? 's' : ''}</span>
              <button className="col-btn" onClick={() => setUserCols(c => Math.min(20, (c ?? cols) + 1))}>+</button>
            </div>
            <div className="col-picker">
              <button className="col-btn" onClick={() => setFontSize(s => Math.max(8, +(s - 0.5).toFixed(1)))}>−</button>
              <span className="col-count">{fontSize}px</span>
              <button className="col-btn" onClick={() => setFontSize(s => Math.min(24, +(s + 0.5).toFixed(1)))}>+</button>
            </div>
          </div>
          <button
            className={'stream-pill stream-pill--mute' + (muted ? ' on' : '')}
            onClick={() => { setMuted(v => !v); setStreamMutes({}) }}
            title={muted ? 'Unmute all streams' : 'Mute all streams'}
          >
            {muted ? <i className="fas fa-volume-xmark"></i> : <i className="fas fa-volume-high"></i>}
          </button>
          <button
            className={'stream-pill stream-pill--cc' + (cc ? ' on' : '')}
            onClick={() => setCc(v => !v)}
            title="Toggle subtitles on all streams"
          >
            {cc ? <i className="fas fa-closed-captioning"></i> : <i className="far fa-closed-captioning"></i>}
          </button>
          {count > 0 && (
            <button className="stream-pill stream-pill--clear" onClick={() => { exitBreak(); setWatchList({}) }} data-tooltip="Close all streams">
              ✕ Clear ({count})
            </button>
          )}
        </div>

      </div>

      {activeBiasOptions.length > 0 && (
        <div className="bias-toolbar">
          <span className="bias-toolbar-label">Filter by bias</span>
          {activeBiasOptions.map(b => {
            const hidden = hiddenBias.has(b.label)
            return (
              <button
                key={b.label}
                className={'bias-filter-btn' + (hidden ? ' hidden' : '')}
                style={{ '--bias-color': b.color }}
                onClick={() => setHiddenBias(prev => {
                  const next = new Set(prev)
                  next.has(b.label) ? next.delete(b.label) : next.add(b.label)
                  return next
                })}
                title={hidden ? `Show ${b.title}` : `Hide ${b.title}`}
              >
                {b.label} {b.title}
              </button>
            )
          })}
        </div>
      )}
      </div>{/* end streams-selector-wrap */}

      {/* Mobile bottom sheet */}
      {openRegion && (() => {
        const reg = regions.find(r => r.label === openRegion)
        if (!reg) return null
        const allTags = reg.tags ?? reg.subgroups?.flatMap(sg => sg.tags) ?? []
        const regionStreams = allTags.map(t => streamMap[t]).filter(Boolean)
        return (
          <div className="mobile-sheet-overlay" onClick={() => setOpenRegion(null)}>
            <div className="mobile-sheet" onClick={e => e.stopPropagation()}>
              <div className="mobile-sheet-header">
                <span className="mobile-sheet-title">{reg.label}</span>
                <button className="mobile-sheet-action" onClick={() => addRegion(allTags)}>
                  <FiPlus /> All
                </button>
                <button className="mobile-sheet-close" onClick={() => setOpenRegion(null)}>Done</button>
              </div>
              <div className="mobile-sheet-body">
                {reg.subgroups ? reg.subgroups.map(sg => {
                  const sgStreams = sg.tags.map(t => streamMap[t]).filter(Boolean)
                  if (!sgStreams.length) return null
                  const sgAllOn = sgStreams.every(s => active.includes(s.tag))
                  const sgAnyOn = sgStreams.some(s => active.includes(s.tag))
                  return (
                    <div key={sg.label} className="mobile-sheet-subgroup">
                      <button
                        className={'mobile-sheet-subgroup-label' + (sgAllOn ? ' on' : sgAnyOn ? ' partial' : '')}
                        onClick={() => toggleRegion(sg.tags)}
                      >{sg.label}</button>
                      <div className="mobile-sheet-pills">
                        {sgStreams.map(s => (
                          <button key={s.tag} className={'stream-pill stream-pill--touch' + (active.includes(s.tag) ? ' on' : '')} onClick={() => toggle(s.tag)}>
                            {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                            {s.tag}
                            {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                            {s.government_funded && <span className="stream-gov-badge"><i className="fas fa-building-columns"></i></span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                }) : (
                  <div className="mobile-sheet-pills">
                    {regionStreams.sort((a, b) => a.name.localeCompare(b.name)).map(s => (
                      <button key={s.tag} className={'stream-pill stream-pill--touch' + (active.includes(s.tag) ? ' on' : '')} onClick={() => toggle(s.tag)}>
                        {s.icon_url && <img src={s.icon_url} alt="" className="channel-icon" />}
                        {s.tag}
                        {s.bias_label && <span className="stream-bias-badge" style={{ background: s.bias_color }}>{s.bias_label}</span>}
                        {s.government_funded && <span className="stream-gov-badge"><i className="fas fa-building-columns"></i></span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Popped-out panel */}
      {poppedTag && (() => {
        const s = streamMap[poppedTag]
        if (!s) return null
        const src = (s.embed_url || s.link) + (s.embed_url ? `&mute=1${ccParam}` : '')
        return (
          <div className="ms-popped-panel" style={{ height: cellH * 2 }}>
            <button className="ms-popped-close" onClick={() => setWatchList(prev => { const next = {...prev}; if (next[s.tag] === 'pinned') next[s.tag] = 'grid'; return next })} title="Return to grid">↙ Return</button>
            {s.embed_url ? (
              <div className="ms-iframe">
                <iframe ref={el => el ? (iframeRefs.current[s.tag] = el) : delete iframeRefs.current[s.tag]} src={src} title={s.tag} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
              </div>
            ) : (
              <a className="ms-link-cell" href={s.link} target="_blank" rel="noopener noreferrer">
                <span className="stream-tag" style={{ background: s.color }}>{s.tag}</span>
                <span>{s.name}</span>
                <span className="stream-open">↗ Watch Live</span>
              </a>
            )}
          </div>
        )
      })()}

      {/* Multistream grid */}
      {count === 0 && !poppedTag ? (
        <div className="streams-empty" ref={gridRef}>Select streams above</div>
      ) : (
        <div className="multistream" ref={gridRef} style={gridStyle}>
          {activeStreams.map(s => {
            const streamMuted = streamMutes[s.tag] !== undefined ? streamMutes[s.tag] : muted
            const src = (s.embed_url || s.link) + (s.embed_url ? `&mute=1${ccParam}` : '')
            return (
              <div className="ms-cell" key={s.tag}>
                {s.embed_url ? (
                  <div className="ms-iframe">
                    <iframe ref={el => el ? (iframeRefs.current[s.tag] = el) : delete iframeRefs.current[s.tag]} src={src} title={s.tag} frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
                  </div>
                ) : (
                  <a className="ms-link-cell" href={s.link} target="_blank" rel="noopener noreferrer">
                    <span className="stream-tag" style={{ background: s.color }}>{s.tag}</span>
                    <span>{s.name}</span>
                    <span className="stream-open">↗ Watch Live</span>
                  </a>
                )}
                {!isBreak && <div className="ms-top-bar">
                  <div className="ms-bar-info">
                    {s.icon_url && <img src={s.icon_url} alt="" className="ms-bar-icon" />}
                    <span className="ms-bar-name">{s.name || s.tag}</span>
                  </div>
                  <div className="ms-bar-controls">
                    <button className="ms-ctrl ms-ctrl--mute" onClick={() => toggleStreamMute(s.tag)} title={streamMuted ? 'Unmute' : 'Mute'}>
                      {streamMuted ? <i className="fas fa-volume-xmark" /> : <i className="fas fa-volume-high" />}
                    </button>
                    <button className="ms-ctrl ms-ctrl--focus" onClick={() => setWatchList(prev => { const next = {...prev}; Object.keys(next).forEach(t => { if (next[t] === 'pinned') next[t] = 'grid' }); next[s.tag] = 'pinned'; return next })} title="Focus">
                      <FiMaximize2 />
                    </button>
                    {s.video_id && (
                      <a className="ms-ctrl ms-ctrl--yt" href={`https://www.youtube.com/watch?v=${s.video_id}`} target="_blank" rel="noopener noreferrer" title="Open on YouTube">
                        <i className="fab fa-youtube" />
                      </a>
                    )}
                    <button className="ms-ctrl ms-ctrl--close" onClick={() => toggle(s.tag)} title="Close">✕</button>
                  </div>
                </div>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
