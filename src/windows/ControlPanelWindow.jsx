import { useWindowManager } from '../context/WindowManagerContext'
import { useAuth } from '../context/AuthContext'
import { registry } from './registry'
import { buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'
import { ExplorerChrome } from '../components/desktop/ExplorerChrome'
import { ControlPanelIcon } from '../components/icons/RetroIcons'

export default function ControlPanelWindow({ windowId }) {
  const { openWindow } = useWindowManager()
  const { session, accounts, login, isAdmin } = useAuth()

  const launch = (kind) => {
    const entry = registry[kind]
    openWindow({ kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height, maximized: entry.maximized })
  }

  const programs = Object.entries(registry).filter(
    ([kind]) =>
      ![
        'recycle-bin',
        'user-profile',
        'edit-user',
        'role-profile',
        'edit-role',
        'edit-address',
        'edit-contact',
        'contacts-for-user',
      ].includes(kind),
  )

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-auto">
      <ExplorerChrome title="Control Panel" icon={ControlPanelIcon} windowId={windowId} />
      <div>
        <p className="text-[12px] font-bold text-[#1941a5] mb-1.5">User Accounts</p>
        <div className={`${sectionGroove} p-2 flex items-center gap-3`}>
          <span className="w-10 h-10 rounded-full bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-[#0a3d8f] flex items-center justify-center text-white font-bold">
            {session?.tile}
          </span>
          <div className="flex-1">
            <div className="text-[13px] font-bold">{session?.name}</div>
            <div className="text-[11px] text-[#555]">{isAdmin ? 'Administrator' : 'Limited account'}</div>
          </div>
          {accounts
            .filter((a) => a.id !== session?.id)
            .map((a) => (
              <button key={a.id} className={buttonXp} onClick={() => login(a.id)}>
                Switch to {a.name}
              </button>
            ))}
        </div>
      </div>

      <div>
        <p className="text-[12px] font-bold text-[#1941a5] mb-1.5">Add or Remove Programs</p>
        <div className={`${sectionGroove} max-h-[180px] overflow-auto`}>
          {programs.map(([kind, entry]) => {
            const Icon = entry.icon
            return (
              <div
                key={kind}
                className="flex items-center justify-between gap-2 px-2.5 py-1.5 border-b border-[#e3e1d6] last:border-b-0"
              >
                <span className="flex items-center gap-2 text-[12px]">
                  <Icon size={18} />
                  {entry.title}
                </span>
                <button className={buttonPrimary} onClick={() => launch(kind)}>
                  Open
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <div className={statusBar}>{programs.length} programs currently installed</div>
    </div>
  )
}
