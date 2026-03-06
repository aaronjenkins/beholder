import { useState } from 'react'
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

  function handleHelpClick() {
    setShowHelp(true)
    setIsManualOpen(true)
  }

  return (
    <div className="app">
      <HelpModal visible={showHelp} onVisibleChange={setShowHelp} isManual={isManualOpen} />
      <Header onHelpClick={handleHelpClick} liveCount={liveCount} />
      <LiveStreams onBreakMode={setBreakMode} onLiveCount={setLiveCount} />
      {!breakMode && <NewsTicker />}
      {!breakMode && <StockTicker />}
    </div>
  )
}
