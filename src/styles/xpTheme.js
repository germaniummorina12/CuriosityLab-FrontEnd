// Shared Tailwind utility strings for the Windows XP "Luna" look.
// No .css rules are authored anywhere — everything here is still plain Tailwind classes,
// just centralized so the chrome stays identical across windows/buttons/inputs.
// Title bar / taskbar gradient stops are lifted from the real Luna theme's color ramp
// (an 8-stop gradient, not a simple 3-stop fade) so the "glass" sheen reads correctly.

export const windowFrameBase = 'overflow-hidden bg-[#ece9d8]'

// XP only rounds a window's top corners, and dims the border when it isn't the focused window.
export const windowBorderActive =
  'border border-[#0831d9] shadow-[2px_3px_10px_rgba(0,0,0,0.5)]'

export const windowBorderInactive =
  'border border-[#7f9db9] shadow-[2px_3px_8px_rgba(0,0,0,0.3)]'

export const titleBarActive =
  'bg-[linear-gradient(180deg,#0997ff_0%,#0053ee_8%,#0050ee_40%,#0066ff_88%,#0066ff_93%,#005bff_95%,#003dd7_96%,#003dd7_100%)] text-white'

export const titleBarInactive =
  'bg-[linear-gradient(180deg,#7a96df_0%,#88a2e3_8%,#839ddf_40%,#839ddf_88%,#839ddf_93%,#7b96de_95%,#7b96de_96%,#7b96de_100%)] text-[#e4e9f5]'

export const titleBarButton =
  'w-[21px] h-[19px] flex items-center justify-center rounded-[3px] border border-[#1941a5] bg-[linear-gradient(180deg,#8fc1f5_0%,#4a84e0_8%,#2a5ad1_50%,#1941a5_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] active:brightness-90 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]'

export const titleBarCloseButton =
  'w-[21px] h-[19px] flex items-center justify-center rounded-[3px] border border-[#8a1a1a] bg-[linear-gradient(180deg,#ff9a85_0%,#f0493a_8%,#d33b1f_50%,#a01a0a_100%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] active:brightness-90 active:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]'

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
