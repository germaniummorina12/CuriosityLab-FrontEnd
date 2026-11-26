import { useEffect, useMemo, useRef, useState } from 'react'
import { HardDrive, FileSpreadsheet, Info, Package, Settings, FolderOpen } from 'lucide-react'
import { usersApi } from '../lib/endpoints/users'
import { rolesApi } from '../lib/endpoints/roles'
import { addressesApi } from '../lib/endpoints/addresses'
import { contactsApi } from '../lib/endpoints/contacts'
import { contactTypesApi } from '../lib/endpoints/contactTypes'
import { useWindowManager } from '../context/WindowManagerContext'
import { sectionGroove, statusBar } from '../styles/xpTheme'
import { ExplorerChrome } from '../components/desktop/ExplorerChrome'
import { MyComputerIcon } from '../components/icons/RetroIcons'
import { registry } from './registry'

// Each "drive" is the real data category underneath it — double-clicking opens the
// matching spreadsheet window, same as double-clicking a disk opens its contents in XP.
const DRIVES = [
  { key: 'c', label: 'Local Disk (C:)', kind: 'users', file: 'UserList.xls' },
  { key: 'd', label: 'Local Disk (D:)', kind: 'roles', file: 'RoleList.xls' },
  { key: 'e', label: 'Local Disk (E:)', kind: 'addresses', file: 'AddressBook.xls' },
  { key: 'f', label: 'Local Disk (F:)', kind: 'contacts', file: 'ContactList.xls' },
]

function DriveIcon({ size = 20 }) {
  return <HardDrive size={size} className="text-[#5a7aa0]" />
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0">
      <span className="text-[12px] text-[#333]">{label}</span>
      <span className="text-[12px] font-bold text-[#111]">{value}</span>
    </div>
  )
}

export default function MyComputerWindow({ windowId }) {
  const { openWindow } = useWindowManager()
  const [totals, setTotals] = useState(null)
  const [avgAge, setAvgAge] = useState(null)
  const [roleCounts, setRoleCounts] = useState([])
  const [addressCount, setAddressCount] = useState(null)
  const [contactCount, setContactCount] = useState(null)
  const [contactTypeCount, setContactTypeCount] = useState(null)
  const [status, setStatus] = useState('loading')

  const load = () => {
    setStatus('loading')
    Promise.allSettled([
      usersApi.getTotals(),
      usersApi.getAverageAge(),
      rolesApi.getUserCounts(),
      addressesApi.getAddressesByUsers(),
      contactsApi.getAll(),
      contactTypesApi.getAll(),
    ]).then(([t, a, c, addr, contacts, types]) => {
      if (t.status === 'fulfilled') setTotals(t.value)
      if (a.status === 'fulfilled') setAvgAge(a.value)
      if (c.status === 'fulfilled') setRoleCounts(Array.isArray(c.value) ? c.value : [])
      if (addr.status === 'fulfilled') setAddressCount(Array.isArray(addr.value) ? addr.value.length : null)
      if (contacts.status === 'fulfilled') setContactCount(Array.isArray(contacts.value) ? contacts.value.length : null)
      if (types.status === 'fulfilled') setContactTypeCount(Array.isArray(types.value) ? types.value.length : null)
      setStatus('ready')
    })
  }

  useEffect(load, [])

  // In-window navigation: 'root' lists the drives, a drive key lists its one file —
  // Back/Forward/Up walk this exactly like a real Explorer history stack.
  const [history, setHistory] = useState(['root'])
  const [histIndex, setHistIndex] = useState(0)
  const current = history[histIndex]

  const navigateTo = (key) => {
    if (key === current) return
    setHistory((prev) => [...prev.slice(0, histIndex + 1), key])
    setHistIndex((i) => i + 1)
  }

  const [selected, setSelected] = useState(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [viewMode, setViewMode] = useState('details')
  const [foldersOpen, setFoldersOpen] = useState(false)

  // Selection is per-location — the file row re-uses its parent drive's key, so without
  // this a row would show pre-selected right after navigating into its drive.
  useEffect(() => setSelected(null), [current])

  const stat = (key) => {
    switch (key) {
      case 'c':
        return {
          size: status === 'loading' ? '…' : totals?.users != null ? `${totals.users} users` : '—',
          free: status === 'loading' ? '…' : avgAge?.avgAge != null ? `${Number(avgAge.avgAge).toFixed(1)} yrs avg` : '—',
        }
      case 'd':
        return {
          size: status === 'loading' ? '…' : totals?.roles != null ? `${totals.roles} roles` : '—',
          free: status === 'loading' ? '…' : `${roleCounts.length} groups`,
        }
      case 'e':
        return {
          size: status === 'loading' ? '…' : addressCount != null ? `${addressCount} addresses` : '—',
          free: '—',
        }
      case 'f':
        return {
          size: status === 'loading' ? '…' : contactCount != null ? `${contactCount} contacts` : '—',
          free: status === 'loading' ? '…' : contactTypeCount != null ? `${contactTypeCount} types` : '—',
        }
      default:
        return { size: '—', free: '—' }
    }
  }

  const rows = useMemo(() => {
    if (current === 'root') {
      return DRIVES.map((d) => ({ ...d, ...stat(d.key) }))
    }
    const d = DRIVES.find((x) => x.key === current)
    return d ? [{ key: d.key, label: d.file, kind: d.kind, file: d.file, isFile: true, ...stat(d.key) }] : []
  }, [current, status, totals, avgAge, roleCounts, addressCount, contactCount, contactTypeCount])

  const visibleRows = useMemo(() => {
    if (!searchValue.trim()) return rows
    const q = searchValue.trim().toLowerCase()
    return rows.filter((r) => r.label.toLowerCase().includes(q))
  }, [rows, searchValue])

  const openDrive = (row) => {
    if (row.isFile) {
      const entry = registry[row.kind]
      if (entry) openWindow({ kind: row.kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height, maximized: entry.maximized })
      return
    }
    navigateTo(row.key)
  }

  const locations = [
    { key: 'root', label: 'My Computer', icon: MyComputerIcon },
    ...DRIVES.map((d) => ({ key: d.key, label: d.label, icon: DriveIcon })),
  ]

  const addressLabel = current === 'root' ? 'My Computer' : DRIVES.find((d) => d.key === current)?.label ?? 'My Computer'

  // Windows can be dragged down to 240px wide or stretched full-screen (see Window.jsx's
  // resize handles) — the fixed sidebar + 3 fixed-width columns don't fit at the low end,
  // so track the actual content width and progressively drop columns, then the sidebar
  // itself, instead of letting the listing overflow into a horizontal scrollbar.
  const contentRef = useRef(null)
  const [contentWidth, setContentWidth] = useState(580)

  useEffect(() => {
    const el = contentRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setContentWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const SIDEBAR_WIDTH = 150
  const showSidebar = contentWidth >= 420
  const listWidth = contentWidth - (showSidebar ? SIDEBAR_WIDTH + 8 : 0)
  // Name keeps a 120px floor (room for "Local Disk (C:)" etc. without ellipsis) — each
  // column only turns on once there's enough width left over for that floor plus itself.
  const showSize = listWidth >= 252
  const showType = listWidth >= 350
  const showFree = listWidth >= 458

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <ExplorerChrome
        title="My Computer"
        icon={MyComputerIcon}
        windowId={windowId}
        onRefresh={load}
        nav={{
          canBack: histIndex > 0,
          canForward: histIndex < history.length - 1,
          canUp: current !== 'root',
          onBack: () => setHistIndex((i) => Math.max(0, i - 1)),
          onForward: () => setHistIndex((i) => Math.min(history.length - 1, i + 1)),
          onUp: () => navigateTo('root'),
        }}
        search={{
          open: searchOpen,
          value: searchValue,
          onToggle: () => setSearchOpen((v) => !v),
          onChange: setSearchValue,
        }}
        view={{ mode: viewMode, onToggle: () => setViewMode((m) => (m === 'details' ? 'icons' : 'details')) }}
        folders={{ open: foldersOpen, onToggle: () => setFoldersOpen((v) => !v) }}
        addressNav={{ label: addressLabel, locations, currentKey: current, onNavigate: navigateTo }}
      />

      <div ref={contentRef} className="flex-1 min-h-0 flex gap-2">
        {!showSidebar ? null : foldersOpen ? (
          <div className={`${sectionGroove} w-[150px] shrink-0 overflow-auto py-1`}>
            <button
              onClick={() => navigateTo('root')}
              className={`w-full flex items-center gap-1.5 px-2 py-1 text-left text-[11px] ${
                current === 'root' ? 'bg-[#2a6fe0] text-white' : 'hover:bg-[#c6d8f0] text-[#111]'
              }`}
            >
              <MyComputerIcon size={14} />
              My Computer
            </button>
            {DRIVES.map((d) => (
              <button
                key={d.key}
                onClick={() => navigateTo(d.key)}
                className={`w-full flex items-center gap-1.5 pl-5 py-1 text-left text-[11px] ${
                  current === d.key ? 'bg-[#2a6fe0] text-white' : 'hover:bg-[#c6d8f0] text-[#111]'
                }`}
              >
                <DriveIcon size={13} />
                <span className="truncate">{d.label}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="w-[150px] shrink-0 overflow-auto flex flex-col gap-2">
            <div className={`${sectionGroove} p-2`}>
              <div className="text-[11px] font-bold text-[#1941a5] mb-1">
                {current === 'root' ? 'System Tasks' : 'File and Folder Tasks'}
              </div>
              <div className="flex flex-col gap-1 text-[11px] text-[#15438f]">
                {current === 'root' ? (
                  <>
                    <button className="flex items-center gap-1 text-left hover:underline" onClick={load}>
                      <Info size={12} />
                      View system information
                    </button>
                    <button
                      className="flex items-center gap-1 text-left hover:underline"
                      onClick={() => {
                        const entry = registry['control-panel']
                        openWindow({ kind: 'control-panel', title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
                      }}
                    >
                      <Package size={12} />
                      Add or remove programs
                    </button>
                  </>
                ) : (
                  <button className="flex items-center gap-1 text-left hover:underline" onClick={() => navigateTo('root')}>
                    <FolderOpen size={12} />
                    Back to My Computer
                  </button>
                )}
              </div>
            </div>
            <div className={`${sectionGroove} p-2`}>
              <div className="text-[11px] font-bold text-[#1941a5] mb-1">Other Places</div>
              <div className="flex flex-col gap-1 text-[11px] text-[#15438f]">
                <button
                  className="flex items-center gap-1 text-left hover:underline"
                  onClick={() => {
                    const entry = registry['my-documents']
                    openWindow({ kind: 'my-documents', title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
                  }}
                >
                  <FolderOpen size={12} />
                  My Documents
                </button>
                <button
                  className="flex items-center gap-1 text-left hover:underline"
                  onClick={() => {
                    const entry = registry['control-panel']
                    openWindow({ kind: 'control-panel', title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
                  }}
                >
                  <Settings size={12} />
                  Control Panel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-2">
          {current === 'root' ? (
            <div className="flex items-center gap-2 px-1 min-w-0">
              <span className="w-9 h-9 shrink-0 rounded-[4px] bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-[#0a3d8f]" />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#111] truncate">CuriosityLab System Properties</div>
                <div className="text-[11px] text-[#555] truncate">Live data pulled from the API at startup</div>
              </div>
            </div>
          ) : null}

          {viewMode === 'details' ? (
            <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
              <div className="flex items-center gap-2 px-3 py-1 border-b border-[#a6a28c] bg-[#f0eee3] text-[11px] font-bold text-[#333] sticky top-0">
                <span className="flex-1 min-w-[120px]">Name</span>
                {showType ? <span className="w-[90px] shrink-0">Type</span> : null}
                {showSize ? <span className="w-[100px] shrink-0">Total Size</span> : null}
                {showFree ? <span className="w-[100px] shrink-0">Free Space</span> : null}
              </div>
              {visibleRows.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[#777] italic">No items match your search</div>
              ) : (
                visibleRows.map((r) => (
                  <div
                    key={r.key}
                    onClick={() => setSelected(r.key)}
                    onDoubleClick={() => openDrive(r)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-[12px] border-b border-[#e3e1d6] last:border-b-0 cursor-default ${
                      selected === r.key ? 'bg-[#2a6fe0] text-white' : 'text-[#111] hover:bg-[#e3ecfb]'
                    }`}
                  >
                    <span className="flex-1 min-w-[120px] flex items-center gap-2 truncate">
                      {r.isFile ? <FileSpreadsheet size={16} className="text-[#1a7a2e] shrink-0" /> : <DriveIcon size={16} />}
                      <span className="truncate">{r.label}</span>
                    </span>
                    {showType ? (
                      <span className="w-[90px] shrink-0 truncate">{r.isFile ? 'Microsoft Excel Worksheet' : 'Local Disk'}</span>
                    ) : null}
                    {showSize ? <span className="w-[100px] shrink-0 truncate">{r.size}</span> : null}
                    {showFree ? <span className="w-[100px] shrink-0 truncate">{r.free}</span> : null}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto p-3 flex flex-wrap gap-4 content-start`}>
              {visibleRows.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[#777] italic">No items match your search</div>
              ) : (
                visibleRows.map((r) => (
                  <button
                    key={r.key}
                    onClick={() => setSelected(r.key)}
                    onDoubleClick={() => openDrive(r)}
                    className={`w-[84px] flex flex-col items-center gap-1 px-1 py-2 rounded-[3px] text-[11px] ${
                      selected === r.key ? 'bg-[#2a6fe0] text-white' : 'text-[#111] hover:bg-[#e3ecfb]'
                    }`}
                  >
                    {r.isFile ? <FileSpreadsheet size={30} className={selected === r.key ? '' : 'text-[#1a7a2e]'} /> : <DriveIcon size={30} />}
                    <span className="text-center leading-tight break-words">{r.label}</span>
                  </button>
                ))
              )}
            </div>
          )}

          {current === 'root' ? (
            <div className={`${sectionGroove} max-h-[110px] overflow-auto`}>
              <div className="px-3 py-1 text-[11px] font-bold text-[#333] bg-[#f0eee3] border-b border-[#a6a28c]">
                Users per role
              </div>
              {roleCounts.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[#777] italic">No role data</div>
              ) : (
                roleCounts.map((r, i) => <StatRow key={i} label={r.role} value={r.user} />)
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className={statusBar}>
        {status === 'loading'
          ? 'Reading system information…'
          : `${visibleRows.length} object(s)${searchValue ? ` matching "${searchValue}"` : ''}`}
      </div>
    </div>
  )
}
