import { useEffect, useRef, useState } from 'react'
import { Monitor, Volume2, VolumeX, Wifi, ChevronLeft, Plus, Minus, SignalHigh } from 'lucide-react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { buttonXp, sectionGroove } from '../../styles/xpTheme'

function VolumePopup({ volume, setVolume, muted, setMuted }) {
  return (
    <div className="absolute bottom-[38px] right-[70px] w-[120px] rounded-[4px] border border-[#716f64] bg-[#ece9d8] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-2 flex flex-col items-center gap-2 z-50">
      <span className="text-[11px] font-bold text-[#111]">Volume</span>
      <div className="flex items-center gap-1.5">
        <button className={buttonXp} onClick={() => setVolume((v) => Math.max(0, v - 10))} title="Lower">
          <Minus size={12} />
        </button>
        <span className="font-mono text-[12px] w-7 text-center">{muted ? '--' : volume}</span>
        <button className={buttonXp} onClick={() => setVolume((v) => Math.min(100, v + 10))} title="Raise">
          <Plus size={12} />
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={muted ? 0 : volume}
        onChange={(e) => setVolume(Number(e.target.value))}
        className="w-full"
      />
      <label className="flex items-center gap-1.5 text-[11px] text-[#111]">
        <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} />
        Mute
      </label>
    </div>
  )
}

function NetworkPopup() {
  return (
    <div className="absolute bottom-[38px] right-[40px] w-[220px] rounded-[4px] border border-[#716f64] bg-[#ece9d8] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-3 flex flex-col gap-2 z-50">
      <div className="flex items-center gap-2">
        <SignalHigh size={18} strokeWidth={2} className="text-[#1a7a2e]" />
        <div>
          <div className="text-[12px] font-bold text-[#111]">Wireless Network Connection</div>
          <div className="text-[11px] text-[#1a7a2e]">Connected</div>
        </div>
      </div>
      <div className={sectionGroove}>
        <div className="flex justify-between px-2 py-1 text-[11px] border-b border-[#e3e1d6]">
          <span>Signal Strength</span>
          <span className="font-bold">Excellent</span>
        </div>
        <div className="flex justify-between px-2 py-1 text-[11px]">
          <span>Speed</span>
          <span className="font-bold">54.0 Mbps</span>
        </div>
      </div>
      <p className="text-[10px] text-[#777]">This is a decorative status popup — there's nothing to actually connect to here.</p>
    </div>
  )
}

export default function Taskbar({ startOpen, onToggleStart }) {
  const { windows, focusWindow, minimizeWindow, showDesktop } = useWindowManager()
  const [now, setNow] = useState(new Date())
  const [trayOpen, setTrayOpen] = useState(false)
  const [openPopup, setOpenPopup] = useState(null) // null | 'volume' | 'network'
  const [volume, setVolume] = useState(70)
  const [muted, setMuted] = useState(false)
  const popupRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000 * 15)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!openPopup) return
    const onOutside = (e) => {
      if (popupRef.current?.contains(e.target)) return
      if (e.target.closest('[data-tray-button]')) return
      setOpenPopup(null)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openPopup])

  const topId = windows.reduce(
    (top, w) => (!w.minimized && (!top || w.zIndex > top.zIndex) ? w : top),
    null,
  )?.id

  const handleClick = (w) => {
    if (!w.minimized && w.id === topId) minimizeWindow(w.id)
    else focusWindow(w.id)
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-gradient-to-b from-[#2a6fe0] via-[#1e5adf] to-[#0f3aa0] border-t border-[#0a2a80] flex items-center px-1 gap-1 z-40">
      <button
        data-start-button
        onClick={onToggleStart}
        className={`h-[32px] flex items-center gap-1.5 px-3 rounded-[4px] border border-[#1a5c1f] bg-gradient-to-b from-[#6fd16f] via-[#2fa23a] to-[#1f7a2e] text-white font-bold italic text-[14px] shadow-[1px_1px_2px_rgba(0,0,0,0.4)] ${
          startOpen ? 'brightness-90' : 'hover:brightness-110'
        }`}
      >
        <img src="/16-162608_windows-logo-png-windows-xp-logo.png" alt="" className="w-7 h-7 object-contain -ml-1" />
        start
      </button>

      <div className="w-px h-[26px] bg-[#0a2a80] mx-0.5" />

      {/* Quick Launch */}
      <div className="flex items-center gap-0.5 pr-1">
        <button
          onClick={showDesktop}
          title="Show Desktop"
          className="w-[26px] h-[26px] flex items-center justify-center rounded-[2px] text-white hover:bg-white/15 active:bg-black/20"
        >
          <Monitor size={15} strokeWidth={2} />
        </button>
      </div>

      <div className="w-px h-[26px] bg-[#0a2a80] mx-0.5" />

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => handleClick(w)}
            className={`h-[30px] max-w-[160px] flex items-center gap-1.5 px-2 rounded-[3px] border text-[12px] text-white truncate ${
              w.id === topId && !w.minimized
                ? 'bg-[#0f3aa0] border-[#0a2a80] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]'
                : 'bg-gradient-to-b from-[#3f7fe8] to-[#1e5adf] border-[#0a2a80] hover:brightness-110'
            }`}
          >
            {w.icon ? <w.icon size={18} strokeWidth={2} /> : null}
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-[26px] bg-[#0a2a80] mx-0.5" />

      {/* System tray */}
      <div className="relative flex items-center gap-1.5 px-2 h-[32px] bg-gradient-to-b from-[#1e5adf] to-[#0f3aa0]">
        <button
          onClick={() => setTrayOpen((v) => !v)}
          title="Show hidden icons"
          className="text-white/80 hover:text-white"
        >
          <ChevronLeft size={12} strokeWidth={2.5} className={trayOpen ? 'rotate-180' : ''} />
        </button>
        {trayOpen ? (
          <button
            data-tray-button
            onClick={() => setOpenPopup((p) => (p === 'network' ? null : 'network'))}
            title="Wireless Network Connection"
            className="text-white/90 hover:text-white"
          >
            <Wifi size={14} strokeWidth={2} />
          </button>
        ) : null}
        <button
          data-tray-button
          onClick={() => setOpenPopup((p) => (p === 'volume' ? null : 'volume'))}
          title="Volume"
          className="text-white/90 hover:text-white"
        >
          {muted || volume === 0 ? <VolumeX size={14} strokeWidth={2} /> : <Volume2 size={14} strokeWidth={2} />}
        </button>

        {openPopup ? (
          <div ref={popupRef}>
            {openPopup === 'volume' ? (
              <VolumePopup volume={volume} setVolume={setVolume} muted={muted} setMuted={setMuted} />
            ) : (
              <NetworkPopup />
            )}
          </div>
        ) : null}
      </div>

      <div className="h-[32px] px-3 flex items-center bg-gradient-to-b from-[#3f7fe8] to-[#1e5adf] border border-[#0a2a80] rounded-[3px] text-white text-[12px] tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
