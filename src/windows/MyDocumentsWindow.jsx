import { useWindowManager } from '../context/WindowManagerContext'
import { useAuth } from '../context/AuthContext'
import { registry } from './registry'
import { sectionGroove, statusBar } from '../styles/xpTheme'

const DOCS = [
  { kind: 'users', label: 'UserList.xls' },
  { kind: 'roles', label: 'RoleList.xls', adminOnly: true },
  { kind: 'addresses', label: 'AddressBook.xls' },
  { kind: 'contacts', label: 'ContactList.xls' },
]

export default function MyDocumentsWindow() {
  const { openWindow } = useWindowManager()
  const { isAdmin } = useAuth()

  const open = (kind) => {
    const entry = registry[kind]
    openWindow({ kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
        {DOCS.filter((d) => !d.adminOnly || isAdmin).map((d) => {
          const Icon = registry[d.kind].icon
          return (
            <button
              key={d.kind}
              onDoubleClick={() => open(d.kind)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[#111] border-b border-[#e3e1d6] last:border-b-0 hover:bg-[#2a6fe0] hover:text-white"
            >
              <Icon size={20} />
              {d.label}
            </button>
          )
        })}
      </div>
      <div className={statusBar}>{DOCS.length} object(s) — double-click to open</div>
    </div>
  )
}
