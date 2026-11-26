import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react'

const TABS = ['Sheet1', 'Sheet2', 'Sheet3']

// Cosmetic sheet-tab strip at the foot of every spreadsheet window, matching real
// Excel's chrome. Sheet2/Sheet3 are empty in this app, so they're unclickable —
// labeled, not wired to fake content. The tab-scroll arrows are real Excel chrome too,
// but with only 3 (static) tabs there's nothing to scroll to, so they stay disabled
// rather than fake-wired.
export default function SheetTabs({ active = 'Sheet1' }) {
  return (
    <div className="shrink-0 flex items-center gap-px border-x border-b border-[#8a9aad] bg-[#d8dde3] px-1 pt-1 text-[11px]">
      <div className="flex items-center gap-px mr-1 pb-1">
        {[ChevronFirst, ChevronLeft, ChevronRight, ChevronLast].map((Icon, i) => (
          <button
            key={i}
            disabled
            className="w-[18px] h-[16px] flex items-center justify-center border border-[#8a9aad] bg-[#ece9d8] text-[#444] disabled:opacity-50"
          >
            <Icon size={11} />
          </button>
        ))}
      </div>
      {TABS.map((tab) => (
        <span
          key={tab}
          className={`px-3 py-1 border-t border-x rounded-t-[2px] ${
            tab === active
              ? 'bg-white border-[#8a9aad] font-bold text-[#111]'
              : 'bg-[#d8dde3] border-transparent text-[#555] cursor-default'
          }`}
        >
          {tab}
        </span>
      ))}
    </div>
  )
}
