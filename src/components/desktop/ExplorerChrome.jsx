import { useEffect, useRef, useState } from 'react'
import { ChevronDown, ArrowLeft, ArrowRight, RotateCw, ArrowUp, Search, FolderOpen, LayoutGrid, List, X } from 'lucide-react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { registry } from '../../windows/registry'

const FAVORITES_KEY = 'xp-favorites'

function loadFavorites() {
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? '[]')
    return Array.isArray(raw) ? raw : []
  } catch {
    return []
  }
}

function MenuDropdown({ label, items, open, onToggle, onClose }) {
  return (
    <div className="relative shrink-0">
      <span
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`hover:bg-[#2a6fe0] hover:text-white px-1 rounded-[2px] cursor-default ${
          open ? 'bg-[#2a6fe0] text-white' : ''
        }`}
      >
        {label}
      </span>
      {open ? (
        <div className="absolute left-0 top-full mt-0.5 min-w-[200px] bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_6px_rgba(0,0,0,0.4)] py-1 z-50 text-[12px] text-[#111] normal-case">
          {items.map((it, i) =>
            it.divider ? (
              <div key={i} className="h-px bg-[#c9c5b2] my-1 mx-1" />
            ) : (
              <button
                key={i}
                disabled={it.disabled}
                onClick={() => {
                  it.onClick?.()
                  onClose()
                }}
                className="w-full flex items-center text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#111] disabled:cursor-default"
              >
                {it.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

// The classic Explorer-window chrome (menu bar, Back/Up/Search/Folders toolbar, address
// bar) that sits above a folder window's actual content — shared so My Computer, Recycle
// Bin, My Documents and Control Panel all get it instead of re-implementing it four times.
// `windowId` (the id Desktop.jsx already passes every window's content as a prop) lets the
// menu bar act on the window it belongs to (Close) and scope Edit commands to its body.
// `onRefresh`, if the caller has something worth re-fetching, powers View > Refresh —
// otherwise that item is correctly disabled rather than wired to a fake action.
// `nav`, `search`, `view` and `addressNav` are all optional — a caller that doesn't pass
// them gets the original static chrome (Back/Forward/Up disabled, Search/Folders/Views
// decorative). My Computer passes all four to get real in-window drive navigation.
export function ExplorerChrome({
  title,
  icon: Icon,
  windowId,
  onRefresh,
  nav,
  search,
  view,
  folders,
  addressNav,
}) {
  const { closeWindow, openWindow } = useWindowManager()
  const [openMenu, setOpenMenu] = useState(null)
  const [favorites, setFavorites] = useState(loadFavorites)
  const [addressOpen, setAddressOpen] = useState(false)
  const barRef = useRef(null)

  useEffect(() => {
    if (!openMenu && !addressOpen) return
    const onOutside = (e) => {
      if (barRef.current?.contains(e.target)) return
      setOpenMenu(null)
      setAddressOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openMenu, addressOpen])

  // Windows can be resized down to 240px wide (Window.jsx) — below that, the full
  // Search/Folders button text no longer fits next to Back/Forward/Refresh/Up. Drop to
  // icon-only buttons first; `overflow-x-auto` on both rows is the last-resort safety net
  // so nothing (e.g. the Help menu) is ever clipped off and unreachable at the true minimum.
  const [barWidth, setBarWidth] = useState(640)
  useEffect(() => {
    const el = barRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width
      if (w) setBarWidth(w)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const compact = barWidth < 300

  const toggle = (name) => setOpenMenu((m) => (m === name ? null : name))

  const selectAll = () => {
    const el = windowId ? document.querySelector(`[data-window-body="${CSS.escape(windowId)}"]`) : null
    if (el) window.getSelection()?.selectAllChildren(el)
  }

  const copySelection = async () => {
    const text = window.getSelection()?.toString() ?? ''
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      document.execCommand('copy')
    }
  }

  const launch = (kind) => {
    const entry = registry[kind]
    if (!entry) return
    openWindow({ kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height, maximized: entry.maximized })
  }

  const addFavorite = () => {
    if (!windowId) return
    const kind = windowId.split(':')[0]
    const entry = registry[kind]
    if (!entry) return
    setFavorites((prev) => {
      if (prev.some((f) => f.kind === kind)) return prev
      const next = [...prev, { kind, title: entry.title }]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

  const menus = {
    File: [{ label: 'Close', onClick: () => closeWindow(windowId), disabled: !windowId }],
    Edit: [
      { label: 'Select All', onClick: selectAll },
      { label: 'Copy', onClick: copySelection },
    ],
    View: [{ label: 'Refresh', onClick: onRefresh, disabled: !onRefresh }],
    Favorites: [
      { label: 'Add to Favorites', onClick: addFavorite, disabled: !windowId },
      { divider: true },
      ...(favorites.length
        ? favorites.map((f) => ({ label: f.title, onClick: () => launch(f.kind) }))
        : [{ label: '(no favorites yet)', disabled: true }]),
    ],
    Tools: [{ label: 'Folder Options…', onClick: () => launch('control-panel') }],
    Help: [{ label: 'Help and Support Center', onClick: () => launch('help') }],
  }

  return (
    <div ref={barRef} className="-mx-2 -mt-2 mb-1.5 bg-[#ece9d8] border-b border-[#c9c5b2]">
      <div className="h-[20px] flex items-center gap-3 px-2 text-[11px] text-[#111] select-none overflow-x-auto overflow-y-hidden">
        {Object.entries(menus).map(([name, items]) => (
          <MenuDropdown
            key={name}
            label={name}
            items={items}
            open={openMenu === name}
            onToggle={() => toggle(name)}
            onClose={() => setOpenMenu(null)}
          />
        ))}
      </div>
      <div className="flex items-center gap-0.5 px-1 py-1 border-t border-white/60 overflow-x-auto overflow-y-hidden">
        <button
          onClick={nav?.onBack}
          disabled={!nav?.canBack}
          title="Back"
          className="shrink-0 flex items-center px-1 py-1 rounded-[3px] text-[#333] hover:bg-[#c6d8f0] disabled:text-[#9a9686] disabled:hover:bg-transparent disabled:cursor-default"
        >
          <ArrowLeft size={14} />
          <ChevronDown size={9} />
        </button>
        <button
          onClick={nav?.onForward}
          disabled={!nav?.canForward}
          title="Forward"
          className="shrink-0 p-1 rounded-[3px] text-[#333] hover:bg-[#c6d8f0] disabled:text-[#9a9686] disabled:hover:bg-transparent disabled:cursor-default"
        >
          <ArrowRight size={14} />
        </button>
        <button
          onClick={onRefresh}
          disabled={!onRefresh}
          title="Refresh"
          className="shrink-0 p-1 rounded-[3px] text-[#555] hover:bg-[#c6d8f0] disabled:text-[#9a9686] disabled:hover:bg-transparent disabled:cursor-default"
        >
          <RotateCw size={13} />
        </button>
        <button
          onClick={nav?.onUp}
          disabled={!nav?.canUp}
          title="Up"
          className="shrink-0 p-1 rounded-[3px] text-[#333] hover:bg-[#c6d8f0] disabled:text-[#9a9686] disabled:hover:bg-transparent disabled:cursor-default"
        >
          <ArrowUp size={14} />
        </button>
        <div className="shrink-0 w-px h-[18px] bg-[#c9c5b2] mx-1" />
        <button
          onClick={search?.onToggle}
          title="Search"
          className={`shrink-0 flex items-center gap-1 px-1.5 py-1 rounded-[3px] text-[11px] text-[#333] ${
            search?.open ? 'bg-[#c6d8f0] border border-[#7f9db9]' : 'hover:bg-[#c6d8f0]'
          }`}
        >
          <Search size={14} className="text-[#1a7a2e]" />
          {compact ? null : 'Search'}
        </button>
        <button
          onClick={folders?.onToggle}
          title="Folders"
          className={`shrink-0 flex items-center gap-1 px-1.5 py-1 rounded-[3px] text-[11px] text-[#333] ${
            folders?.open ? 'bg-[#c6d8f0] border border-[#7f9db9]' : 'hover:bg-[#c6d8f0]'
          }`}
        >
          <FolderOpen size={14} className="text-[#c99a2e]" />
          {compact ? null : 'Folders'}
        </button>
        <div className="flex-1 min-w-[4px]" />
        <button
          onClick={view?.onToggle}
          title={view?.mode === 'icons' ? 'Switch to Details view' : 'Switch to Icons view'}
          className="shrink-0 p-1 rounded-[3px] hover:bg-[#c6d8f0] text-[#555]"
        >
          {view?.mode === 'icons' ? <List size={14} /> : <LayoutGrid size={14} />}
        </button>
      </div>
      {search?.open ? (
        <div className="flex items-center gap-1.5 px-1.5 py-1 border-t border-white/60 text-[11px] bg-[#fffbe8]">
          <Search size={12} className="text-[#1a7a2e] shrink-0" />
          <input
            autoFocus
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
            placeholder="Type a file or folder name"
            className="flex-1 bg-white border border-[#7f9db9] rounded-[2px] px-1.5 py-0.5 text-[11px] text-[#111] focus:outline-none focus:border-[#2a5ad1]"
          />
          <button
            onClick={() => {
              search.onChange('')
              search.onToggle?.()
            }}
            title="Close search"
            className="p-0.5 rounded-[2px] hover:bg-[#c6d8f0] text-[#555]"
          >
            <X size={12} />
          </button>
        </div>
      ) : null}
      <div className="relative flex items-center gap-1.5 px-1.5 py-1 border-t border-white/60 text-[11px]">
        <span className="text-[#333]">Address:</span>
        <span
          onClick={() => addressNav?.locations && setAddressOpen((v) => !v)}
          className={`flex-1 flex items-center gap-1.5 bg-white border border-[#7f9db9] rounded-[2px] px-1.5 py-0.5 min-w-0 ${
            addressNav?.locations ? 'cursor-pointer' : ''
          }`}
        >
          {Icon ? <Icon size={14} /> : null}
          <span className="text-[#111] truncate">{addressNav?.label ?? title}</span>
          <ChevronDown size={11} className="ml-auto text-[#555] shrink-0" />
        </span>
        <button
          onClick={() => addressNav?.onNavigate?.(addressNav.currentKey)}
          title="Go"
          className="w-[20px] h-[20px] flex items-center justify-center rounded-[2px] bg-[linear-gradient(180deg,#8df08d_0%,#2fa23a_60%,#1f7a2e_100%)] border border-[#1a5c1f] text-white text-[10px]"
        >
          ▶
        </button>
        {addressOpen && addressNav?.locations ? (
          <div className="absolute left-[58px] top-full mt-0.5 min-w-[200px] bg-white border border-[#7f9db9] shadow-[2px_2px_6px_rgba(0,0,0,0.4)] py-1 z-50 text-[11px] text-[#111]">
            {addressNav.locations.map((loc) => {
              const LocIcon = loc.icon
              return (
                <button
                  key={loc.key}
                  onClick={() => {
                    addressNav.onNavigate(loc.key)
                    setAddressOpen(false)
                  }}
                  className={`w-full flex items-center gap-1.5 text-left px-2 py-1 hover:bg-[#2a6fe0] hover:text-white ${
                    loc.key === addressNav.currentKey ? 'bg-[#e3ecfb]' : ''
                  }`}
                >
                  {LocIcon ? <LocIcon size={14} /> : null}
                  {loc.label}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </div>
  )
}
