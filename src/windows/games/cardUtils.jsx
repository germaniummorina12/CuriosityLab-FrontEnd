export const SUITS = ['S', 'H', 'D', 'C']
export const RED_SUITS = new Set(['H', 'D'])
export const SUIT_SYMBOL = { S: '♠', H: '♥', D: '♦', C: '♣' }
const RANK_LABEL = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
export const rankLabel = (r) => RANK_LABEL[r] || String(r)

export function freshDeck(deckCount = 1) {
  const deck = []
  for (let d = 0; d < deckCount; d++) {
    for (const suit of SUITS) {
      for (let rank = 1; rank <= 13; rank++) deck.push({ suit, rank, id: `${suit}${rank}-${d}` })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function Card({ card, top = 0, left = 0, onClick, onDoubleClick, selected }) {
  const isRed = RED_SUITS.has(card.suit)
  return (
    <button
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`absolute w-[42px] h-[58px] rounded-[3px] text-left ${
        card.faceUp
          ? `bg-white border ${selected ? 'border-[#2a6fe0] shadow-[0_0_0_2px_#2a6fe0]' : 'border-[#555]'}`
          : 'bg-[#1941a5] border border-[#0a2a80]'
      }`}
      style={{ top, left }}
    >
      {card.faceUp ? (
        <div className={`px-1 pt-0.5 leading-none font-bold ${isRed ? 'text-[#c00000]' : 'text-[#111]'}`}>
          <div className="text-[11px]">{rankLabel(card.rank)}</div>
          <div className="text-[14px]">{SUIT_SYMBOL[card.suit]}</div>
        </div>
      ) : (
        <div className="w-full h-full rounded-[2px] bg-[repeating-linear-gradient(45deg,#1941a5,#1941a5_4px,#2a5ad1_4px,#2a5ad1_8px)]" />
      )}
    </button>
  )
}

export function Slot({ children, onClick, placeholder }) {
  return (
    <div onClick={onClick} className="relative w-[42px] h-[58px] rounded-[3px] border border-white/30 shrink-0">
      {!children && placeholder ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-[16px]">{placeholder}</div>
      ) : null}
      {children}
    </div>
  )
}
