import { useState } from 'react'

const STORAGE_KEY = 'beholder_help_dismissed'

export default function HelpModal({ visible: externalVisible, onVisibleChange, isManual }) {
  const [dontShow, setDontShow] = useState(false)

  if (!externalVisible) return null

  function dismiss() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, '1')
    onVisibleChange(false)
  }

  return (
    <div className="help-overlay" onClick={dismiss}>
      <div className="help-modal" onClick={e => e.stopPropagation()}>
        <div className="help-header">
          <span className="help-title">Welcome to Beholder</span>
          <button className="help-close" onClick={dismiss}>✕</button>
        </div>

        <div className="help-body">
          <p className="help-intro">
            Live global news streams with scrolling headlines and market data.
            Select regions or individual channels from the bar above.
          </p>

          <div className="help-section-title">Bias Ratings</div>
          <p className="help-sub">
            Channel pills and news sources display a media bias badge based on
            AllSides and Ad Fontes Media ratings.
          </p>
          <div className="help-bias-legend">
            <span className="help-bias-item">
              <span className="help-bias-badge" style={{ background: '#1d4ed8' }}>L</span>
              Left
            </span>
            <span className="help-bias-item">
              <span className="help-bias-badge" style={{ background: '#60a5fa' }}>L–</span>
              Lean Left
            </span>
            <span className="help-bias-item">
              <span className="help-bias-badge" style={{ background: '#6b7280' }}>C</span>
              Center
            </span>
            <span className="help-bias-item">
              <span className="help-bias-badge" style={{ background: '#f97316' }}>R–</span>
              Lean Right
            </span>
            <span className="help-bias-item">
              <span className="help-bias-badge" style={{ background: '#dc2626' }}>R</span>
              Right
            </span>
          </div>

          <div className="help-section-title">Government Funded</div>
          <p className="help-sub">
            Channels funded by government entities display a green building icon.
          </p>
          <div className="help-gov-legend">
            <span className="help-gov-item">
              <span className="help-gov-badge" style={{ background: '#50fa7b' }}>
                <i className="fas fa-building-columns"></i>
              </span>
              Government funded
            </span>
          </div>

          <div className="help-section-title">Controls</div>
          <div className="help-controls-list">
            <div className="help-control-row"><span className="help-key">Region button</span><span>Toggle all channels in that region on/off</span></div>
            <div className="help-control-row"><span className="help-key">Hover region</span><span>Open channel picker dropdown</span></div>
            <div className="help-control-row"><span className="help-key">Click subregion label</span><span>Toggle all channels in that subgroup</span></div>
            <div className="help-control-row"><span className="help-key">Modes</span><span>Big Brain (60+ streams) or All Channels presets</span></div>
            <div className="help-control-row"><span className="help-key">Take a Break</span><span>Random lo-fi / nature / relaxation stream; hides tickers</span></div>
            <div className="help-control-row"><span className="help-key">− / + cols</span><span>Adjust grid column count (desktop)</span></div>
            <div className="help-control-row"><span className="help-key">🔇</span><span>Mute / unmute all streams</span></div>
            <div className="help-control-row"><span className="help-key">CC</span><span>Toggle subtitles on all streams</span></div>
            <div className="help-control-row"><span className="help-key">Hover stream</span><span>Show name, mute, focus, open-on-YouTube, and close controls</span></div>
            <div className="help-control-row"><span className="help-key">Focus (⤢)</span><span>Pin stream above the grid at double-row height; hover to return</span></div>
            <div className="help-control-row"><span className="help-key">NEWS / MKT</span><span>Configure and toggle the scrolling tickers</span></div>
            <div className="help-control-row"><span className="help-key">● N live</span><span>Live channel count shown in the header (excludes break streams)</span></div>
          </div>
        </div>

        <div className="help-footer">
          {!isManual && (
            <label className="help-checkbox-label">
              <input
                type="checkbox"
                checked={dontShow}
                onChange={e => setDontShow(e.target.checked)}
              />
              Don't show again
            </label>
          )}
          <button className="help-dismiss-btn" onClick={dismiss}>Got it</button>
        </div>
      </div>
    </div>
  )
}
