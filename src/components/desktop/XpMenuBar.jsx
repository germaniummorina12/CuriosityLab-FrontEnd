import { useEffect, useRef, useState } from 'react'

function MenuDropdown({ label, items, open, onToggle, onClose }) {
  return (
    <div className="relative">
      <span
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className={`hover:bg-[#2a6fe0] hover:text-white px-1.5 rounded-[2px] cursor-default ${
          open ? 'bg-[#2a6fe0] text-white' : ''
        }`}
      >
        {label}
      </span>
      {open ? (
        <div className="absolute left-0 top-full mt-0.5 min-w-[170px] bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_6px_rgba(0,0,0,0.4)] py-1 z-50 text-[12px] text-[#111] normal-case">
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
                className="w-full flex items-center gap-1.5 text-left px-3 py-1 hover:bg-[#2a6fe0] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#111] disabled:cursor-default"
              >
                <span className="w-3">{it.active ? '•' : ''}</span>
                {it.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}

// Classic-XP menu bar shared by every applet window (games, Explorer-style folders,
// spreadsheets): `menus` is an ordered { MenuName: items[] } map.
export function XpMenuBar({ menus }) {
  const [openMenu, setOpenMenu] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    if (!openMenu) return
    const onOutside = (e) => {
      if (barRef.current?.contains(e.target)) return
      setOpenMenu(null)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [openMenu])

  return (
    <div
      ref={barRef}
      className="w-full h-[20px] shrink-0 flex items-center gap-3 px-2 bg-[#ece9d8] border-b border-[#c9c5b2] text-[11px] text-[#111] select-none"
    >
      {Object.entries(menus).map(([name, items]) => (
        <MenuDropdown
          key={name}
          label={name}
          items={items}
          open={openMenu === name}
          onToggle={() => setOpenMenu((m) => (m === name ? null : name))}
          onClose={() => setOpenMenu(null)}
        />
      ))}
    </div>
  )
}
