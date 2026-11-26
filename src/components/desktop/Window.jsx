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

const MIN_WIDTH = 240
const MIN_HEIGHT = 160

// Edge/corner drag zones for resizing — rendered around the window frame when it isn't
// maximized. Each one grabs the pointer (same pattern as the title bar drag below) and
// recomputes width/height/position from how far the pointer has moved since pointerdown.
const RESIZE_HANDLES = [
  { dir: 'n', className: 'top-0 left-2 right-2 h-1.5 cursor-ns-resize' },
  { dir: 's', className: 'bottom-0 left-2 right-2 h-1.5 cursor-ns-resize' },
  { dir: 'w', className: 'top-2 bottom-2 left-0 w-1.5 cursor-ew-resize' },
  { dir: 'e', className: 'top-2 bottom-2 right-0 w-1.5 cursor-ew-resize' },
  { dir: 'nw', className: 'top-0 left-0 w-2.5 h-2.5 cursor-nwse-resize' },
  { dir: 'se', className: 'bottom-0 right-0 w-2.5 h-2.5 cursor-nwse-resize' },
  { dir: 'ne', className: 'top-0 right-0 w-2.5 h-2.5 cursor-nesw-resize' },
  { dir: 'sw', className: 'bottom-0 left-0 w-2.5 h-2.5 cursor-nesw-resize' },
]

export default function Window({ win, isTop, children }) {
  const { closeWindow, focusWindow, minimizeWindow, toggleMaximize, moveWindow, resizeWindow } = useWindowManager()
  const dragState = useRef(null)
  const resizeState = useRef(null)

  const onResizePointerDown = (dir) => (e) => {
    e.stopPropagation()
    focusWindow(win.id)
    resizeState.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      originX: win.x,
      originY: win.y,
      originW: win.width,
      originH: win.height,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onResizePointerMove = (e) => {
    const r = resizeState.current
    if (!r) return
    const dx = e.clientX - r.startX
    const dy = e.clientY - r.startY
    let { originX: x, originY: y, originW: w, originH: h } = r

    if (r.dir.includes('e')) w = Math.max(MIN_WIDTH, r.originW + dx)
    if (r.dir.includes('s')) h = Math.max(MIN_HEIGHT, r.originH + dy)
    if (r.dir.includes('w')) {
      w = Math.max(MIN_WIDTH, r.originW - dx)
      x = r.originX + (r.originW - w)
    }
    if (r.dir.includes('n')) {
      h = Math.max(MIN_HEIGHT, r.originH - dy)
      y = r.originY + (r.originH - h)
    }

    resizeWindow(win.id, w, h)
    if (x !== r.originX || y !== r.originY) moveWindow(win.id, x, y)
  }

  const onResizePointerUp = () => {
    resizeState.current = null
  }

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
      {!win.maximized
        ? RESIZE_HANDLES.map(({ dir, className }) => (
            <div
              key={dir}
              className={`absolute z-20 ${className}`}
              onPointerDown={onResizePointerDown(dir)}
              onPointerMove={onResizePointerMove}
              onPointerUp={onResizePointerUp}
            />
          ))
        : null}
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
      <div data-window-body={win.id} className="flex-1 min-h-0 bg-[#ece9d8] p-2 flex flex-col">{children}</div>
    </div>
  )
}
