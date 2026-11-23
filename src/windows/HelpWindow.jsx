import { sectionGroove, statusBar } from '../styles/xpTheme'

const TOPICS = [
  { q: 'How do I open something?', a: 'Double-click an icon on the desktop, or click Start and choose it from the menu.' },
  { q: 'How do I move a window?', a: 'Drag it by its blue title bar. Double-click the title bar to maximize or restore it.' },
  { q: 'I deleted something by mistake.', a: 'Open the Recycle Bin on the desktop — deleted records can be restored from there.' },
  { q: 'How do I play Minesweeper?', a: 'Left-click to reveal a square, right-click to flag a suspected mine. Pick a difficulty above the board.' },
  { q: 'How do I play Solitaire, FreeCell, or Spider Solitaire?', a: 'Click a card to select it, then click the pile you want to move it to. Double-click sends an eligible card straight to its foundation.' },
  { q: 'How do I play Hearts?', a: 'It’s your turn whenever the status bar says so — click a card to play it. Avoid taking hearts and the Q♠ unless you’re going for the moon.' },
  { q: 'A website shows an error page.', a: "Some sites (Google, Bing, YouTube, ...) block being shown inside another page — that's the site's own setting, not a bug here." },
]

export default function HelpWindow() {
  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-auto">
      <p className="text-[13px] font-bold text-[#1941a5]">CuriosityLab Help and Support</p>
      <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
        {TOPICS.map((t) => (
          <div key={t.q} className="px-3 py-2 border-b border-[#e3e1d6] last:border-b-0">
            <p className="text-[12px] font-bold text-[#111]">{t.q}</p>
            <p className="text-[11px] text-[#444] mt-0.5">{t.a}</p>
          </div>
        ))}
      </div>
      <div className={statusBar}>CuriosityLab Desktop — built with React, Tailwind, and a lot of patience</div>
    </div>
  )
}
