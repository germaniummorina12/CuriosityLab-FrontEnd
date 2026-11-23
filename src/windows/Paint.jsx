import { useEffect, useRef, useState } from 'react'
import { Pencil, Eraser, Minus, Square, Circle, Paintbrush, Download, Trash2 } from 'lucide-react'
import { buttonXp, statusBar } from '../styles/xpTheme'

const CANVAS_W = 380
const CANVAS_H = 260

const PALETTE = [
  '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4',
  '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7',
]

const TOOLS = [
  { key: 'pencil', label: 'Pencil', icon: Pencil, width: 1.5 },
  { key: 'brush', label: 'Brush', icon: Paintbrush, width: 5 },
  { key: 'eraser', label: 'Eraser', icon: Eraser, width: 14 },
  { key: 'line', label: 'Line', icon: Minus, width: 2 },
  { key: 'rect', label: 'Rectangle', icon: Square, width: 2 },
  { key: 'ellipse', label: 'Ellipse', icon: Circle, width: 2 },
]

export default function Paint() {
  const baseRef = useRef(null)
  const overlayRef = useRef(null)
  const stateRef = useRef({ drawing: false, startX: 0, startY: 0, lastX: 0, lastY: 0 })
  const [tool, setTool] = useState('pencil')
  const [color, setColor] = useState('#000000')

  useEffect(() => {
    const base = baseRef.current
    base.getContext('2d').fillStyle = '#ffffff'
    base.getContext('2d').fillRect(0, 0, CANVAS_W, CANVAS_H)
  }, [])

  const getPos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const drawShape = (ctx, x0, y0, x1, y1) => {
    ctx.beginPath()
    if (tool === 'line') {
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()
    } else if (tool === 'rect') {
      ctx.strokeRect(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0))
    } else if (tool === 'ellipse') {
      const cx = (x0 + x1) / 2
      const cy = (y0 + y1) / 2
      ctx.ellipse(cx, cy, Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, 0, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  const onPointerDown = (e) => {
    const { x, y } = getPos(e)
    stateRef.current = { drawing: true, startX: x, startY: y, lastX: x, lastY: y }
    overlayRef.current.setPointerCapture(e.pointerId)

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      const ctx = baseRef.current.getContext('2d')
      const toolDef = TOOLS.find((t) => t.key === tool)
      ctx.fillStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.beginPath()
      ctx.arc(x, y, toolDef.width / 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const onPointerMove = (e) => {
    if (!stateRef.current.drawing) return
    const { x, y } = getPos(e)
    const toolDef = TOOLS.find((t) => t.key === tool)

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      const ctx = baseRef.current.getContext('2d')
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.lineWidth = toolDef.width
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      ctx.moveTo(stateRef.current.lastX, stateRef.current.lastY)
      ctx.lineTo(x, y)
      ctx.stroke()
      stateRef.current.lastX = x
      stateRef.current.lastY = y
    } else {
      const octx = overlayRef.current.getContext('2d')
      octx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      octx.strokeStyle = color
      octx.lineWidth = toolDef.width
      drawShape(octx, stateRef.current.startX, stateRef.current.startY, x, y)
    }
  }

  const onPointerUp = (e) => {
    if (!stateRef.current.drawing) return
    const { x, y } = getPos(e)
    if (tool === 'line' || tool === 'rect' || tool === 'ellipse') {
      const ctx = baseRef.current.getContext('2d')
      ctx.strokeStyle = color
      ctx.lineWidth = TOOLS.find((t) => t.key === tool).width
      drawShape(ctx, stateRef.current.startX, stateRef.current.startY, x, y)
      overlayRef.current.getContext('2d').clearRect(0, 0, CANVAS_W, CANVAS_H)
    }
    stateRef.current.drawing = false
  }

  const clearCanvas = () => {
    const ctx = baseRef.current.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
  }

  const saveCanvas = () => {
    const link = document.createElement('a')
    link.download = 'untitled.png'
    link.href = baseRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col -m-2">
      <div className="h-[22px] flex items-center gap-3 px-2 text-[11px] text-[#111] border-b border-[#c9c5b2] select-none">
        {['File', 'Edit', 'View', 'Image', 'Colors', 'Help'].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex">
        <div className="w-[58px] shrink-0 border-r border-[#c9c5b2] p-1 grid grid-cols-2 gap-1 content-start bg-[#ece9d8]">
          {TOOLS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              title={label}
              onClick={() => setTool(key)}
              className={`w-[24px] h-[24px] flex items-center justify-center rounded-[2px] border ${
                tool === key
                  ? 'border-[#7f9db9] bg-[#c6d8f0] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.25)]'
                  : 'border-transparent hover:border-[#a6a28c] hover:bg-white/60'
              }`}
            >
              <Icon size={14} strokeWidth={2} />
            </button>
          ))}
        </div>

        <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-[#808080] p-2">
          <div className="relative border border-[#333] shadow-[2px_2px_4px_rgba(0,0,0,0.4)]" style={{ width: CANVAS_W, height: CANVAS_H }}>
            <canvas ref={baseRef} width={CANVAS_W} height={CANVAS_H} className="absolute inset-0" />
            <canvas
              ref={overlayRef}
              width={CANVAS_W}
              height={CANVAS_H}
              className="absolute inset-0 cursor-crosshair touch-none"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-2 py-1.5 border-t border-[#c9c5b2] bg-[#ece9d8]">
        <div
          className="w-[20px] h-[20px] rounded-[2px] border border-[#716f64] shrink-0"
          style={{ background: color }}
          title="Current color"
        />
        <div className="grid grid-cols-10 gap-[2px]">
          {PALETTE.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-[14px] h-[14px] border ${color === c ? 'border-black' : 'border-[#716f64]/50'}`}
              style={{ background: c }}
              title={c}
            />
          ))}
        </div>
        <div className="flex-1" />
        <button className={`${buttonXp} text-[11px] px-2 py-0.5 flex items-center gap-1`} onClick={clearCanvas}>
          <Trash2 size={12} /> Clear
        </button>
        <button className={`${buttonXp} text-[11px] px-2 py-0.5 flex items-center gap-1`} onClick={saveCanvas}>
          <Download size={12} /> Save
        </button>
      </div>

      <div className={statusBar}>For Help, click Help Topics on the Help Menu.</div>
    </div>
  )
}
