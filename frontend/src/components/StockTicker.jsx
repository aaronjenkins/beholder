import { useState, useEffect, useRef } from 'react'
import { apiFetch } from '../api.js'

const DISPLAY = {
  '^GSPC': 'S&P 500', '^DJI': 'DOW', '^IXIC': 'NASDAQ', '^RUT': 'RUSSELL', '^VIX': 'VIX',
  '^FTSE': 'FTSE 100', '^GDAXI': 'DAX', '^FCHI': 'CAC 40', '^STOXX50E': 'EURO STOXX',
  '^N225': 'NIKKEI', '^HSI': 'HANG SENG', '^AXJO': 'ASX 200', '000001.SS': 'SHANGHAI',
  'GC=F': 'GOLD', 'SI=F': 'SILVER', 'CL=F': 'OIL', 'BRK-B': 'BRK.B',
  'BTC-USD': 'BTC', 'ETH-USD': 'ETH',
}

const GROUPS = [
  { label: 'US',         symbols: ['^GSPC', '^DJI', '^IXIC', '^RUT', '^VIX'] },
  { label: 'Europe',     symbols: ['^FTSE', '^GDAXI', '^FCHI', '^STOXX50E'] },
  { label: 'Asia',       symbols: ['^N225', '^HSI', '^AXJO', '000001.SS'] },
  { label: 'Tech',       symbols: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'] },
  { label: 'Finance',    symbols: ['JPM', 'GS', 'BAC', 'BRK-B', 'WMT'] },
  { label: 'Energy',     symbols: ['XOM', 'CL=F'] },
  { label: 'Defense',    symbols: ['LMT', 'RTX', 'NOC', 'GD', 'BA', 'LHX', 'HII', 'LDOS', 'SAIC', 'KTOS', 'PLTR'] },
  { label: 'Commodities',symbols: ['GC=F', 'SI=F', 'CL=F'] },
  { label: 'Crypto',     symbols: ['BTC-USD', 'ETH-USD'] },
]

function fmt(price) {
  if (price >= 10000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (price >= 1000)  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price < 1)      return price.toFixed(4)
  return price.toFixed(2)
}

function yahooUrl(symbol) {
  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`
}

export default function StockTicker() {
  const [quotes, setQuotes] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [hidden, setHidden] = useState(new Set())
  const [paused, setPaused] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const panelRef = useRef(null)

  useEffect(() => {
    fetchQuotes()
    const t = setInterval(fetchQuotes, 60 * 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!showPanel) return
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setShowPanel(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPanel])

  async function fetchQuotes() {
    try {
      const r = await apiFetch('/api/stocks')
      const data = await r.json()
      if (data.length) setQuotes(data)
    } catch {}
  }

  function toggleGroup(symbols) {
    setHidden(prev => {
      const next = new Set(prev)
      const allHidden = symbols.every(s => next.has(s))
      symbols.forEach(s => allHidden ? next.delete(s) : next.add(s))
      return next
    })
  }

  const visible = quotes.filter(q => !hidden.has(q.symbol)).sort((a, b) => a.symbol.localeCompare(b.symbol))

  if (!quotes.length) return null

  return (
    <div className="stock-ticker">
      <div className="stock-label-wrap" ref={panelRef}>
        <button
          className={'stock-label' + (showPanel ? ' active' : '')}
          onClick={() => setShowPanel(v => !v)}
          title="Filter market data"
        >
          MKT
        </button>
        {showPanel && (
          <div className="stock-panel">
            <div className="stock-panel-title">Market Groups</div>
            <button className="ticker-hide-btn" onClick={() => { setCollapsed(v => !v); setShowPanel(false) }}>
              {collapsed ? '▶ Show Ticker' : '✕ Hide Ticker'}
            </button>
            {GROUPS.map(g => {
              const allOn = g.symbols.every(s => !hidden.has(s))
              return (
                <div key={g.label} className={'stock-panel-item' + (allOn ? '' : ' stock-panel-off')}>
                  <button
                    className={'stock-panel-toggle' + (allOn ? ' on' : '')}
                    onClick={() => toggleGroup(g.symbols)}
                  >
                    <span className="stock-panel-name">{g.label}</span>
                  </button>
                  <span className="stock-panel-syms">{g.symbols.map(s => DISPLAY[s] || s).join(' · ')}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {!collapsed && <div className="stock-track" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {visible.length > 0
          ? <div className="stock-content" style={{ animationPlayState: paused ? 'paused' : 'running' }}>
              {[...visible, ...visible].map((q, i) => {
                const up = q.pct >= 0
                const label = DISPLAY[q.symbol] || q.symbol
                return (
                  <a key={i} className="stock-item" href={yahooUrl(q.symbol)} target="_blank" rel="noopener noreferrer">
                    <span className="stock-sym">{label}</span>
                    <span className="stock-price">{fmt(q.price)}</span>
                    <span className={'stock-chg ' + (up ? 'up' : 'dn')}>
                      {up ? '▲' : '▼'}{Math.abs(q.pct).toFixed(2)}%
                    </span>
                    <span className="stock-sep">·</span>
                  </a>
                )
              })}
            </div>
          : <div className="stock-empty">All groups hidden</div>
        }
      </div>}
    </div>
  )
}
