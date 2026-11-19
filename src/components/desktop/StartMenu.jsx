import { useEffect, useRef } from 'react'
import { LayoutDashboard, Users, Shield, MapPin, Contact, LogOut, Power } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { registry } from '../../windows/registry'

export default function StartMenu({ onLaunch, onClose, onLogout }) {
  const { session, isAdmin } = useAuth()
  const menuRef = useRef(null)

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current?.contains(e.target)) return
      // The Start button toggles its own open/closed state on click — if we also
      // closed here on the same mousedown, the click would immediately reopen it.
      if (e.target.closest('[data-start-button]')) return
      onClose()
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [onClose])

  const items = [
    { kind: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { kind: 'users', label: 'Users', icon: Users },
    ...(isAdmin ? [{ kind: 'roles', label: 'Roles', icon: Shield }] : []),
    { kind: 'addresses', label: 'Addresses', icon: MapPin },
    { kind: 'contacts', label: 'Contacts', icon: Contact },
  ]

  const extras = [
    { kind: 'internet-explorer', label: 'Internet Explorer', icon: registry['internet-explorer'].icon },
    { kind: 'chrome', label: 'Google Chrome', icon: registry.chrome.icon },
    { kind: 'minesweeper', label: 'Minesweeper', icon: registry.minesweeper.icon },
    { kind: 'snake', label: 'Snake', icon: registry.snake.icon },
  ]

  const sidebarTop = [
    { label: 'My Documents', icon: registry['my-documents'].icon, onClick: () => onLaunch('my-documents') },
    { label: 'My Computer', icon: registry.dashboard.icon, onClick: () => onLaunch('dashboard') },
    { label: 'Control Panel', icon: registry['control-panel'].icon, onClick: () => onLaunch('control-panel') },
  ]
  const sidebarBottom = [
    { label: 'Help and Support', icon: registry.help.icon, onClick: () => onLaunch('help') },
  ]

  return (
    <div
      ref={menuRef}
      className="absolute bottom-[40px] left-0 w-[420px] rounded-t-[8px] overflow-hidden border border-[#0831d9] shadow-[2px_2px_10px_rgba(0,0,0,0.5)] flex flex-col z-50"
    >
      <div className="bg-gradient-to-r from-[#1941a5] to-[#2a6fe0] text-white px-3 py-2 flex items-center gap-2">
        <span className="w-8 h-8 rounded-[4px] bg-white/20 border border-white/40 flex items-center justify-center font-bold">
          {session?.tile}
        </span>
        <span className="font-semibold text-[14px]">{session?.name}</span>
      </div>
      <div className="flex-1 bg-white flex">
        <div className="flex-1 py-2">
          {items.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              onClick={() => onLaunch(kind)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-[#111] hover:bg-[#2a6fe0] hover:text-white"
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </button>
          ))}
          <div className="h-px bg-[#d8dde3] my-1 mx-2" />
          {extras.map(({ kind, label, icon: Icon }) => (
            <button
              key={kind}
              onClick={() => onLaunch(kind)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-[#111] hover:bg-[#2a6fe0] hover:text-white"
            >
              <Icon size={18} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
        <div className="w-[130px] bg-gradient-to-b from-[#d9e4f5] to-[#b9cdf0] border-l border-[#9db3d6] py-2 flex flex-col">
          {sidebarTop.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-[#111] text-left hover:bg-[#2a6fe0] hover:text-white"
            >
              <Icon size={15} strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </button>
          ))}
          <div className="h-px bg-[#9db3d6] my-1 mx-2" />
          {sidebarBottom.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-2 px-2 py-1.5 text-[11px] text-[#111] text-left hover:bg-[#2a6fe0] hover:text-white"
            >
              <Icon size={15} strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="bg-gradient-to-r from-[#1941a5] to-[#2a6fe0] px-2 py-1.5 flex justify-end gap-1">
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white text-[12px] px-2 py-1 rounded-[3px] hover:bg-white/15"
        >
          <LogOut size={14} strokeWidth={2} />
          Log Off
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-white text-[12px] px-2 py-1 rounded-[3px] hover:bg-white/15"
        >
          <Power size={14} strokeWidth={2} />
          Turn Off Computer
        </button>
      </div>
    </div>
  )
}
