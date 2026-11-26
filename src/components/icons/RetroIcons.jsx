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

// Real XP's "Wireless Network Connection" tray icon is a small grey monitor
// glyph with blue/white signal-strength arcs fanning off its top-left corner —
// not a generic black Wi-Fi glyph (which is what the old sourced PNG actually
// was). Redrawn by hand to match real screenshots of the genuine icon.
export function WirelessIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M9 3.2 A 10 10 0 0 1 20.8 15"
        fill="none"
        stroke="#bcd9f7"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M9.4 6.9 A 6.6 6.6 0 0 1 17.1 14.6"
        fill="none"
        stroke="#6fa8e8"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9.8 10.6 A 3.2 3.2 0 0 1 13.4 14.2"
        fill="none"
        stroke="#2f6fd6"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="4" y="11" width="15" height="10" rx="1" fill="#e7ecf2" stroke="#7a828c" strokeWidth="0.8" />
      <rect x="5.2" y="12.1" width="12.6" height="7.3" rx="0.4" fill="#2f6fb5" />
      <rect x="9" y="21" width="6" height="1.4" rx="0.3" fill="#9aa2ab" />
    </svg>
  )
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
