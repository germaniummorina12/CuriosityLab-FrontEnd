// Shared Tailwind utility strings for the Windows XP "Luna" look.
// No .css rules are authored anywhere — everything here is still plain Tailwind classes,
// just centralized so the chrome stays identical across windows/buttons/inputs.

export const windowFrame =
  'rounded-[8px] border border-[#0831d9] shadow-[2px_3px_10px_rgba(0,0,0,0.5)] overflow-hidden bg-[#ece9d8]'

export const titleBarActive =
  'bg-gradient-to-b from-[#2a6fe0] via-[#1e5adf] to-[#1941a5] text-white'

export const titleBarInactive =
  'bg-gradient-to-b from-[#9db3d6] via-[#8aa0c7] to-[#7488ab] text-[#e4e9f5]'

export const titleBarButton =
  'w-[21px] h-[19px] flex items-center justify-center rounded-[3px] border border-[#1941a5] bg-gradient-to-b from-[#5a92ec] to-[#2a5ad1] text-white shadow-inner active:from-[#2a5ad1] active:to-[#5a92ec]'

export const titleBarCloseButton =
  'w-[21px] h-[19px] flex items-center justify-center rounded-[3px] border border-[#8a1a1a] bg-gradient-to-b from-[#f08a7a] to-[#d33b1f] text-white shadow-inner active:from-[#d33b1f] active:to-[#f08a7a]'

export const panelInset =
  'bg-white border border-[#7f9db9] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.25)]'

export const fieldInset =
  'bg-white border border-[#7f9db9] shadow-[inset_1px_1px_1px_rgba(0,0,0,0.3)] rounded-[2px] px-2 py-1 text-[13px] text-[#111] focus:outline-none focus:border-[#2a5ad1]'

export const buttonXp =
  'rounded-[3px] border border-[#716f64] bg-gradient-to-b from-white via-[#ece9d8] to-[#cfc9b4] text-[13px] text-[#111] px-3 py-1 shadow-[1px_1px_1px_rgba(0,0,0,0.2)] hover:from-[#fff8e0] hover:to-[#f0e6c0] active:from-[#cfc9b4] active:to-white disabled:opacity-50 disabled:cursor-not-allowed'

export const buttonPrimary =
  'rounded-[3px] border border-[#0a3d8f] bg-gradient-to-b from-[#6fa6f0] via-[#2a6fe0] to-[#1941a5] text-[13px] font-semibold text-white px-4 py-1.5 shadow-[1px_1px_1px_rgba(0,0,0,0.3)] hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed'

export const sectionGroove =
  'border border-[#a6a28c] bg-[#f7f6ef] rounded-[4px]'

export const statusBar =
  'bg-[#ece9d8] border-t border-white/60 text-[11px] text-[#333] px-2 py-1'
