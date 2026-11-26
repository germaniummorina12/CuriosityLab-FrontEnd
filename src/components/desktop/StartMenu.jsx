import { useEffect, useRef } from 'react'
import { LogOut, Power } from 'lucide-react'
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

  // Icons come straight from the registry so each window shows the same icon here as it
  // does in its own title bar / the taskbar / the desktop — it previously used unrelated
  // generic lucide icons that didn't match (e.g. a plain "person" icon for Users, which
  // opens the same Excel-icon window as UserList.xls on the desktop).
  const items = [
    { kind: 'dashboard', label: 'Dashboard', icon: registry.dashboard.icon },
    { kind: 'users', label: 'Users', icon: registry.users.icon },
    ...(isAdmin ? [{ kind: 'roles', label: 'Roles', icon: registry.roles.icon }] : []),
    { kind: 'addresses', label: 'Addresses', icon: registry.addresses.icon },
    { kind: 'contacts', label: 'Contacts', icon: registry.contacts.icon },
  ]

  const extras = [
    { kind: 'internet-explorer', label: 'Internet Explorer', icon: registry['internet-explorer'].icon },
    { kind: 'chrome', label: 'Google Chrome', icon: registry.chrome.icon },
    { kind: 'paint', label: 'Paint', icon: registry.paint.icon },
    { kind: 'minesweeper', label: 'Minesweeper', icon: registry.minesweeper.icon },
    { kind: 'solitaire', label: 'Solitaire', icon: registry.solitaire.icon },
    { kind: 'freecell', label: 'FreeCell', icon: registry.freecell.icon },
    { kind: 'hearts', label: 'Hearts', icon: registry.hearts.icon },
    { kind: 'spider-solitaire', label: 'Spider Solitaire', icon: registry['spider-solitaire'].icon },
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
      <div className="bg-gradient-to-r from-[#1941a5] to-[#2a6fe0] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] text-white px-3 py-2.5 flex items-center gap-2.5">
        <span className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center font-bold text-[16px] shadow-[1px_1px_3px_rgba(0,0,0,0.4)]">
          {session?.tile}
        </span>
        <span className="font-bold text-[15px]">{session?.name}</span>
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
      <div className="bg-gradient-to-r from-[#1941a5] to-[#2a6fe0] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] px-2 py-2 flex justify-end gap-2">
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-white text-[12px] font-semibold px-2.5 py-1 rounded-[4px] border border-white/0 hover:border-white/40 hover:bg-white/15"
        >
          <span className="w-[18px] h-[18px] rounded-full bg-[#3f8ae0] border border-white/50 flex items-center justify-center shrink-0">
            <LogOut size={11} strokeWidth={2.5} />
          </span>
          Log Off
        </button>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-white text-[12px] font-semibold px-2.5 py-1 rounded-[4px] border border-white/0 hover:border-white/40 hover:bg-white/15"
        >
          <span className="w-[18px] h-[18px] rounded-full bg-[#d33b1f] border border-white/50 flex items-center justify-center shrink-0">
            <Power size={11} strokeWidth={2.5} />
          </span>
          Turn Off Computer
        </button>
      </div>
    </div>
  )
}
