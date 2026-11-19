// Real icon images the user sourced and dropped into /public, cleaned up (backgrounds
// removed) and wrapped so they drop straight into every spot that expects an
// `icon` component with a `size` prop (DesktopIcon, Window title bar, Taskbar, StartMenu).

export function ExcelIcon({ size = 24 }) {
  return (
    <img
      src="/png-clipart-windows-live-for-xp-green-excel-icon-thumbnail.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function InternetExplorerIcon({ size = 24 }) {
  return (
    <img
      src="/134-1340344_internet-explorer-logo-png-transparent-png.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function ChromeIcon({ size = 24 }) {
  return (
    <img
      src="/9075188-middle.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function RecycleBinIcon({ size = 24 }) {
  return (
    <img
      src="/tumblr_65ffde9d8c5c2982d55440a6fc242a91_78f19184_540.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

export function MinesweeperIcon({ size = 24 }) {
  return (
    <img
      src="/tumblr_a37de7520c46fc1ce62d94a79bc66d6c_fe69745e_540.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}

// No real asset for this one — a small drawn recreation of the classic green Snake icon.
export function SnakeIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        d="M4 6c0-1.7 1.3-3 3-3s3 1.3 3 3v9c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2H8"
        fill="none"
        stroke="#1f7a2e"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M4 6c0-1.7 1.3-3 3-3s3 1.3 3 3v9c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2H8"
        fill="none"
        stroke="#4a9a2e"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="7" cy="6" r="3.4" fill="#4a9a2e" stroke="#1f7a2e" strokeWidth="1" />
      <circle cx="6" cy="5" r="0.7" fill="#0a0a0a" />
      <circle cx="8" cy="5" r="0.7" fill="#0a0a0a" />
    </svg>
  )
}

export function MyComputerIcon({ size = 24 }) {
  return (
    <img
      src="/tumblr_b25bfc3736abbeabd446a2ac7d495fe5_aec0adab_1280.png"
      alt=""
      width={size}
      height={size}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  )
}
