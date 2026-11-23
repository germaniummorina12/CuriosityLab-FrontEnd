// Real icon images sourced and dropped into /public, wrapped so they drop straight into
// every spot that expects an `icon` component with a `size` prop (DesktopIcon, Window
// title bar, Taskbar, StartMenu). The xp-icon-*.png set are the actual Windows XP Luna
// icon designs (My Computer, Recycle Bin, Paint, Minesweeper, Solitaire, My Documents,
// Control Panel, Help and Support) — local personal-use desktop skin, not redistributed.

function RealIcon({ src, size }) {
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

// Period-accurate "old" Excel file icon (page + mini spreadsheet grid), sourced from
// Wikimedia Commons — replaces a clipart that had the word "Excel" awkwardly baked in.
export function ExcelIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-excel.svg" size={size} />
}

export function InternetExplorerIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-internet-explorer.png" size={size} />
}

// The old (2011) Chrome mark — the clean successor to the original 2008 3D-ball logo,
// closer to the XP era than Google's current flat 2022 redesign. Sourced from Wikimedia
// Commons, tagged there as too simple a geometric shape for copyright.
export function ChromeIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-chrome.png" size={size} />
}

export function RecycleBinIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-recycle-bin.png" size={size} />
}

export function MinesweeperIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-minesweeper.png" size={size} />
}

export function PaintIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-paint.png" size={size} />
}

export function SolitaireIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-solitaire.png" size={size} />
}

export function FreeCellIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-freecell.png" size={size} />
}

export function HeartsIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-hearts.png" size={size} />
}

export function SpiderSolitaireIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-spider-solitaire.png" size={size} />
}

export function VolumeIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-volume.png" size={size} />
}

export function WirelessIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-wireless.png" size={size} />
}

export function SecurityCenterIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-security-center.png" size={size} />
}

export function RestartIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-restart.png" size={size} />
}

// Sourced from RetroBar (github.com/dremin/RetroBar, Apache-2.0) — its actual XP taskbar
// "Show Desktop" quick-launch icon.
export function ShowDesktopIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-show-desktop.png" size={size} />
}

export function MyDocumentsIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-my-documents.png" size={size} />
}

export function ControlPanelIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-control-panel.png" size={size} />
}

export function HelpIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-help.png" size={size} />
}

export function MyComputerIcon({ size = 24 }) {
  return <RealIcon src="/xp-icon-my-computer.png" size={size} />
}

// No real asset for this one — a small drawn recreation of a user account tile icon.
export function UserTileIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="#3f8ae0" stroke="#1941a5" strokeWidth="1" />
      <rect x="3" y="3" width="18" height="9" rx="3" fill="#ffffff" opacity="0.2" />
      <circle cx="12" cy="9.5" r="3.4" fill="#f0dcc0" stroke="#b97a57" strokeWidth="0.6" />
      <path d="M5.5,19.5 Q5.5,13.5 12,13.5 Q18.5,13.5 18.5,19.5 Z" fill="#f0dcc0" stroke="#b97a57" strokeWidth="0.6" />
    </svg>
  )
}
