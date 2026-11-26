import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FileText,
  FolderOpen,
  Save,
  Printer,
  Eye,
  CheckCheck,
  Scissors,
  Copy,
  ClipboardPaste,
  Undo2,
  Redo2,
  ArrowDownAZ,
  ArrowDownZA,
  Sigma,
  BarChart3,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Merge,
  PaintBucket,
  Palette,
  ChevronDown,
} from 'lucide-react'

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function ToolIcon({ icon: Icon, label, onClick, disabled }) {
  return (
    <button
      type="button"
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="w-[22px] h-[22px] shrink-0 flex items-center justify-center rounded-[2px] border border-transparent text-[#111] hover:border-[#9cb6d8] hover:bg-[#e5effa] active:bg-[#cfe0f5] disabled:opacity-35 disabled:hover:border-transparent disabled:hover:bg-transparent disabled:cursor-default"
    >
      <Icon size={14} strokeWidth={1.75} />
    </button>
  )
}

function ToolSep() {
  return <div className="w-px h-4 bg-[#c0bba3] mx-0.5 shrink-0" />
}

function ContextMenu({ x, y, onClose, onCopy, copyDisabled }) {
  const ref = useRef(null)

  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current?.contains(e.target)) onClose()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const items = [
    { label: 'Cut', disabled: true },
    { label: 'Copy', onClick: onCopy, disabled: copyDisabled },
    { label: 'Paste', disabled: true },
    { divider: true },
    { label: 'Paste Special…', disabled: true },
    { divider: true },
    { label: 'Insert…', disabled: true },
    { label: 'Delete…', disabled: true },
    { label: 'Clear Contents', disabled: true },
    { divider: true },
    { label: 'Format Cells…', disabled: true },
    { label: 'Column Width…', disabled: true },
    { label: 'Row Height…', disabled: true },
  ]

  // Portaled to document.body: every window has a CSS `transform` (scale) on it for the
  // pop-in open animation, and a transform on any ancestor turns it into the containing
  // block for `position: fixed` descendants — without the portal this menu would get
  // clipped to that window's own bounds instead of floating freely over the desktop.
  return createPortal(
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y }}
      className="z-[999] min-w-[170px] bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_6px_rgba(0,0,0,0.4)] py-1 text-[12px] text-[#111]"
    >
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
            className="w-full text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#111] disabled:cursor-default"
          >
            {it.label}
          </button>
        ),
      )}
    </div>,
    document.body,
  )
}

function compareValues(a, b) {
  const na = parseFloat(a)
  const nb = parseFloat(b)
  const bothNumeric = a !== '' && b !== '' && a != null && b != null && !Number.isNaN(na) && !Number.isNaN(nb)
  if (bothNumeric) return na - nb
  return String(a ?? '').localeCompare(String(b ?? ''))
}

export default function SpreadsheetTable({
  columns,
  rows,
  emptyLabel = 'No rows',
  onRowDoubleClick,
  selectable = false,
  selectedIds,
  onToggleRow,
}) {
  // sel tracks the two corners of a selection the way real Excel does: `anchor` is the
  // cell you started on (stays put, and is what the formula bar/Name Box reflect), `focus`
  // is the cell the selection currently extends to (moves under drag, shift+click, or
  // shift+arrow). The rectangle between them is derived, never stored directly.
  const [sel, setSel] = useState(null) // { anchorR, anchorC, focusR, focusC }
  const [dragging, setDragging] = useState(false)
  const [sortSpec, setSortSpec] = useState(null) // { col, dir }
  const [menu, setMenu] = useState(null) // { x, y }
  const gridRef = useRef(null)

  useEffect(() => {
    const up = () => setDragging(false)
    window.addEventListener('mouseup', up)
    return () => window.removeEventListener('mouseup', up)
  }, [])

  const sortedRows = useMemo(() => {
    if (!sortSpec) return rows
    const col = columns[sortSpec.col]
    if (!col) return rows
    const copy = [...rows]
    copy.sort((ra, rb) => {
      const cmp = compareValues(ra[col.key], rb[col.key])
      return sortSpec.dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortSpec, columns])

  const rect = useMemo(() => {
    if (!sel) return null
    return {
      r1: Math.min(sel.anchorR, sel.focusR),
      r2: Math.max(sel.anchorR, sel.focusR),
      c1: Math.min(sel.anchorC, sel.focusC),
      c2: Math.max(sel.anchorC, sel.focusC),
    }
  }, [sel])

  const cellValue = (r, c) => {
    const row = sortedRows[r]
    const col = columns[c]
    if (!row || !col) return ''
    return col.render ? col.render(row) : String(row[col.key] ?? '')
  }

  const extendTo = (r, c) => {
    setSel((prev) => (prev ? { ...prev, focusR: r, focusC: c } : prev))
  }

  const selectCell = (r, c) => {
    setSel({ anchorR: r, anchorC: c, focusR: r, focusC: c })
    setDragging(true)
    gridRef.current?.focus()
  }

  const selectColumn = (c) => {
    if (!sortedRows.length) return
    setSel({ anchorR: 0, anchorC: c, focusR: sortedRows.length - 1, focusC: c })
    gridRef.current?.focus()
  }

  const selectRow = (r) => {
    setSel({ anchorR: r, anchorC: 0, focusR: r, focusC: columns.length - 1 })
    gridRef.current?.focus()
  }

  const selectAll = () => {
    if (!sortedRows.length) return
    setSel({ anchorR: 0, anchorC: 0, focusR: sortedRows.length - 1, focusC: columns.length - 1 })
    gridRef.current?.focus()
  }

  const openContextMenu = (e, r, c) => {
    e.preventDefault()
    const inside = rect && r >= rect.r1 && r <= rect.r2 && c >= rect.c1 && c <= rect.c2
    if (!inside) setSel({ anchorR: r, anchorC: c, focusR: r, focusC: c })
    setMenu({ x: e.clientX, y: e.clientY })
  }

  const copySelection = () => {
    if (!rect) return
    const lines = []
    for (let r = rect.r1; r <= rect.r2; r++) {
      const row = sortedRows[r]
      if (!row) continue
      const cells = []
      for (let c = rect.c1; c <= rect.c2; c++) {
        const col = columns[c]
        cells.push(col ? String(col.render ? col.render(row) : (row[col.key] ?? '')) : '')
      }
      lines.push(cells.join('\t'))
    }
    navigator.clipboard?.writeText(lines.join('\n')).catch(() => {})
  }

  const sortBy = (dir) => {
    if (!sel) return
    setSortSpec({ col: sel.anchorC, dir })
  }

  // Arrow-key navigation, matching Excel: a plain arrow collapses the selection and moves
  // the active cell by one; shift+arrow instead drags `focus` away from a fixed `anchor`.
  const moveSelection = (dr, dc, extend) => {
    if (!sortedRows.length) return
    setSel((prev) => {
      const maxR = sortedRows.length - 1
      const maxC = columns.length - 1
      const base = prev ?? { anchorR: 0, anchorC: 0, focusR: 0, focusC: 0 }
      if (extend) {
        const focusR = Math.min(maxR, Math.max(0, base.focusR + dr))
        const focusC = Math.min(maxC, Math.max(0, base.focusC + dc))
        return { ...base, focusR, focusC }
      }
      const r = Math.min(maxR, Math.max(0, base.focusR + dr))
      const c = Math.min(maxC, Math.max(0, base.focusC + dc))
      return { anchorR: r, anchorC: c, focusR: r, focusC: c }
    })
  }

  // Keep the active cell scrolled into view after keyboard navigation moves it off-screen.
  useEffect(() => {
    if (!sel) return
    const el = gridRef.current?.querySelector(`[data-cell="${sel.focusR}-${sel.focusC}"]`)
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [sel?.focusR, sel?.focusC])

  const onGridKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSel(null)
      return
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
      e.preventDefault()
      copySelection()
      return
    }
    const deltas = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
    const delta = deltas[e.key]
    if (delta) {
      e.preventDefault()
      moveSelection(delta[0], delta[1], e.shiftKey)
    }
  }

  const summary = useMemo(() => {
    if (!rect) return null
    const count = (rect.r2 - rect.r1 + 1) * (rect.c2 - rect.c1 + 1)
    if (count <= 1) return null
    let sum = 0
    let numCount = 0
    for (let r = rect.r1; r <= rect.r2; r++) {
      const row = sortedRows[r]
      if (!row) continue
      for (let c = rect.c1; c <= rect.c2; c++) {
        const col = columns[c]
        if (!col) continue
        const raw = row[col.key]
        const n = typeof raw === 'number' ? raw : parseFloat(raw)
        if (raw !== '' && raw != null && !Number.isNaN(n)) {
          sum += n
          numCount++
        }
      }
    }
    return { count, sum, avg: numCount ? sum / numCount : 0, numCount }
  }, [rect, sortedRows, columns])

  const cellRef = (() => {
    if (!rect || !sortedRows.length) return ''
    const fullColSel = rect.r1 === 0 && rect.r2 === sortedRows.length - 1 && rect.c1 === rect.c2
    const fullRowSel = rect.c1 === 0 && rect.c2 === columns.length - 1 && rect.r1 === rect.r2
    if (fullColSel) return `${letters[rect.c1] ?? ''}:${letters[rect.c1] ?? ''}`
    if (fullRowSel) return `${rect.r1 + 2}:${rect.r1 + 2}`
    return `${letters[sel.anchorC] ?? ''}${sel.anchorR + 2}`
  })()

  const fxValue = sel ? cellValue(sel.anchorR, sel.anchorC) : ''

  const inSelCol = (c) => rect && c >= rect.c1 && c <= rect.c2
  const inSelRow = (r) => rect && r >= rect.r1 && r <= rect.r2
  const isAnchor = (r, c) => sel && r === sel.anchorR && c === sel.anchorC
  const isInSel = (r, c) => rect && r >= rect.r1 && r <= rect.r2 && c >= rect.c1 && c <= rect.c2

  return (
    <div className="flex-1 min-h-0 flex flex-col border border-[#8a9aad] bg-white select-none">
      {/* Standard toolbar */}
      <div className="shrink-0 flex items-center gap-0.5 px-1 py-0.5 border-b border-[#c9c5b2] bg-[#ece9d8]">
        <ToolIcon icon={FileText} label="New" disabled />
        <ToolIcon icon={FolderOpen} label="Open" disabled />
        <ToolIcon icon={Save} label="Save" disabled />
        <ToolSep />
        <ToolIcon icon={Printer} label="Print" onClick={() => window.print()} />
        <ToolIcon icon={Eye} label="Print Preview" disabled />
        <ToolIcon icon={CheckCheck} label="Spelling" disabled />
        <ToolSep />
        <ToolIcon icon={Scissors} label="Cut" disabled />
        <ToolIcon icon={Copy} label="Copy" onClick={copySelection} disabled={!sel} />
        <ToolIcon icon={ClipboardPaste} label="Paste" disabled />
        <ToolSep />
        <ToolIcon icon={Undo2} label="Undo" disabled />
        <ToolIcon icon={Redo2} label="Redo" disabled />
        <ToolSep />
        <ToolIcon icon={ArrowDownAZ} label="Sort Ascending" onClick={() => sortBy('asc')} disabled={!sel || sortedRows.length < 2} />
        <ToolIcon icon={ArrowDownZA} label="Sort Descending" onClick={() => sortBy('desc')} disabled={!sel || sortedRows.length < 2} />
        <ToolSep />
        <ToolIcon icon={Sigma} label="AutoSum" disabled />
        <ToolIcon icon={BarChart3} label="Chart Wizard" disabled />
      </div>

      {/* Formatting toolbar */}
      <div className="shrink-0 flex items-center gap-1 px-1 py-0.5 border-b border-[#c9c5b2] bg-[#ece9d8] text-[11px]">
        <select disabled className="h-[20px] w-[80px] border border-[#9a9a9a] bg-[#f3f3f3] px-1 text-[#555]">
          <option>Arial</option>
        </select>
        <select disabled className="h-[20px] w-[36px] border border-[#9a9a9a] bg-[#f3f3f3] px-1 text-[#555]">
          <option>10</option>
        </select>
        <ToolSep />
        <ToolIcon icon={Bold} label="Bold" disabled />
        <ToolIcon icon={Italic} label="Italic" disabled />
        <ToolIcon icon={Underline} label="Underline" disabled />
        <ToolSep />
        <ToolIcon icon={AlignLeft} label="Align Left" disabled />
        <ToolIcon icon={AlignCenter} label="Center" disabled />
        <ToolIcon icon={AlignRight} label="Align Right" disabled />
        <ToolSep />
        <ToolIcon icon={Merge} label="Merge and Center" disabled />
        <ToolSep />
        <ToolIcon icon={PaintBucket} label="Fill Color" disabled />
        <ToolIcon icon={Palette} label="Font Color" disabled />
      </div>

      {/* Formula bar */}
      <div className="shrink-0 flex items-center gap-1.5 border-b border-[#8a9aad] bg-[#f3f3f3] px-1 py-0.5 text-[11px] text-[#111]">
        <div className="w-20 shrink-0 flex items-center border border-[#9a9a9a] bg-white">
          <span className="flex-1 px-1 py-0.5 font-mono truncate">{cellRef}</span>
          <button disabled className="px-0.5 text-[#777] disabled:opacity-50" title="Name Box">
            <ChevronDown size={11} />
          </button>
        </div>
        <span className="italic text-[#555] px-1">fx</span>
        <span className="flex-1 border border-[#9a9a9a] bg-white px-1.5 py-0.5 truncate">{fxValue}</span>
      </div>

      <div
        ref={gridRef}
        tabIndex={0}
        onKeyDown={onGridKeyDown}
        className="flex-1 min-h-0 overflow-auto outline-none"
      >
        <table className="border-collapse w-full text-[12px]">
          <thead>
            <tr>
              {selectable ? (
                <th rowSpan={2} className="sticky top-0 z-10 w-8 bg-[#d8dde3] border border-[#8a9aad]" />
              ) : null}
              <th
                onMouseDown={selectAll}
                className="sticky top-0 z-10 w-10 bg-[#d8dde3] border border-[#8a9aad] text-[#444] font-normal cursor-default hover:bg-[#c3cedb]"
              />
              {columns.map((_, i) => (
                <th
                  key={i}
                  onMouseDown={() => selectColumn(i)}
                  className={`sticky top-0 z-10 border border-[#8a9aad] font-normal px-2 py-0.5 min-w-[110px] cursor-default ${
                    inSelCol(i) ? 'bg-[#3b6ea5] text-white font-bold' : 'bg-[#d8dde3] text-[#444] hover:bg-[#c3cedb]'
                  }`}
                >
                  {letters[i] ?? i}
                </th>
              ))}
            </tr>
            <tr>
              <th
                onMouseDown={selectAll}
                className="sticky top-[21px] z-10 bg-[#eef1f5] border border-[#8a9aad] text-[#444] cursor-default hover:bg-[#c3cedb]"
              >
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="sticky top-[21px] z-10 bg-[#eef1f5] border border-[#8a9aad] text-left px-2 py-1 font-bold text-[#111]"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                {selectable ? <td className="border border-[#8a9aad] bg-[#fafaf6]" /> : null}
                <td className="border border-[#8a9aad] text-center text-[#444] bg-[#fafaf6]" />
                <td
                  colSpan={columns.length}
                  className="border border-[#8a9aad] text-center text-[#777] italic py-4 bg-[#fafaf6]"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => (
                <tr key={row.id ?? idx} className="cursor-default" onDoubleClick={() => onRowDoubleClick?.(row)}>
                  {selectable ? (
                    <td className="border border-[#8a9aad] text-center bg-[#eef1f5]">
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(row.id) ?? false}
                        onChange={() => onToggleRow?.(row.id)}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    </td>
                  ) : null}
                  <td
                    onMouseDown={() => selectRow(idx)}
                    className={`border text-center cursor-default ${
                      inSelRow(idx) ? 'bg-[#3b6ea5] text-white font-bold border-[#8a9aad]' : 'bg-[#eef1f5] text-[#444] border-[#8a9aad] hover:bg-[#c3cedb]'
                    }`}
                  >
                    {idx + 1}
                  </td>
                  {columns.map((col, c) => (
                    <td
                      key={col.key}
                      data-cell={`${idx}-${c}`}
                      onMouseDown={() => selectCell(idx, c)}
                      onMouseEnter={() => dragging && extendTo(idx, c)}
                      onContextMenu={(e) => openContextMenu(e, idx, c)}
                      className={`border px-2 py-1 text-[#111] whitespace-nowrap hover:bg-[#e3ecfb] ${
                        isAnchor(idx, c)
                          ? 'border-2 border-[#1a5fd1]'
                          : isInSel(idx, c)
                            ? 'bg-[#d7e6fb] border-[#8a9aad]'
                            : 'border-[#8a9aad]'
                      }`}
                    >
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {summary ? (
        <div className="shrink-0 flex items-center justify-between border-t border-[#8a9aad] bg-[#ece9d8] px-2 py-0.5 text-[11px] text-[#333]">
          <span>Ready</span>
          <span className="font-mono">
            {summary.numCount > 0
              ? `Sum=${summary.sum}   Average=${(summary.avg).toFixed(2)}   Count=${summary.count}`
              : `Count=${summary.count}`}
          </span>
        </div>
      ) : null}

      {menu ? (
        <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} onCopy={copySelection} copyDisabled={!sel} />
      ) : null}
    </div>
  )
}
