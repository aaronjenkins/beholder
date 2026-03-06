import { useState, useEffect } from 'react'
import Header from './components/Header.jsx'
import LiveStreams from './components/LiveStreams.jsx'
import NewsTicker from './components/NewsTicker.jsx'
import StockTicker from './components/StockTicker.jsx'
import HelpModal from './components/HelpModal.jsx'
import AdminPage from './components/AdminPage.jsx'

const HELP_STORAGE_KEY = 'beholder_help_dismissed'
const IS_ADMIN = window.location.pathname.startsWith('/admin')

export default function App() {
  if (IS_ADMIN) return <AdminPage />
  return <MainApp />
}

function MainApp() {
  const [breakMode, setBreakMode] = useState(false)
  const [showHelp, setShowHelp] = useState(() => localStorage.getItem(HELP_STORAGE_KEY) !== '1')
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [liveCount, setLiveCount] = useState(0)
  const [ytBlockedUntil, setYtBlockedUntil] = useState(null)

  useEffect(() => {
    function check() {
      fetch('/api/refresh_status').then(r => r.json()).then(js => {
        setYtBlockedUntil(js.yt_blocked_until || null)
      }).catch(() => {})
    }
    check()
    const t = setInterval(check, 60_000)
    return () => clearInterval(t)
  }, [])

  function handleHelpClick() {
    setShowHelp(true)
    setIsManualOpen(true)
  }

  return (
    <div className="app">
      <HelpModal visible={showHelp} onVisibleChange={setShowHelp} isManual={isManualOpen} />
      <Header onHelpClick={handleHelpClick} liveCount={liveCount} />
      {ytBlockedUntil && (
        <div className="yt-block-banner">
          Stream URLs may be out of date — showing last known live streams. Resumes at{' '}
          {new Date(ytBlockedUntil * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} tomorrow.
        </div>
      )}
      <LiveStreams onBreakMode={setBreakMode} onLiveCount={setLiveCount} ytBlockedUntil={ytBlockedUntil} />
      {!breakMode && <NewsTicker />}
      {!breakMode && <StockTicker />}
    </div>
  )
}
