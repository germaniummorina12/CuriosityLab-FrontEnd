import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useWindowManager } from '../../context/WindowManagerContext'
import { registry } from '../../windows/registry'
import DesktopIcon from './DesktopIcon'
import Taskbar from './Taskbar'
import StartMenu from './StartMenu'
import Window from './Window'
import Wallpaper from './Wallpaper'

export default function Desktop() {
  const { isAdmin, logout } = useAuth()
  const { windows, openWindow } = useWindowManager()
  const [startOpen, setStartOpen] = useState(false)
  const navigate = useNavigate()

  const launch = (kind) => {
    const entry = registry[kind]
    if (!entry) return
    openWindow({ kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
    setStartOpen(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const topZ = windows.reduce((max, w) => (w.minimized ? max : Math.max(max, w.zIndex)), 0)

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      <Wallpaper />
      <div className="absolute top-3 left-3 bottom-[52px] flex flex-col flex-wrap content-start gap-1">
        <DesktopIcon icon={registry.dashboard.icon} label="My Computer" size={64} onOpen={() => launch('dashboard')} />
        <DesktopIcon icon={registry['recycle-bin'].icon} label="Recycle Bin" size={64} onOpen={() => launch('recycle-bin')} />
        <DesktopIcon icon={registry.users.icon} label="UserList.xls" onOpen={() => launch('users')} />
        {isAdmin ? (
          <DesktopIcon icon={registry.roles.icon} label="RoleList.xls" onOpen={() => launch('roles')} />
        ) : null}
        <DesktopIcon icon={registry.addresses.icon} label="AddressBook.xls" onOpen={() => launch('addresses')} />
        <DesktopIcon icon={registry.contacts.icon} label="ContactList.xls" onOpen={() => launch('contacts')} />
        <DesktopIcon icon={registry['internet-explorer'].icon} label="Internet Explorer" onOpen={() => launch('internet-explorer')} />
        <DesktopIcon icon={registry.chrome.icon} label="Google Chrome" size={72} onOpen={() => launch('chrome')} />
        <DesktopIcon icon={registry.minesweeper.icon} label="Minesweeper" size={64} onOpen={() => launch('minesweeper')} />
        <DesktopIcon icon={registry.snake.icon} label="Snake" onOpen={() => launch('snake')} />
      </div>

      {windows.map((w) => {
        const entry = registry[w.kind]
        if (!entry) return null
        const Content = entry.Component
        const isTop = w.zIndex === topZ
        return (
          <Window key={w.id} win={w} isTop={isTop}>
            <Content params={w.params} isActive={isTop && !w.minimized} windowId={w.id} />
          </Window>
        )
      })}

      {startOpen ? (
        <StartMenu onLaunch={launch} onClose={() => setStartOpen(false)} onLogout={handleLogout} />
      ) : null}

      <Taskbar startOpen={startOpen} onToggleStart={() => setStartOpen((v) => !v)} />
    </div>
  )
}
