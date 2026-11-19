export default function DesktopIcon({ icon: Icon, label, onOpen, size = 48 }) {
  return (
    <button
      onDoubleClick={onOpen}
      className="w-[92px] flex flex-col items-center gap-1 p-1.5 rounded-[2px] text-white hover:bg-white/15 focus:bg-[#3a6ea5]/50 focus:outline focus:outline-1 focus:outline-dashed focus:outline-white"
    >
      <span className="w-14 h-14 flex items-center justify-center drop-shadow-[1px_2px_3px_rgba(0,0,0,0.6)]">
        <Icon size={size} />
      </span>
      <span className="text-[12px] leading-tight text-center drop-shadow-[1px_1px_1px_rgba(0,0,0,0.9)]">
        {label}
      </span>
    </button>
  )
}
