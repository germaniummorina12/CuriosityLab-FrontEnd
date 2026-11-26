import { useEffect, useMemo, useRef, useState } from 'react'
import { Trash2, RotateCcw, Monitor, FolderOpen, Settings, Info, User as UserIcon } from 'lucide-react'
import { usersApi } from '../lib/endpoints/users'
import { trashStore } from '../lib/trashStore'
import { sectionGroove, statusBar, buttonXp } from '../styles/xpTheme'
import { ExplorerChrome } from '../components/desktop/ExplorerChrome'
import { RecycleBinIcon, MyComputerIcon } from '../components/icons/RetroIcons'
import { useWindowManager } from '../context/WindowManagerContext'
import { registry } from './registry'

const COLUMNS = [
  { key: 'name', label: 'Name', width: null },
  { key: 'originalLocation', label: 'Original Location', width: 170 },
  { key: 'dateDeleted', label: 'Date Deleted', width: 130 },
  { key: 'type', label: 'Type', width: 110 },
  { key: 'size', label: 'Size', width: 70 },
]

const keyOf = (item) => `${item.sourceKind}:${item.id}`

function formatSize(bytes) {
  if (!bytes) return '1 KB'
  return `${Math.max(1, Math.ceil(bytes / 1024))} KB`
}

function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString(undefined, {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function RecycleBinWindow({ windowId }) {
  const { openWindow, showDesktop } = useWindowManager()
  const [items, setItems] = useState(() => trashStore.list())
  const [selectedKeys, setSelectedKeys] = useState(() => new Set())
  const [lastClickedKey, setLastClickedKey] = useState(null)
  const [message, setMessage] = useState(null)
  const [busy, setBusy] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null) // 'all' | 'selected' | null
  const [cannotOpenItem, setCannotOpenItem] = useState(null)
  const [propertiesItem, setPropertiesItem] = useState(null)
  const [contextMenu, setContextMenu] = useState(null) // { x, y, item } | { x, y } for empty-area
  const contextMenuRef = useRef(null)

  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [viewMode, setViewMode] = useState('details')
  const [foldersOpen, setFoldersOpen] = useState(false)

  useEffect(() => trashStore.subscribe(setItems), [])

  useEffect(() => {
    if (!contextMenu) return
    const onOutside = (e) => {
      if (contextMenuRef.current?.contains(e.target)) return
      setContextMenu(null)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [contextMenu])

  // Del key permanently removes the current selection from the bin's listing — a separate
  // action from "Empty the Recycle Bin" (which clears everything). Ignored while typing in
  // the search box or while a modal is already open.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Delete') return
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (confirmTarget || cannotOpenItem || propertiesItem || contextMenu) return
      if (selectedKeys.size === 0) return
      setConfirmTarget('selected')
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [selectedKeys, confirmTarget, cannotOpenItem, propertiesItem, contextMenu])

  const visibleItems = useMemo(() => {
    if (!searchValue.trim()) return items
    const q = searchValue.trim().toLowerCase()
    return items.filter((i) => i.name.toLowerCase().includes(q))
  }, [items, searchValue])

  const selectedItems = useMemo(() => items.filter((i) => selectedKeys.has(keyOf(i))), [items, selectedKeys])
  const isSelected = (item) => selectedKeys.has(keyOf(item))

  const selectItem = (item, e) => {
    const key = keyOf(item)
    if (e?.ctrlKey || e?.metaKey) {
      setSelectedKeys((prev) => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key)
        else next.add(key)
        return next
      })
    } else if (e?.shiftKey && lastClickedKey) {
      const idx1 = visibleItems.findIndex((i) => keyOf(i) === lastClickedKey)
      const idx2 = visibleItems.findIndex((i) => keyOf(i) === key)
      if (idx1 !== -1 && idx2 !== -1) {
        const [a, b] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1]
        setSelectedKeys(new Set(visibleItems.slice(a, b + 1).map(keyOf)))
      } else {
        setSelectedKeys(new Set([key]))
      }
    } else {
      setSelectedKeys(new Set([key]))
    }
    setLastClickedKey(key)
  }

  const onItemContextMenu = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSelected(item)) selectItem(item)
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }

  const restoreMany = async (list) => {
    if (!list.length) return
    setBusy(true)
    setMessage(null)
    const results = await Promise.allSettled(list.map((item) => usersApi.restore(item.id, { id: item.id })))
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') trashStore.removeEntry(list[i].id, list[i].sourceKind)
    })
    const failed = results.filter((r) => r.status === 'rejected').length
    setSelectedKeys(new Set())
    setMessage(
      failed
        ? { type: 'error', text: `Restored ${results.length - failed} of ${results.length} item(s); ${failed} failed.` }
        : { type: 'ok', text: list.length === 1 ? `"${list[0].name}" restored.` : `Restored ${list.length} item(s).` },
    )
    setBusy(false)
  }

  // Permanently removes the given items from the bin's local listing (not a restore).
  // Nothing extra happens server-side — the record was already deleted for real the moment
  // it was put in the bin — this just stops showing it as recoverable.
  const deleteMany = (list) => {
    list.forEach((item) => trashStore.removeEntry(item.id, item.sourceKind))
    setSelectedKeys(new Set())
    setConfirmTarget(null)
    setMessage(null)
  }

  const launch = (kind) => {
    const entry = registry[kind]
    if (!entry) return
    openWindow({ kind, title: entry.title, icon: entry.icon, width: entry.width, height: entry.height })
  }

  const totalBytes = items.reduce((sum, i) => sum + (i.size ?? 1024), 0)
  const confirmItems = confirmTarget === 'all' ? items : confirmTarget === 'selected' ? selectedItems : []

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <ExplorerChrome
        title="Recycle Bin"
        icon={RecycleBinIcon}
        windowId={windowId}
        onRefresh={() => setItems(trashStore.list())}
        nav={{ canBack: false, canForward: false, canUp: true, onUp: showDesktop }}
        search={{
          open: searchOpen,
          value: searchValue,
          onToggle: () => setSearchOpen((v) => !v),
          onChange: setSearchValue,
        }}
        view={{ mode: viewMode, onToggle: () => setViewMode((m) => (m === 'details' ? 'icons' : 'details')) }}
        folders={{ open: foldersOpen, onToggle: () => setFoldersOpen((v) => !v) }}
      />

      <div className="flex-1 min-h-0 flex gap-2">
        {foldersOpen ? (
          <div className={`${sectionGroove} w-[150px] shrink-0 overflow-auto py-1`}>
            <button
              onClick={showDesktop}
              className="w-full flex items-center gap-1.5 px-2 py-1 text-left text-[11px] hover:bg-[#c6d8f0] text-[#111]"
            >
              <Monitor size={14} />
              Desktop
            </button>
            <button
              onClick={() => launch('dashboard')}
              className="w-full flex items-center gap-1.5 pl-5 py-1 text-left text-[11px] hover:bg-[#c6d8f0] text-[#111]"
            >
              <MyComputerIcon size={13} />
              My Computer
            </button>
            <button className="w-full flex items-center gap-1.5 pl-5 py-1 text-left text-[11px] bg-[#2a6fe0] text-white">
              <RecycleBinIcon size={13} />
              Recycle Bin
            </button>
          </div>
        ) : (
          <div className="w-[150px] shrink-0 overflow-auto flex flex-col gap-2">
            <div className={`${sectionGroove} p-2`}>
              <div className="text-[11px] font-bold text-[#1941a5] mb-1">Recycle Bin Tasks</div>
              <div className="flex flex-col gap-1 text-[11px] text-[#15438f]">
                <button
                  className="flex items-center gap-1 text-left hover:underline disabled:text-[#9a9686] disabled:no-underline disabled:cursor-default"
                  disabled={items.length === 0 || busy}
                  onClick={() => setConfirmTarget('all')}
                >
                  <Trash2 size={12} />
                  Empty the Recycle Bin
                </button>
                <button
                  className="flex items-center gap-1 text-left hover:underline disabled:text-[#9a9686] disabled:no-underline disabled:cursor-default"
                  disabled={items.length === 0 || busy}
                  onClick={() => restoreMany(items)}
                >
                  <RotateCcw size={12} />
                  Restore all items
                </button>
                {selectedItems.length ? (
                  <button
                    className="flex items-center gap-1 text-left hover:underline disabled:text-[#9a9686] disabled:no-underline disabled:cursor-default"
                    disabled={busy}
                    onClick={() => restoreMany(selectedItems)}
                  >
                    <RotateCcw size={12} />
                    {selectedItems.length === 1 ? 'Restore this item' : `Restore these ${selectedItems.length} items`}
                  </button>
                ) : null}
              </div>
            </div>
            <div className={`${sectionGroove} p-2`}>
              <div className="text-[11px] font-bold text-[#1941a5] mb-1">Other Places</div>
              <div className="flex flex-col gap-1 text-[11px] text-[#15438f]">
                <button className="flex items-center gap-1 text-left hover:underline" onClick={showDesktop}>
                  <Monitor size={12} />
                  Desktop
                </button>
                <button className="flex items-center gap-1 text-left hover:underline" onClick={() => launch('my-documents')}>
                  <FolderOpen size={12} />
                  My Documents
                </button>
                <button className="flex items-center gap-1 text-left hover:underline" onClick={() => launch('dashboard')}>
                  <MyComputerIcon size={12} />
                  My Computer
                </button>
                <button className="flex items-center gap-1 text-left hover:underline" onClick={() => launch('control-panel')}>
                  <Settings size={12} />
                  Control Panel
                </button>
              </div>
            </div>
            <div className={`${sectionGroove} p-2`}>
              <div className="text-[11px] font-bold text-[#1941a5] mb-1 flex items-center gap-1">
                <Info size={12} />
                Details
              </div>
              {selectedItems.length === 1 ? (
                <div className="text-[11px] text-[#333] flex flex-col gap-0.5">
                  <span className="font-bold truncate">{selectedItems[0].name}</span>
                  <span>{selectedItems[0].type}</span>
                  <span>Date deleted: {formatDate(selectedItems[0].dateDeleted)}</span>
                  <span>Size: {formatSize(selectedItems[0].size)}</span>
                </div>
              ) : selectedItems.length > 1 ? (
                <div className="text-[11px] text-[#333]">
                  {selectedItems.length} objects selected
                  <br />
                  Total size: {formatSize(selectedItems.reduce((s, i) => s + (i.size ?? 1024), 0))}
                </div>
              ) : (
                <div className="text-[11px] text-[#333]">
                  Recycle Bin
                  <br />
                  {items.length} object(s)
                  <br />
                  Total size: {formatSize(totalBytes)}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0 flex flex-col gap-2">
          {message ? (
            <div className={`text-[12px] px-1 ${message.type === 'ok' ? 'text-[#1a7a2e]' : 'text-[#8a1a1a]'}`}>
              {message.text}
            </div>
          ) : null}

          {viewMode === 'details' ? (
            <div
              className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY })
              }}
            >
              <div className="flex items-center gap-3 px-3 py-1 border-b border-[#a6a28c] bg-[#f0eee3] text-[11px] font-bold text-[#333] sticky top-0">
                {COLUMNS.map((c) => (
                  <span
                    key={c.key}
                    className={`truncate ${c.width ? 'shrink-0' : 'flex-1'}`}
                    style={c.width ? { width: c.width } : undefined}
                  >
                    {c.label}
                  </span>
                ))}
              </div>
              {visibleItems.length === 0 ? (
                <div className="px-3 py-8 text-[12px] text-[#777] italic text-center">
                  {items.length === 0 ? 'This folder is Empty' : 'No items match your search'}
                </div>
              ) : (
                visibleItems.map((item) => {
                  const selected = isSelected(item)
                  return (
                    <div
                      key={keyOf(item)}
                      onClick={(e) => selectItem(item, e)}
                      onDoubleClick={() => setCannotOpenItem(item)}
                      onContextMenu={(e) => onItemContextMenu(e, item)}
                      className={`flex items-center gap-3 px-3 py-1.5 text-[12px] border-b border-[#e3e1d6] last:border-b-0 cursor-default ${
                        selected ? 'bg-[#2a6fe0] text-white' : 'text-[#111] hover:bg-[#e3ecfb]'
                      }`}
                    >
                      <span className="flex-1 flex items-center gap-2 truncate min-w-0">
                        <UserIcon size={14} className={`shrink-0 ${selected ? '' : 'text-[#5a7aa0]'}`} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="truncate shrink-0" style={{ width: 170 }}>
                        {item.originalLocation}
                      </span>
                      <span className="truncate shrink-0" style={{ width: 130 }}>
                        {formatDate(item.dateDeleted)}
                      </span>
                      <span className="truncate shrink-0" style={{ width: 110 }}>
                        {item.type}
                      </span>
                      <span className="truncate shrink-0" style={{ width: 70 }}>
                        {formatSize(item.size)}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          ) : (
            <div
              className={`${sectionGroove} flex-1 min-h-0 overflow-auto p-3 flex flex-wrap gap-4 content-start`}
              onContextMenu={(e) => {
                e.preventDefault()
                setContextMenu({ x: e.clientX, y: e.clientY })
              }}
            >
              {visibleItems.length === 0 ? (
                <div className="px-3 py-2 text-[12px] text-[#777] italic">
                  {items.length === 0 ? 'This folder is Empty' : 'No items match your search'}
                </div>
              ) : (
                visibleItems.map((item) => {
                  const selected = isSelected(item)
                  return (
                    <button
                      key={keyOf(item)}
                      onClick={(e) => selectItem(item, e)}
                      onDoubleClick={() => setCannotOpenItem(item)}
                      onContextMenu={(e) => onItemContextMenu(e, item)}
                      className={`w-[84px] flex flex-col items-center gap-1 px-1 py-2 rounded-[3px] text-[11px] ${
                        selected ? 'bg-[#2a6fe0] text-white' : 'text-[#111] hover:bg-[#e3ecfb]'
                      }`}
                    >
                      <UserIcon size={30} className={selected ? '' : 'text-[#5a7aa0]'} />
                      <span className="text-center leading-tight break-words">{item.name}</span>
                    </button>
                  )
                })
              )}
            </div>
          )}
        </div>
      </div>

      <div className={statusBar}>
        {selectedItems.length
          ? `${selectedItems.length} object(s) selected`
          : `${visibleItems.length} object(s)${searchValue ? ` matching "${searchValue}"` : ''}`}
      </div>

      {contextMenu ? (
        <div
          ref={contextMenuRef}
          style={{ left: contextMenu.x, top: contextMenu.y }}
          className="fixed min-w-[160px] bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_6px_rgba(0,0,0,0.4)] py-1 z-50 text-[12px] text-[#111]"
        >
          {contextMenu.item ? (
            <>
              <button
                className="w-full flex items-center text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white"
                onClick={() => {
                  setContextMenu(null)
                  restoreMany(isSelected(contextMenu.item) ? selectedItems : [contextMenu.item])
                }}
              >
                Restore
              </button>
              <button disabled className="w-full flex items-center text-left px-3 py-1 opacity-40 cursor-default">
                Cut
              </button>
              <button
                className="w-full flex items-center text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white"
                onClick={() => {
                  setContextMenu(null)
                  setConfirmTarget('selected')
                }}
              >
                Delete
              </button>
              <div className="h-px bg-[#c9c5b2] my-1 mx-1" />
              <button
                className="w-full flex items-center text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white"
                onClick={() => {
                  setPropertiesItem(contextMenu.item)
                  setContextMenu(null)
                }}
              >
                Properties
              </button>
            </>
          ) : (
            <>
              <button disabled className="w-full flex items-center text-left px-3 py-1 opacity-40 cursor-default">
                Paste
              </button>
              <button
                className="w-full flex items-center text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white"
                onClick={() => {
                  setItems(trashStore.list())
                  setContextMenu(null)
                }}
              >
                Refresh
              </button>
            </>
          )}
        </div>
      ) : null}

      {confirmTarget ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setConfirmTarget(null)}>
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-4 text-[12px] text-[#111] w-[280px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">{confirmItems.length === 1 ? 'Confirm File Delete' : 'Confirm Multiple File Delete'}</p>
            <p className="mb-3">
              {confirmItems.length === 1
                ? `Are you sure you want to permanently delete '${confirmItems[0].name}'?`
                : `Are you sure you want to permanently delete these ${confirmItems.length} items?`}
            </p>
            <div className="flex justify-end gap-2">
              <button className={buttonXp} onClick={() => setConfirmTarget(null)}>
                No
              </button>
              <button className={buttonXp} onClick={() => deleteMany(confirmItems)}>
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {cannotOpenItem ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setCannotOpenItem(null)}>
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-4 text-[12px] text-[#111] w-[300px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">Recycle Bin</p>
            <p className="mb-3">
              Windows cannot open "{cannotOpenItem.name}" from the Recycle Bin. Restore it to its original location first.
            </p>
            <div className="flex justify-end">
              <button className={buttonXp} onClick={() => setCannotOpenItem(null)}>
                OK
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {propertiesItem ? (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setPropertiesItem(null)}>
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] w-[260px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-1.5 bg-[linear-gradient(180deg,#0997ff_0%,#0050ee_100%)] text-white text-[12px] font-bold">
              {propertiesItem.name} Properties
            </div>
            <div className="p-3 flex flex-col gap-2 text-[12px]">
              <div className="flex items-center gap-2">
                <UserIcon size={28} className="text-[#5a7aa0]" />
                <span className="font-bold">{propertiesItem.name}</span>
              </div>
              <div className={sectionGroove}>
                <div className="flex justify-between px-2 py-1 border-b border-[#e3e1d6]">
                  <span className="text-[#333]">Type</span>
                  <span className="font-bold">{propertiesItem.type}</span>
                </div>
                <div className="flex justify-between px-2 py-1 border-b border-[#e3e1d6]">
                  <span className="text-[#333]">Location</span>
                  <span className="font-bold truncate max-w-[140px]">{propertiesItem.originalLocation}</span>
                </div>
                <div className="flex justify-between px-2 py-1 border-b border-[#e3e1d6]">
                  <span className="text-[#333]">Size</span>
                  <span className="font-bold">{formatSize(propertiesItem.size)}</span>
                </div>
                <div className="flex justify-between px-2 py-1">
                  <span className="text-[#333]">Date deleted</span>
                  <span className="font-bold">{formatDate(propertiesItem.dateDeleted)}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <button className={buttonXp} onClick={() => setPropertiesItem(null)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
