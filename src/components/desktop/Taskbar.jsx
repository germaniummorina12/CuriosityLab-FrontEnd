import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, Plus, Minus, SignalHigh } from 'lucide-react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { buttonXp, sectionGroove } from '../../styles/xpTheme'
import { ShowDesktopIcon, WirelessIcon, VolumeIcon, SecurityCenterIcon } from '../icons/RetroIcons'

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

function SecurityPopup() {
  return (
    <div className="absolute bottom-[38px] right-[25px] w-[210px] rounded-[4px] border border-[#716f64] bg-[#ece9d8] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-3 flex flex-col gap-2 z-50">
      <div className="flex items-center gap-2">
        <SecurityCenterIcon size={24} />
        <div>
          <div className="text-[12px] font-bold text-[#111]">Windows Security Center</div>
          <div className="text-[11px] text-[#1a7a2e]">Your computer is protected</div>
        </div>
      </div>
      <p className="text-[10px] text-[#777]">This is a decorative status popup — there's no real firewall/antivirus behind it.</p>
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
    <div className="absolute bottom-0 left-0 right-0 h-[40px] bg-[linear-gradient(180deg,#3888e9_0%,#4993e6_5%,#2257d5_18%,#2663e0_90%,#1941a5_100%)] border-t border-[#3168d5] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] flex items-center px-1 gap-1 z-40">
      <button
        data-start-button
        onClick={onToggleStart}
        className={`relative h-[34px] w-[114px] shrink-0 flex items-center gap-1.5 pl-1.5 pr-3 rounded-[11px] border border-[#1a5c1f] bg-[linear-gradient(180deg,#8df08d_0%,#5fc45f_10%,#2fa23a_50%,#1f7a2e_90%,#15601f_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] ${
          startOpen ? 'brightness-90' : 'hover:brightness-110'
        }`}
      >
        {/* Pixel-measured from RetroBar's actual XP Blue button asset (startxpbluebutton.png):
            the corner radius is a plain ~33% of the button height, mirrored top/bottom — a
            moderately-rounded rectangle, not a full pill and not an asymmetric "flag tail". */}
        <img src="/16-162608_windows-logo-png-windows-xp-logo.png" alt="" className="w-7 h-7 object-contain -ml-1" />
        <span className="font-bold italic text-[15px] text-white [text-shadow:1px_1px_4px_#454c10]">start</span>
      </button>

      <div className="w-px h-[26px] bg-[#1941a5] mx-0.5" />

      {/* Quick Launch */}
      <div className="flex items-center gap-0.5 pr-1">
        <button
          onClick={showDesktop}
          title="Show Desktop"
          className="w-[26px] h-[26px] flex items-center justify-center rounded-[2px] text-white hover:bg-white/15 active:bg-black/20"
        >
          <ShowDesktopIcon size={16} />
        </button>
      </div>

      <div className="w-px h-[26px] bg-[#1941a5] mx-0.5" />

      <div className="flex-1 flex items-center gap-1 overflow-x-auto">
        {windows.map((w) => (
          <button
            key={w.id}
            onClick={() => handleClick(w)}
            className={`h-[30px] max-w-[160px] flex items-center gap-1.5 px-2 rounded-[3px] border text-[12px] text-white truncate ${
              w.id === topId && !w.minimized
                ? 'bg-[linear-gradient(180deg,#123d94_0%,#1951b9_5%,#1a50b8_80%,#2156b7_100%)] border-[#1c62d2] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.4)]'
                : 'bg-[linear-gradient(180deg,#4892f7_0%,#3980f4_17%)] border-[#3067dd] hover:brightness-110'
            }`}
          >
            {w.icon ? <w.icon size={18} strokeWidth={2} /> : null}
            <span className="truncate">{w.title}</span>
          </button>
        ))}
      </div>

      <div className="w-px h-[26px] bg-[#1941a5] mx-0.5" />

      {/* System tray — real XP shows a handful of icons inline by default (network,
          volume, Security Center) with the chevron only for whatever overflows past
          those; it isn't a "click to reveal everything" control. */}
      <div className="relative flex items-center gap-1.5 px-2 h-[32px] bg-[linear-gradient(180deg,#16adf0_0%,#19b9f3_5%,#1290e8_18%,#0d8dea_60%,#0fa0ef_90%,#1582dc_100%)]">
        <button
          onClick={() => setTrayOpen((v) => !v)}
          title="Show hidden icons"
          className="text-white/80 hover:text-white"
        >
          <ChevronLeft size={12} strokeWidth={2.5} className={trayOpen ? 'rotate-180' : ''} />
        </button>
        <button
          data-tray-button
          onClick={() => setOpenPopup((p) => (p === 'security' ? null : 'security'))}
          title="Windows Security Center"
          className="text-white/90 hover:text-white"
        >
          <SecurityCenterIcon size={15} />
        </button>
        <button
          data-tray-button
          onClick={() => setOpenPopup((p) => (p === 'network' ? null : 'network'))}
          title="Wireless Network Connection"
          className="text-white/90 hover:text-white"
        >
          <WirelessIcon size={16} />
        </button>
        <button
          data-tray-button
          onClick={() => setOpenPopup((p) => (p === 'volume' ? null : 'volume'))}
          title="Volume"
          className={muted || volume === 0 ? 'opacity-40' : ''}
        >
          <VolumeIcon size={16} />
        </button>

        {openPopup ? (
          <div ref={popupRef}>
            {openPopup === 'volume' ? (
              <VolumePopup volume={volume} setVolume={setVolume} muted={muted} setMuted={setMuted} />
            ) : openPopup === 'network' ? (
              <NetworkPopup />
            ) : (
              <SecurityPopup />
            )}
          </div>
        ) : null}
      </div>

      <div className="h-[32px] px-3 flex items-center bg-[linear-gradient(180deg,#16adf0_0%,#19b9f3_5%,#1290e8_18%,#0d8dea_60%,#0fa0ef_90%,#1582dc_100%)] border border-[#095bc9] rounded-[3px] text-white text-[12px] tabular-nums">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  )
}
