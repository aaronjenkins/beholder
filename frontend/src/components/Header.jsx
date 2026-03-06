import { useState, useEffect, useRef } from 'react'
import { MdOutlineAdminPanelSettings, MdAttachMoney } from 'react-icons/md'
import { RiLifebuoyLine } from 'react-icons/ri'

function formatTime(d, tz, use24) {
  try {
    const opts = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: !use24 }
    if (tz && tz !== 'local') opts.timeZone = tz
    return new Intl.DateTimeFormat(undefined, opts).format(d)
  } catch (e) {
    return d.toTimeString().slice(0, 8)
  }
}

function useClock(tz, use24) {
  const [time, setTime] = useState(() => formatTime(new Date(), tz, use24))
  useEffect(() => {
    const t = setInterval(() => setTime(formatTime(new Date(), tz, use24)), 1000)
    return () => clearInterval(t)
  }, [tz, use24])
  return time
}

export default function Header({ onHelpClick, liveCount }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const resolvedTZ = (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'local'
  const [tz, setTz] = useState(() => localStorage.getItem('clock_tz') || resolvedTZ || 'local')
  const [use24, setUse24] = useState(() => (localStorage.getItem('clock_24') === '1'))
  const [status, setStatus] = useState({ last_refresh: null, interval: 1800, stable_interval: 21600 })
  const ref = useRef(null)
  const [dropdownStyle, setDropdownStyle] = useState({})
  const clock = useClock(tz, use24)

  useEffect(() => {
    localStorage.setItem('clock_tz', tz)
  }, [tz])
  useEffect(() => {
    localStorage.setItem('clock_24', use24 ? '1' : '0')
  }, [use24])

  // fetch refresh status once on mount
  useEffect(() => {
    let mounted = true
    fetch('/api/refresh_status').then(r => r.json()).then(js => { if (mounted) setStatus(js) }).catch(() => {})
    return () => { mounted = false }
  }, [])

  // dynamically inject Ko-fi mini widget script so the inline button becomes the official widget
  useEffect(() => {
    if (typeof document === 'undefined') return
    const src = 'https://cdn.ko-fi.com/cdn/widget/mini.js'
    if (!document.querySelector(`script[src="${src}"]`)) {
      const s = document.createElement('script')
      s.src = src
      s.defer = true
      document.body.appendChild(s)
    }
  }, [])

  // timezone options: prefer Intl.supportedValuesOf('timeZone') when available, otherwise use curated list
  const tzOptions = (typeof Intl !== 'undefined' && Intl.supportedValuesOf && typeof Intl.supportedValuesOf === 'function')
    ? Intl.supportedValuesOf('timeZone')
    : [
      'UTC','America/New_York','America/Los_Angeles','Europe/London','Europe/Paris','Asia/Tokyo','Asia/Shanghai','Australia/Sydney'
    ]
  // ensure 'local' option at front
  const tzList = ['local', ...tzOptions.filter(t => t !== 'local')]

  // close on outside click
  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // compute dropdown placement to avoid overflowing the viewport
  useEffect(() => {
    if (!menuOpen || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const dropdownW = 280
    const spaceRight = window.innerWidth - rect.right
    if (spaceRight < dropdownW) {
      // shift the dropdown left so it doesn't overflow the viewport
      // compute left relative to the trigger: rect.width - dropdownW (negative)
      const desiredLeft = rect.width - dropdownW
      // ensure we don't push beyond the viewport left edge
      const minLeft = -rect.left + 8
      const leftPx = Math.max(desiredLeft, minLeft)
      setDropdownStyle({ right: 'auto', left: `${leftPx}px` })
    } else {
      setDropdownStyle({ right: 0, left: 'auto' })
    }
  }, [menuOpen])

  const now = Date.now() / 1000
  const last = status.last_refresh || now
  const nextRefresh = last + (status.interval || 1800)
  const nextStable = last + (status.stable_interval || 21600)
  const secLeft = Math.max(0, Math.round(nextRefresh - now))
  const secLeftStable = Math.max(0, Math.round(nextStable - now))

  function fmtCountDown(s) {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    return `${h > 0 ? h + ':' : ''}${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  return (
    <div className="header">
      <div className="header-row1">
        <img src="/logo.png" alt="Beholder" className="header-logo" />
        <span className="title">Beholder</span>
        <span className="tagline">
          monitoring the situation...
          {liveCount > 0 && <><span className="rec-dot" /><span className="rec-count">{liveCount} live</span></>}
        </span>
        <div className="header-spacer" />
        <a href="https://github.com/aaronjenkins/beholder" target="_blank" rel="noopener noreferrer" className="github-btn" title="View on GitHub">
          <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          GitHub
        </a>
        <a href="https://ko-fi.com/aaronjenkins" target="_blank" rel="noopener noreferrer" className="github-btn" title="Support on Ko-fi">
          <MdAttachMoney style={{verticalAlign:'middle'}} />
          <span style={{marginLeft:8}}>Ko-fi</span>
        </a>
        <div className="clock-menu" ref={ref} style={{position:'relative', display:'inline-block'}}>
          <button className="clock" onClick={() => setMenuOpen(v => !v)} title="Clock">
            {clock}
          </button>
          {menuOpen && (
            <div className="region-dropdown region-dropdown--subgroups open clock-dropdown" style={{position:'absolute', top:'1.8rem', zIndex:50, minWidth:220, ...dropdownStyle}}>
              <div style={{fontSize:12, marginBottom:8, color:'var(--text-dim)'}}><strong>Next refresh:</strong> {fmtCountDown(secLeft)}</div>
              <div style={{fontSize:12, marginBottom:8, color:'var(--text-dim)'}}><strong>Next stable refresh:</strong> {fmtCountDown(secLeftStable)}</div>
              <div style={{borderTop:'1px solid var(--border)', margin:'8px 0'}} />
              <div style={{marginBottom:8}}>
                <label style={{display:'block', fontSize:12, color:'var(--text-dim)'}}>Time zone</label>
                <select value={tz} onChange={e => setTz(e.target.value)} style={{width:'100%'}}>
                  {tzList.map(t => (
                    <option key={t} value={t}>{t === 'local' ? 'Local (system)' : t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{display:'flex', alignItems:'center', gap:8, color:'var(--text-dim)'}}>
                  <input type="checkbox" checked={use24} onChange={e => setUse24(e.target.checked)} />
                  <span style={{fontSize:12}}>Use 24-hour clock</span>
                </label>
              </div>
            </div>
          )}
        </div>
        <a href="/admin" className="help-btn" title="Admin"><MdOutlineAdminPanelSettings /></a>
        <button className="help-btn" onClick={onHelpClick} title="Help"><RiLifebuoyLine /></button>
      </div>
    </div>
  )
}
