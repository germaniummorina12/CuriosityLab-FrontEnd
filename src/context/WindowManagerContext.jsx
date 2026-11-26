import { createContext, useContext, useRef, useState } from 'react'

const WindowManagerContext = createContext(null)

let offsetCounter = 0

export function WindowManagerProvider({ children }) {
  const [windows, setWindows] = useState([])
  const zRef = useRef(10)

  const openWindow = ({ kind, title, icon, params, width = 640, height = 440, maximized = false }) => {
    const id = `${kind}:${params?.id ?? ''}`

    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id)
      if (existing) {
        zRef.current += 1
        return prev.map((w) =>
          w.id === id ? { ...w, minimized: false, zIndex: zRef.current } : w,
        )
      }
      offsetCounter = (offsetCounter + 1) % 6
      zRef.current += 1
      return [
        ...prev,
        {
          id,
          kind,
          title,
          icon,
          params,
          x: 90 + offsetCounter * 26,
          y: 60 + offsetCounter * 26,
          width,
          height,
          zIndex: zRef.current,
          minimized: false,
          maximized,
        },
      ]
    })
  }

  const closeWindow = (id) => setWindows((prev) => prev.filter((w) => w.id !== id))

  const focusWindow = (id) => {
    zRef.current += 1
    const z = zRef.current
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: z, minimized: false } : w)))
  }

  const minimizeWindow = (id) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)))

  const showDesktop = () =>
    setWindows((prev) => prev.map((w) => ({ ...w, minimized: true })))

  const toggleMaximize = (id) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)))

  const moveWindow = (id, x, y) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)))

  const resizeWindow = (id, width, height) =>
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)))

  return (
    <WindowManagerContext.Provider
      value={{ windows, openWindow, closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow, showDesktop }}
    >
      {children}
    </WindowManagerContext.Provider>
  )
}

export function useWindowManager() {
  const ctx = useContext(WindowManagerContext)
  if (!ctx) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return ctx
}
