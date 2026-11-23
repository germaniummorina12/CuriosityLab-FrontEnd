import { useEffect, useRef, useState } from 'react'
import { Minus, Square, X } from 'lucide-react'
import { useWindowManager } from '../../context/WindowManagerContext'
import {
  windowFrameBase,
  windowBorderActive,
  windowBorderInactive,
  titleBarActive,
  titleBarInactive,
  titleBarButton,
  titleBarCloseButton,
} from '../../styles/xpTheme'

export default function Window({ win, isTop, children }) {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow } = useWindowManager()
  const dragState = useRef(null)

  // Pop-in open animation — runs once per window instance (not on every minimize/restore,
  // since this component stays mounted the whole time the window exists).
  const [entered, setEntered] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const onTitlePointerDown = (e) => {
    focusWindow(win.id)
    // Don't start a drag (or capture the pointer) when the press lands on one of the
    // title bar buttons — capturing here would retarget their click to this div instead,
    // so Minimize/Maximize/Close would stop firing and a quick double-click would
    // incorrectly trigger the title bar's own onDoubleClick (maximize) instead.
    if (win.maximized || e.target.closest('button')) return
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: win.x, originY: win.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onTitlePointerMove = (e) => {
    if (!dragState.current) return
    const { startX, startY, originX, originY } = dragState.current
    const nextX = Math.min(Math.max(originX + (e.clientX - startX), -win.width + 80), window.innerWidth - 80)
    const nextY = Math.min(Math.max(originY + (e.clientY - startY), 0), window.innerHeight - 70)
    moveWindow(win.id, nextX, nextY)
  }

  const onTitlePointerUp = () => {
    dragState.current = null
  }

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: 'calc(100% - 40px)', zIndex: win.zIndex }
    : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.zIndex }

  const Icon = win.icon
  const rounding = win.maximized ? 'rounded-none' : 'rounded-t-[8px]'
  const border = isTop ? windowBorderActive : windowBorderInactive

  return (
    <div
      className={`absolute ${win.minimized ? 'hidden' : 'flex'} ${rounding} ${border} ${windowFrameBase} flex-col origin-bottom transition-all duration-200 ease-out ${
        entered ? 'opacity-100 scale-100' : 'opacity-60 scale-[0.15]'
      }`}
      style={style}
      onMouseDown={() => focusWindow(win.id)}
    >
      <div
        className={`h-[30px] flex items-center justify-between pl-2 pr-1 select-none cursor-default ${
          isTop ? titleBarActive : titleBarInactive
        }`}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
        onDoubleClick={(e) => {
          if (e.target.closest('button')) return
          toggleMaximize(win.id)
        }}
      >
        <div className="flex items-center gap-1.5 text-[12px] font-bold tracking-tight truncate">
          {Icon ? <Icon size={18} strokeWidth={2} /> : null}
          <span className="truncate">{win.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className={titleBarButton} onClick={() => minimizeWindow(win.id)} title="Minimize">
            <Minus size={12} strokeWidth={3} />
          </button>
          <button className={titleBarButton} onClick={() => toggleMaximize(win.id)} title="Maximize">
            <Square size={10} strokeWidth={3} />
          </button>
          <button className={titleBarCloseButton} onClick={() => closeWindow(win.id)} title="Close">
            <X size={13} strokeWidth={3} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-[#ece9d8] p-2 flex flex-col">{children}</div>
    </div>
  )
}
