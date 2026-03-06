import { useState, useEffect, useCallback, useRef } from 'react'

const REGIONS = [
  '', 'US', 'US Regional', 'Europe', 'Middle East', 'India', 'Pakistan',
  'Asia-Pacific', 'Central & South America', 'Raw Webcam Feeds', 'Take a Break',
]

const BIAS_OPTIONS = [
  { label: '',   color: '',        title: '' },
  { label: 'L',  color: '#1d4ed8', title: 'Left' },
  { label: 'L–', color: '#60a5fa', title: 'Lean Left' },
  { label: 'C',  color: '#6b7280', title: 'Center' },
  { label: 'R–', color: '#f97316', title: 'Lean Right' },
  { label: 'R',  color: '#dc2626', title: 'Right' },
]

const COLS = [
  { key: 'tag',              label: 'Tag',       ro: true,  w: 90 },
  { key: 'name',             label: 'Name',      w: 170 },
  { key: 'region',           label: 'Region',    w: 160, type: 'region' },
  { key: 'subregion',        label: 'Subregion', w: 120 },
  { key: 'bias_label',       label: 'Bias',      w: 60,  type: 'bias' },
  { key: 'bias_title',       label: 'Bias Title',w: 100 },
  { key: 'bias_color',       label: 'Bias Color',w: 90,  type: 'color' },
  { key: 'color',            label: 'Color',     w: 80,  type: 'color' },
  { key: 'government_funded',label: 'Gov',       w: 44,  type: 'bool' },
  { key: 'stable_video_id', label: 'Stable ID', w: 60,  type: 'bool' },
  { key: 'icon_url',         label: 'Icon',      w: 60,  type: 'icon' },
  { key: 'video_id',         label: 'Video ID',  w: 115 },
  { key: 'link',             label: 'Link',      w: 240 },
  { key: 'channel_id',       label: 'Channel ID',w: 140 },
  { key: 'last_live_at',     label: 'Last Live', w: 120, ro: true },
]

function authFetch(url, opts, token) {
  return fetch(url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'X-Admin-Token': token, ...(opts?.headers || {}) },
  })
}

// ── Auth screens ────────────────────────────────────────────────────────────────

function PhasePhone({ onSent }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function send() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail); return }
      onSent(phone, data.method_id)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="adm-auth">
      <div className="adm-auth-box">
        <div className="adm-auth-logo">BEHOLDER</div>
        <h1 className="adm-auth-title">Admin Access</h1>
        <p className="adm-auth-sub">Enter your phone number to receive a verification code via SMS.</p>
        <input
          className="adm-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+1 555 000 0000"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          autoFocus
        />
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn--primary" onClick={send} disabled={loading || !phone}>
          {loading ? 'Sending…' : 'Send Code'}
        </button>
      </div>
    </div>
  )
}

function PhaseOtp({ phone, methodId, onVerified, onBack }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function verify() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method_id: methodId, code }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail); return }
      onVerified(data.token)
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  return (
    <div className="adm-auth">
      <div className="adm-auth-box">
        <div className="adm-auth-logo">BEHOLDER</div>
        <h1 className="adm-auth-title">Verify Code</h1>
        <p className="adm-auth-sub">Code sent to <strong>{phone}</strong></p>
        <input
          className="adm-input adm-input--otp"
          type="text"
          inputMode="numeric"
          placeholder="000000"
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={e => e.key === 'Enter' && verify()}
          autoFocus
        />
        {error && <p className="adm-error">{error}</p>}
        <button className="adm-btn adm-btn--primary" onClick={verify} disabled={loading || code.length < 6}>
          {loading ? 'Verifying…' : 'Verify'}
        </button>
        <button className="adm-btn adm-btn--ghost" onClick={onBack}>← Back</button>
      </div>
    </div>
  )
}

// ── Editable cell ───────────────────────────────────────────────────────────────

function Cell({ col, value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState('')
  const inputRef = useRef(null)

  function startEdit() {
    if (col.ro) return
    setVal(col.type === 'bool' ? String(value ?? false) : (value ?? ''))
    setEditing(true)
  }

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commit(v) {
    setEditing(false)
    const coerced = col.type === 'bool' ? v === 'true' : (v || null)
    if (coerced !== value) onSave(coerced)
  }

  if (editing) {
    if (col.type === 'region') {
      return (
        <td className="adm-td adm-td--editing">
          <select ref={inputRef} className="adm-cell-input" value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => commit(val)}>
            {REGIONS.map(r => <option key={r} value={r}>{r || '—'}</option>)}
          </select>
        </td>
      )
    }
    if (col.type === 'bias') {
      return (
        <td className="adm-td adm-td--editing">
          <select ref={inputRef} className="adm-cell-input" value={val}
            onChange={e => setVal(e.target.value)}
            onBlur={() => commit(val)}>
            {BIAS_OPTIONS.map(b => <option key={b.label} value={b.label}>{b.label || '—'}</option>)}
          </select>
        </td>
      )
    }
    if (col.type === 'bool') {
      return (
        <td className="adm-td adm-td--editing">
          <select ref={inputRef} className="adm-cell-input" value={val}
            onChange={e => { commit(e.target.value) }}>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </td>
      )
    }
    return (
      <td className="adm-td adm-td--editing">
        <input ref={inputRef} className="adm-cell-input" value={val}
          onChange={e => setVal(e.target.value)}
          onBlur={() => commit(val)}
          onKeyDown={e => {
            if (e.key === 'Enter') commit(val)
            if (e.key === 'Escape') setEditing(false)
          }}
        />
      </td>
    )
  }

  return (
    <td
      className={'adm-td' + (col.ro ? ' adm-td--ro' : ' adm-td--editable')}
      style={{ minWidth: col.w }}
      onClick={startEdit}
      title={col.ro ? undefined : 'Click to edit'}
    >
      {col.type === 'icon'
        ? value
          ? <img src={value} alt="icon" style={{ width: 32, height: 32, borderRadius: '50%', display: 'block' }} />
          : <span className="adm-empty">—</span>
        : col.type === 'color' && value
        ? <span className="adm-color-cell"><span className="adm-color-swatch" style={{ background: value }} />{value}</span>
        : col.type === 'bool'
        ? <span className={value ? 'adm-check' : 'adm-empty'}>{value ? '✓' : ''}</span>
        : col.key === 'tag'
        ? <span className="adm-tag-pill">{value}</span>
        : col.key === 'link' || col.key === 'channel_id'
        ? <span className="adm-link-cell" title={value}>{value}</span>
        : value
        ? <span>{value}</span>
        : <span className="adm-empty">—</span>
      }
    </td>
  )
}

// ── Add Stream Modal ────────────────────────────────────────────────────────────

function AddModal({ token, onClose, onCreated }) {
  const [phase, setPhase] = useState('handle')
  const [handle, setHandle] = useState('')
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function lookup() {
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/admin/streams/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail); return }
      setForm(data)
      setPhase('form')
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  async function create() {
    setLoading(true); setError('')
    try {
      const res = await authFetch('/api/admin/streams', {
        method: 'POST',
        body: JSON.stringify(form),
      }, token)
      const data = await res.json()
      if (!res.ok) { setError(data.detail); return }
      onCreated()
      onClose()
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  function set(k, v) { setForm(p => ({ ...p, [k]: v })) }

  const biasByLabel = Object.fromEntries(BIAS_OPTIONS.map(b => [b.label, b]))

  return (
    <div className="adm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h2>Add Stream</h2>
          <button className="adm-btn adm-btn--ghost adm-btn--icon" onClick={onClose}>✕</button>
        </div>

        {phase === 'handle' ? (
          <div className="adm-modal-body">
            <p className="adm-modal-hint">Enter a YouTube channel handle to auto-fill stream details.</p>
            <label className="adm-label">YouTube Handle</label>
            <div className="adm-row">
              <input className="adm-input adm-input--flex" placeholder="@ChannelHandle"
                value={handle} onChange={e => setHandle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && lookup()} autoFocus />
              <button className="adm-btn adm-btn--primary" onClick={lookup} disabled={loading || !handle}>
                {loading ? '…' : 'Lookup'}
              </button>
            </div>
            {error && <p className="adm-error">{error}</p>}
          </div>
        ) : (
          <div className="adm-modal-body">
            <div className="adm-form-grid">
              {[
                { k: 'tag',        l: 'Tag' },
                { k: 'name',       l: 'Name' },
                { k: 'color',      l: 'Color' },
                { k: 'channel_id', l: 'Channel ID' },
                { k: 'video_id',   l: 'Video ID' },
                { k: 'icon_url',   l: 'Icon URL' },
              ].map(({ k, l }) => (
                <div key={k} className="adm-form-field">
                  <label className="adm-label">{l}</label>
                  <input className="adm-input" value={form[k] ?? ''} onChange={e => set(k, e.target.value)} />
                </div>
              ))}
              <div className="adm-form-field adm-form-field--wide">
                <label className="adm-label">Link</label>
                <input className="adm-input" value={form.link ?? ''} onChange={e => set('link', e.target.value)} />
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Region</label>
                <select className="adm-input" value={form.region ?? ''} onChange={e => set('region', e.target.value)}>
                  {REGIONS.map(r => <option key={r} value={r}>{r || '—'}</option>)}
                </select>
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Subregion</label>
                <input className="adm-input" value={form.subregion ?? ''} onChange={e => set('subregion', e.target.value)} />
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Bias</label>
                <select className="adm-input" value={form.bias_label ?? ''} onChange={e => {
                  const b = biasByLabel[e.target.value] || { label: '', color: '', title: '' }
                  setForm(p => ({ ...p, bias_label: b.label || null, bias_color: b.color || null, bias_title: b.title || null }))
                }}>
                  {BIAS_OPTIONS.map(b => <option key={b.label} value={b.label}>{b.label ? `${b.label} — ${b.title}` : '—'}</option>)}
                </select>
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Gov Funded</label>
                <select className="adm-input" value={String(form.government_funded ?? false)}
                  onChange={e => set('government_funded', e.target.value === 'true')}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
              <div className="adm-form-field">
                <label className="adm-label">Stable Video ID</label>
                <select className="adm-input" value={String(form.stable_video_id ?? false)}
                  onChange={e => set('stable_video_id', e.target.value === 'true')}>
                  <option value="false">Rotating</option>
                  <option value="true">Stable</option>
                </select>
              </div>
            </div>
            {error && <p className="adm-error">{error}</p>}
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn--primary" onClick={create} disabled={loading}>
                {loading ? 'Saving…' : 'Save Stream'}
              </button>
              <button className="adm-btn adm-btn--ghost" onClick={() => setPhase('handle')}>← Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main admin page ─────────────────────────────────────────────────────────────

function KeyStatusCard({ label, desc, keyStatus, onRun, running }) {
  const blocked = keyStatus?.blocked_until
  const configured = keyStatus?.configured

  function fmtTime(ts) {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="adm-status-card">
      <div className="adm-status-card-header">
        <span className="adm-status-card-title">{label}</span>
        <span className="adm-status-card-desc">{desc}</span>
      </div>
      <div className="adm-status-row">
        <span className="adm-status-label">Key</span>
        <span className={`adm-status-badge ${configured ? 'adm-status-badge--ok' : 'adm-status-badge--warn'}`}>
          {configured ? 'Configured' : 'Not set'}
        </span>
      </div>
      <div className="adm-status-row">
        <span className="adm-status-label">API</span>
        <span className={`adm-status-badge ${blocked ? 'adm-status-badge--err' : 'adm-status-badge--ok'}`}>
          {blocked ? `Blocked until ${fmtTime(blocked)} tomorrow` : 'Active'}
        </span>
      </div>
      <button
        className="adm-btn adm-btn--primary adm-btn--sm adm-status-run"
        onClick={onRun}
        disabled={running || !configured}
      >
        <i className={`fas fa-arrows-rotate${running ? ' adm-spin' : ''}`} />
        {running ? ' Running…' : ' Run Now'}
      </button>
    </div>
  )
}

export default function AdminPage() {
  const [token, setToken] = useState(() => localStorage.getItem('adm_token') || '')
  const [authPhase, setAuthPhase] = useState(token ? 'done' : 'phone')
  const [authPhone, setAuthPhone] = useState('')
  const [authMethodId, setAuthMethodId] = useState('')

  const [showAdd, setShowAdd] = useState(false)
  const [keyStatus, setKeyStatus] = useState(null)
  const [running, setRunning] = useState({})
  const [logs, setLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const logsEndRef = useRef(null)

  function logout() {
    localStorage.removeItem('adm_token')
    setToken(''); setAuthPhase('phone')
  }

  function onVerified(tok) {
    localStorage.setItem('adm_token', tok)
    setToken(tok); setAuthPhase('done')
  }

  async function loadStatus(tok = token) {
    try {
      const res = await authFetch('/api/admin/status', {}, tok)
      if (res.ok) setKeyStatus(await res.json())
    } catch {}
  }

  async function loadLogs(tok = token) {
    setLogsLoading(true)
    try {
      const res = await authFetch('/api/admin/logs', {}, tok)
      if (res.ok) setLogs(await res.json())
    } finally { setLogsLoading(false) }
  }

  useEffect(() => {
    if (authPhase !== 'done') return
    loadStatus()
    loadLogs()
    const t = setInterval(() => { loadStatus(); loadLogs() }, 30_000)
    return () => clearInterval(t)
  }, [authPhase])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function runScrape(keyNum) {
    const k = keyNum ?? 'all'
    setRunning(r => ({ ...r, [k]: true }))
    try {
      const url = keyNum ? `/api/admin/streams/rescrape?key=${keyNum}` : '/api/admin/streams/rescrape'
      const res = await authFetch(url, { method: 'POST' }, token)
      if (res.status === 401) { logout(); return }
    } catch {}
    finally {
      setRunning(r => { const n = { ...r }; delete n[k]; return n })
      await Promise.all([loadStatus(), loadLogs()])
    }
  }

  if (authPhase === 'phone') {
    return <PhasePhone onSent={(phone, methodId) => { setAuthPhone(phone); setAuthMethodId(methodId); setAuthPhase('otp') }} />
  }
  if (authPhase === 'otp') {
    return <PhaseOtp phone={authPhone} methodId={authMethodId} onVerified={onVerified} onBack={() => setAuthPhase('phone')} />
  }

  return (
    <div className="adm-page">
      <div className="adm-topbar">
        <span className="adm-topbar-title">BEHOLDER <span className="adm-topbar-sub">ADMIN</span></span>
        <div style={{ flex: 1 }} />
        <button className="adm-btn adm-btn--accent" onClick={() => setShowAdd(true)}>+ Add Stream</button>
        <button className="adm-btn adm-btn--ghost" onClick={logout}>Logout</button>
      </div>

      {showAdd && <AddModal token={token} onClose={() => setShowAdd(false)} onCreated={() => {}} />}

      <div className="adm-dashboard">
        <div className="adm-status-row-outer">
          <KeyStatusCard
            label="YT Key 1"
            desc="Rotating channels · 30 min"
            keyStatus={keyStatus?.yt_key_1}
            onRun={() => runScrape(1)}
            running={!!running[1]}
          />
          <KeyStatusCard
            label="YT Key 2"
            desc="Stable channels · 6 hr"
            keyStatus={keyStatus?.yt_key_2}
            onRun={() => runScrape(2)}
            running={!!running[2]}
          />
          <div className="adm-status-card adm-status-card--action">
            <div className="adm-status-card-header">
              <span className="adm-status-card-title">Both Keys</span>
              <span className="adm-status-card-desc">Full rescrape</span>
            </div>
            <button
              className="adm-btn adm-btn--primary adm-btn--sm adm-status-run"
              onClick={() => runScrape(null)}
              disabled={!!running['all']}
            >
              <i className={`fas fa-arrows-rotate${running['all'] ? ' adm-spin' : ''}`} />
              {running['all'] ? ' Running…' : ' Run Both Now'}
            </button>
          </div>
        </div>

        <div className="adm-logs">
          <div className="adm-logs-toolbar">
            <span className="adm-logs-title">Server Logs</span>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => loadLogs()} disabled={logsLoading}>
              <i className={`fas fa-arrows-rotate${logsLoading ? ' adm-spin' : ''}`} /> Refresh
            </button>
            <button className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setLogs([])}>Clear</button>
          </div>
          <div className="adm-logs-body">
            {logs.length === 0
              ? <span className="adm-logs-empty">No log entries</span>
              : logs.map((e, i) => (
                <div key={i} className={`adm-log-row adm-log-row--${e.level.toLowerCase()}`}>
                  <span className="adm-log-ts">{new Date(e.ts * 1000).toLocaleTimeString()}</span>
                  <span className="adm-log-level">{e.level}</span>
                  <span className="adm-log-msg">{e.msg}</span>
                </div>
              ))
            }
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
