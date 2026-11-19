import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import WelcomeScreen from './pages/WelcomeScreen'
import Signup from './pages/Signup'
import Desktop from './components/desktop/Desktop'
import ProtectedRoute from './components/ProtectedRoute'
import BootScreen from './components/desktop/BootScreen'
import { WindowManagerProvider } from './context/WindowManagerContext'

const BOOT_FLAG = 'curiositylab.booted'

function App() {
  const [booted, setBooted] = useState(() => sessionStorage.getItem(BOOT_FLAG) === 'true')

  if (!booted) {
    return (
      <BootScreen
        onDone={() => {
          sessionStorage.setItem(BOOT_FLAG, 'true')
          setBooted(true)
        }}
      />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<WelcomeScreen />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/desktop"
        element={
          <ProtectedRoute>
            <WindowManagerProvider>
              <Desktop />
            </WindowManagerProvider>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
