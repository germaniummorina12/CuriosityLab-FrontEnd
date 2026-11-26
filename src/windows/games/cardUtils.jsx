export const SUITS = ['S', 'H', 'D', 'C']
export const RED_SUITS = new Set(['H', 'D'])
export const SUIT_SYMBOL = { S: '♠', H: '♥', D: '♦', C: '♣' }
const RANK_LABEL = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' }
export const rankLabel = (r) => RANK_LABEL[r] || String(r)

// Shared card footprint for every tableau-style game (Solitaire, FreeCell, Spider
// Solitaire) — big enough that a stacked card's corner pip stays fully readable.
export const CARD_W = 54
export const CARD_H = 76

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

export function Card({
  card,
  top = 0,
  left = 0,
  onClick,
  onDoubleClick,
  selected,
  draggable = false,
  dragging = false,
  onDragStart,
  onDragEnd,
}) {
  const isRed = RED_SUITS.has(card.suit)
  return (
    <button
      draggable={draggable && card.faceUp}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={{ top, left, width: CARD_W, height: CARD_H }}
      className={`absolute rounded-[4px] text-left transition-[top,left] duration-150 ease-out ${
        dragging ? 'opacity-40' : ''
      } ${
        card.faceUp
          ? `bg-white border ${selected ? 'border-[#2a6fe0] shadow-[0_0_0_2px_#2a6fe0]' : 'border-[#555]'} ${
              draggable ? 'cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-md' : ''
            }`
          : 'bg-[#1941a5] border border-[#0a2a80]'
      }`}
    >
      {card.faceUp ? (
        <div
          className={`absolute font-bold ${isRed ? 'text-[#c00000]' : 'text-[#111]'}`}
          style={{ top: 2, left: 5, lineHeight: 1 }}
        >
          <div style={{ fontSize: 13 }}>{rankLabel(card.rank)}</div>
          <div style={{ fontSize: 16, marginTop: 1 }}>{SUIT_SYMBOL[card.suit]}</div>
        </div>
      ) : (
        <div className="w-full h-full rounded-[3px] bg-[repeating-linear-gradient(45deg,#1941a5,#1941a5_4px,#2a5ad1_4px,#2a5ad1_8px)]" />
      )}
    </button>
  )
}

export function Slot({ children, onClick, placeholder, onDragOver, onDragLeave, onDrop, dropTarget = false }) {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative rounded-[4px] border shrink-0 transition-colors ${
        dropTarget ? 'border-dashed border-2 border-white/80 bg-white/15' : 'border-white/30'
      }`}
      style={{ width: CARD_W, height: CARD_H }}
    >
      {!children && placeholder ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-[20px]">{placeholder}</div>
      ) : null}
      {children}
    </div>
  )
}
