import { useEffect, useState } from 'react'
import { buttonXp, statusBar } from '../../styles/xpTheme'
import { SUITS, RED_SUITS, SUIT_SYMBOL, freshDeck, Card, Slot } from './cardUtils'

function deal() {
  const deck = freshDeck()
  const tableau = []
  for (let col = 0; col < 7; col++) {
    const cards = []
    for (let i = 0; i <= col; i++) {
      const card = deck.pop()
      cards.push({ ...card, faceUp: i === col })
    }
    tableau.push(cards)
  }
  return {
    tableau,
    stock: deck.map((c) => ({ ...c, faceUp: false })),
    waste: [],
    foundations: { S: [], H: [], D: [], C: [] },
  }
}

const canStackTableau = (moving, destTop) =>
  destTop
    ? destTop.faceUp && destTop.rank === moving.rank + 1 && RED_SUITS.has(moving.suit) !== RED_SUITS.has(destTop.suit)
    : moving.rank === 13

const canStackFoundation = (card, pile) =>
  pile.length === 0 ? card.rank === 1 : pile[pile.length - 1].suit === card.suit && pile[pile.length - 1].rank === card.rank - 1

function removeSelectedGroup(state, selected) {
  if (selected.zone === 'waste') return { ...state, waste: state.waste.slice(0, -1) }
  const col = [...state.tableau[selected.col]]
  col.length = selected.index
  if (col.length > 0 && !col[col.length - 1].faceUp) col[col.length - 1] = { ...col[col.length - 1], faceUp: true }
  const tableau = [...state.tableau]
  tableau[selected.col] = col
  return { ...state, tableau }
}

function getGroup(state, selected) {
  if (!selected) return null
  if (selected.zone === 'waste') {
    const card = state.waste[state.waste.length - 1]
    return card ? [card] : null
  }
  return state.tableau[selected.col].slice(selected.index)
}

export default function Solitaire() {
  const [state, setState] = useState(() => deal())
  const [selected, setSelected] = useState(null)
  const [won, setWon] = useState(false)

  useEffect(() => {
    const total = SUITS.reduce((n, s) => n + state.foundations[s].length, 0)
    setWon(total === 52)
  }, [state])

  const newGame = () => {
    setState(deal())
    setSelected(null)
    setWon(false)
  }

  const onStockClick = () => {
    setState((s) => {
      if (s.stock.length > 0) {
        const next = [...s.stock]
        const card = { ...next.pop(), faceUp: true }
        return { ...s, stock: next, waste: [...s.waste, card] }
      }
      if (s.waste.length > 0) {
        return { ...s, stock: [...s.waste].reverse().map((c) => ({ ...c, faceUp: false })), waste: [] }
      }
      return s
    })
    setSelected(null)
  }

  const toggleSelect = (next) => {
    setSelected((prev) =>
      prev && prev.zone === next.zone && prev.col === next.col && prev.index === next.index ? null : next,
    )
  }

  const onWasteCardClick = () => {
    if (state.waste.length === 0) return
    toggleSelect({ zone: 'waste' })
  }

  const onTableauCardClick = (col, index) => {
    const card = state.tableau[col][index]
    if (!selected) {
      if (!card.faceUp) return
      toggleSelect({ zone: 'tableau', col, index })
      return
    }
    attemptMoveToTableau(col)
  }

  const onTableauEmptyClick = (col) => {
    if (!selected) return
    attemptMoveToTableau(col)
  }

  const attemptMoveToTableau = (destCol) => {
    setState((s) => {
      const group = getGroup(s, selected)
      if (!group) return s
      if (selected.zone === 'tableau' && selected.col === destCol) return s
      const destColumn = s.tableau[destCol]
      const destTop = destColumn[destColumn.length - 1]
      if (!canStackTableau(group[0], destTop)) return s
      const afterRemove = removeSelectedGroup(s, selected)
      const tableau = [...afterRemove.tableau]
      tableau[destCol] = [...tableau[destCol], ...group.map((c) => ({ ...c, faceUp: true }))]
      return { ...afterRemove, tableau }
    })
    setSelected(null)
  }

  const attemptMoveToFoundation = (suit) => {
    setState((s) => {
      const group = getGroup(s, selected)
      if (!group || group.length !== 1) return s
      const card = group[0]
      if (card.suit !== suit || !canStackFoundation(card, s.foundations[suit])) return s
      const afterRemove = removeSelectedGroup(s, selected)
      return { ...afterRemove, foundations: { ...afterRemove.foundations, [suit]: [...afterRemove.foundations[suit], card] } }
    })
    setSelected(null)
  }

  const autoFoundation = (zone, col) => {
    setState((s) => {
      const column = zone === 'tableau' ? s.tableau[col] : null
      const card = zone === 'waste' ? s.waste[s.waste.length - 1] : column[column.length - 1]
      if (!card || !card.faceUp || !canStackFoundation(card, s.foundations[card.suit])) return s
      const sel = zone === 'waste' ? { zone: 'waste' } : { zone: 'tableau', col, index: column.length - 1 }
      const afterRemove = removeSelectedGroup(s, sel)
      return { ...afterRemove, foundations: { ...afterRemove.foundations, [card.suit]: [...afterRemove.foundations[card.suit], card] } }
    })
    setSelected(null)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 -m-2 p-2 bg-[#1f7a2e]">
      <div className="flex items-center justify-between">
        <button className={`${buttonXp} text-[11px] px-2 py-0.5`} onClick={newGame}>
          New Game
        </button>
        {won ? <span className="text-white font-bold text-[13px]">You win!</span> : null}
      </div>

      <div className="flex items-start gap-2">
        <Slot onClick={onStockClick}>
          {state.stock.length > 0 ? (
            <Card card={state.stock[state.stock.length - 1]} top={0} onClick={onStockClick} />
          ) : null}
        </Slot>
        <Slot placeholder="">
          {state.waste.length > 0 ? (
            <Card
              card={state.waste[state.waste.length - 1]}
              top={0}
              selected={selected?.zone === 'waste'}
              onClick={onWasteCardClick}
              onDoubleClick={() => autoFoundation('waste')}
            />
          ) : null}
        </Slot>
        <div className="flex-1" />
        {SUITS.map((suit) => (
          <Slot key={suit} placeholder={SUIT_SYMBOL[suit]} onClick={() => attemptMoveToFoundation(suit)}>
            {state.foundations[suit].length > 0 ? (
              <Card card={state.foundations[suit][state.foundations[suit].length - 1]} top={0} />
            ) : null}
          </Slot>
        ))}
      </div>

      <div className="flex-1 flex items-start gap-2">
        {state.tableau.map((col, colIndex) => (
          <div key={colIndex} className="relative w-[42px]" style={{ height: 58 + Math.max(col.length - 1, 0) * 18 + 20 }}>
            <div className="absolute inset-0" onClick={() => onTableauEmptyClick(colIndex)} />
            {col.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                top={index * 18}
                selected={selected?.zone === 'tableau' && selected.col === colIndex && index >= selected.index}
                onClick={() => onTableauCardClick(colIndex, index)}
                onDoubleClick={() => (index === col.length - 1 ? autoFoundation('tableau', colIndex) : undefined)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={statusBar}>Click a card to select it, then click a pile to move it. Double-click sends a card home.</div>
    </div>
  )
}
