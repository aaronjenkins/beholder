import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api.js'

// Bias ratings based on AllSides Media Bias Ratings & Ad Fontes Media
// Scale: L (Left), LL (Lean Left), C (Center), LR (Lean Right), R (Right)
const BIAS = {
  L:  { label: 'L',  color: '#1d4ed8', title: 'Left' },
  LL: { label: 'L–', color: '#60a5fa', title: 'Lean Left' },
  C:  { label: 'C',  color: '#6b7280', title: 'Center' },
  LR: { label: 'R–', color: '#f97316', title: 'Lean Right' },
  R:  { label: 'R',  color: '#dc2626', title: 'Right' },
}

const FEEDS = [
  { source: 'BBC',      url: 'https://www.bbc.com/news/world',    bias: BIAS.C  },
  { source: 'CNN',      url: 'https://www.cnn.com',               bias: BIAS.LL },
  { source: 'REUTERS',  url: 'https://www.reuters.com',           bias: BIAS.C  },
  { source: 'AP',       url: 'https://apnews.com',                bias: BIAS.C  },
  { source: 'FT',       url: 'https://www.ft.com',                bias: BIAS.C  },
  { source: 'RCP',      url: 'https://www.realclearpolitics.com', bias: BIAS.LR },
  { source: 'AXIOS',    url: 'https://www.axios.com',             bias: BIAS.LL },
  { source: 'THEHILL',  url: 'https://thehill.com',               bias: BIAS.C  },
  { source: 'POLITICO', url: 'https://www.politico.com',          bias: BIAS.LL },
  { source: 'DRUDGE',   url: 'https://www.drudgereport.com',      bias: BIAS.R  },
]

export default function NewsTicker() {
  const [items, setItems] = useState([])
  const [paused, setPaused] = useState(false)
  const [showFeeds, setShowFeeds] = useState(false)
  const [hidden, setHidden] = useState(new Set())
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    fetchNews()
    const t = setInterval(fetchNews, 5 * 60 * 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!showFeeds) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setShowFeeds(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showFeeds])

  async function fetchNews() {
    try {
      const r = await apiFetch('/api/news')
      const data = await r.json()
      if (data.length) setItems(data)
    } catch {}
  }

  function toggleSource(source) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(source) ? next.delete(source) : next.add(source)
      return next
    })
  }

  const visible = items.filter(item => !hidden.has(item.source))

  if (!items.length) return null

  const duration = Math.max(40, visible.length * 8)

  return (
    <div className="news-ticker" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="ticker-label-wrap" ref={panelRef}>
        <button
          className={'ticker-label' + (showFeeds ? ' active' : '')}
          onClick={() => setShowFeeds(v => !v)}
          title="Show news sources"
        >
          NEWS
        </button>
        {showFeeds && (
          <div className="ticker-feeds-panel">
            <div className="ticker-feeds-title">News Sources</div>
            <button className="ticker-hide-btn" onClick={() => { setCollapsed(v => !v); setShowFeeds(false) }}>
              {collapsed ? '▶ Show Ticker' : '✕ Hide Ticker'}
            </button>
            {FEEDS.map(f => {
              const on = !hidden.has(f.source)
              return (
                <div key={f.source} className={'ticker-feed-item' + (on ? '' : ' ticker-feed-off')}>
                  <button
                    className={'ticker-feed-toggle' + (on ? ' on' : '')}
                    onClick={() => toggleSource(f.source)}
                    title={on ? 'Hide from ticker' : 'Show in ticker'}
                  >
                    <span className="ticker-feed-source">{f.source}</span>
                  </button>
                  <span
                    className="ticker-bias-badge"
                    style={{ background: f.bias.color }}
                    title={`Bias: ${f.bias.title} (AllSides / Ad Fontes)`}
                  >
                    {f.bias.label}
                  </span>
                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="ticker-feed-url">
                    {f.url.replace('https://', '')}
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {!collapsed && <div className="ticker-track">
        {visible.length > 0
          ? <div className="ticker-content" style={{ animationDuration: `${duration}s`, animationPlayState: paused ? 'paused' : 'running' }}>
              {[...visible, ...visible].map((item, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-source">{item.source}</span>
                  {item.link
                    ? <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                    : item.title}
                  <span className="ticker-sep">◆</span>
                </span>
              ))}
            </div>
          : <div className="ticker-empty">All sources hidden</div>
        }
      </div>}
    </div>
  )
}
