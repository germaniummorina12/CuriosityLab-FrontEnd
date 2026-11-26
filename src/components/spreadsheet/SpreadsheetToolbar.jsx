import { useState } from 'react'
import { buttonXp, fieldInset } from '../../styles/xpTheme'
import { XpMenuBar } from '../desktop/XpMenuBar'
import { useWindowManager } from '../../context/WindowManagerContext'

export default function SpreadsheetToolbar({ title, filters, actions, windowId }) {
  const { closeWindow } = useWindowManager()
  const [showFilters, setShowFilters] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(false)

  const menus = {
    File: [{ label: 'Close', onClick: () => windowId && closeWindow(windowId), disabled: !windowId }],
    Edit: [{ label: 'Copy', disabled: true }, { label: 'Paste', disabled: true }],
    View: [{ label: 'Formula Bar', disabled: true }],
    Insert: [{ label: 'Rows', disabled: true }],
    Format: [{ label: 'Cells…', disabled: true }],
    Tools: [{ label: 'Options…', disabled: true }],
    Data: [{ label: showFilters ? 'Hide AutoFilter' : 'Show AutoFilter', onClick: () => setShowFilters((v) => !v) }],
    Window: [{ label: title, disabled: true }],
    Help: [{ label: 'About Microsoft Excel', onClick: () => setAboutOpen(true) }],
  }

  return (
    <div className="relative -mx-2 -mt-2 mb-1.5 flex flex-col gap-1.5">
      <XpMenuBar menus={menus} />
      <div className="mx-2 h-[26px] bg-gradient-to-b from-[#3fae4a] to-[#1f7a2e] border border-[#124f1d] rounded-[2px] flex items-center px-2 text-white text-[12px] font-semibold shadow-[1px_1px_1px_rgba(0,0,0,0.2)]">
        {title}
      </div>
      {showFilters && (filters?.length || actions?.length) ? (
        <div className="mx-2 flex flex-wrap items-end gap-2 bg-[#f7f6ef] border border-[#c8c4b0] rounded-[3px] px-2 py-1.5">
          {filters?.map((f) => (
            <label key={f.key} className="flex flex-col gap-0.5 text-[11px] text-[#333]">
              {f.label}
              {f.type === 'select' ? (
                <select className={fieldInset} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={fieldInset}
                  type={f.type ?? 'text'}
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => f.onChange(e.target.value)}
                />
              )}
            </label>
          ))}
          <div className="flex gap-1.5 ml-auto">
            {actions?.map((a) => (
              <button key={a.label} className={buttonXp} onClick={a.onClick} disabled={a.disabled}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {aboutOpen ? (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-4 text-[12px] text-[#111] w-[240px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">Microsoft Excel</p>
            <p className="mb-3">A lightweight XP-themed data viewer for {title.split(' — ')[0]}.</p>
            <button
              onClick={() => setAboutOpen(false)}
              className="px-3 py-0.5 bg-[#ece9d8] border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] border"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
