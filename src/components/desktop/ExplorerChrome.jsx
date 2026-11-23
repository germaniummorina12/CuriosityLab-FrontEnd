import { ChevronDown, ArrowLeft, ArrowRight, RotateCw, ArrowUp, Search, FolderOpen, LayoutGrid } from 'lucide-react'

const MENU_ITEMS = ['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help']

// The classic Explorer-window chrome (menu bar, Back/Up/Search/Folders toolbar, address
// bar) that sits above a folder window's actual content — shared so My Computer, Recycle
// Bin, My Documents and Control Panel all get it instead of re-implementing it four times.
// Navigation buttons are decorative (there's nowhere for this app's single-level windows
// to navigate to/from), matching the disabled look real Explorer shows at a history's end.
export function ExplorerChrome({ title, icon: Icon }) {
  return (
    <div className="-mx-2 -mt-2 mb-1.5 bg-[#ece9d8] border-b border-[#c9c5b2]">
      <div className="h-[20px] flex items-center gap-3 px-2 text-[11px] text-[#111] select-none">
        {MENU_ITEMS.map((m) => (
          <span key={m} className="hover:bg-[#2a6fe0] hover:text-white px-1 rounded-[2px] cursor-default">
            {m}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-0.5 px-1 py-1 border-t border-white/60">
        <button disabled className="flex items-center px-1 py-1 rounded-[3px] text-[#9a9686] cursor-default">
          <ArrowLeft size={14} />
          <ChevronDown size={9} />
        </button>
        <button disabled className="p-1 rounded-[3px] text-[#9a9686] cursor-default">
          <ArrowRight size={14} />
        </button>
        <button disabled className="p-1 rounded-[3px] text-[#9a9686] cursor-default">
          <RotateCw size={13} />
        </button>
        <button disabled className="p-1 rounded-[3px] text-[#9a9686] cursor-default">
          <ArrowUp size={14} />
        </button>
        <div className="w-px h-[18px] bg-[#c9c5b2] mx-1" />
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-[3px] hover:bg-[#c6d8f0] text-[11px] text-[#333]">
          <Search size={14} className="text-[#1a7a2e]" />
          Search
        </button>
        <button className="flex items-center gap-1 px-1.5 py-1 rounded-[3px] hover:bg-[#c6d8f0] text-[11px] text-[#333]">
          <FolderOpen size={14} className="text-[#c99a2e]" />
          Folders
        </button>
        <div className="flex-1" />
        <button className="p-1 rounded-[3px] hover:bg-[#c6d8f0] text-[#555]">
          <LayoutGrid size={14} />
        </button>
      </div>
      <div className="flex items-center gap-1.5 px-1.5 py-1 border-t border-white/60 text-[11px]">
        <span className="text-[#333]">Address:</span>
        <span className="flex-1 flex items-center gap-1.5 bg-white border border-[#7f9db9] rounded-[2px] px-1.5 py-0.5 min-w-0">
          {Icon ? <Icon size={14} /> : null}
          <span className="text-[#111] truncate">{title}</span>
          <ChevronDown size={11} className="ml-auto text-[#555] shrink-0" />
        </span>
        <span className="w-[20px] h-[20px] flex items-center justify-center rounded-[2px] bg-[linear-gradient(180deg,#8df08d_0%,#2fa23a_60%,#1f7a2e_100%)] border border-[#1a5c1f] text-white text-[10px]">
          ▶
        </span>
      </div>
    </div>
  )
}
