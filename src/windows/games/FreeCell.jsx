import { useEffect, useState } from 'react'
import { buttonXp, statusBar } from '../../styles/xpTheme'
import { SUITS, RED_SUITS, SUIT_SYMBOL, freshDeck, Card, Slot } from './cardUtils'

const COLS = 8

function deal() {
  const deck = freshDeck().map((c) => ({ ...c, faceUp: true }))
  const tableau = Array.from({ length: COLS }, () => [])
  deck.forEach((card, i) => tableau[i % COLS].push(card))
  return {
    tableau,
    free: [null, null, null, null],
    foundations: { S: [], H: [], D: [], C: [] },
  }
}

const isValidRun = (cards) => {
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i]
    const b = cards[i + 1]
    if (a.rank !== b.rank + 1 || RED_SUITS.has(a.suit) === RED_SUITS.has(b.suit)) return false
  }
  return true
}

const canStackTableau = (moving, destTop) =>
  destTop ? destTop.rank === moving.rank + 1 && RED_SUITS.has(moving.suit) !== RED_SUITS.has(destTop.suit) : true

const canStackFoundation = (card, pile) =>
  pile.length === 0 ? card.rank === 1 : pile[pile.length - 1].suit === card.suit && pile[pile.length - 1].rank === card.rank - 1

function getGroup(state, selected) {
  if (!selected) return null
  if (selected.zone === 'free') {
    const card = state.free[selected.index]
    return card ? [card] : null
  }
  const col = state.tableau[selected.col]
  const group = col.slice(selected.index)
  if (isValidRun(group)) return group
  return selected.index === col.length - 1 ? [col[selected.index]] : null
}

function removeSelectedGroup(state, selected) {
  if (selected.zone === 'free') {
    const free = [...state.free]
    free[selected.index] = null
    return { ...state, free }
  }
  const col = [...state.tableau[selected.col]]
  col.length = selected.index
  const tableau = [...state.tableau]
  tableau[selected.col] = col
  return { ...state, tableau }
}

export default function FreeCell() {
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

  const toggleSelect = (next) => {
    setSelected((prev) =>
      prev && prev.zone === next.zone && prev.col === next.col && prev.index === next.index ? null : next,
    )
  }

  const capacityFor = (destIsEmptyTableau) => {
    const emptyFree = state.free.filter((f) => f === null).length
    const emptyCols = state.tableau.filter((c) => c.length === 0).length - (destIsEmptyTableau ? 1 : 0)
    return (emptyFree + 1) * Math.pow(2, Math.max(emptyCols, 0))
  }

  const onFreeCardClick = (index) => {
    if (!selected) {
      if (!state.free[index]) return
      toggleSelect({ zone: 'free', index })
      return
    }
    attemptMoveToFree(index)
  }

  const onTableauCardClick = (col, index) => {
    if (!selected) {
      toggleSelect({ zone: 'tableau', col, index })
      return
    }
    attemptMoveToTableau(col)
  }

  const onTableauEmptyClick = (col) => {
    if (!selected) return
    attemptMoveToTableau(col)
  }

  const attemptMoveToFree = (index) => {
    setState((s) => {
      if (s.free[index]) return s
      const group = getGroup(s, selected)
      if (!group || group.length !== 1) return s
      const afterRemove = removeSelectedGroup(s, selected)
      const free = [...afterRemove.free]
      free[index] = group[0]
      return { ...afterRemove, free }
    })
    setSelected(null)
  }

  const attemptMoveToTableau = (destCol) => {
    setState((s) => {
      const group = getGroup(s, selected)
      if (!group) return s
      if (selected.zone === 'tableau' && selected.col === destCol) return s
      const destColumn = s.tableau[destCol]
      const destTop = destColumn[destColumn.length - 1]
      if (!canStackTableau(group[0], destTop)) return s
      const cap = capacityFor(destColumn.length === 0)
      if (group.length > cap) return s
      const afterRemove = removeSelectedGroup(s, selected)
      const tableau = [...afterRemove.tableau]
      tableau[destCol] = [...tableau[destCol], ...group]
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

  const autoFoundation = (zone, col, index) => {
    setState((s) => {
      const card = zone === 'free' ? s.free[index] : s.tableau[col][s.tableau[col].length - 1]
      if (!card || !canStackFoundation(card, s.foundations[card.suit])) return s
      const sel = zone === 'free' ? { zone: 'free', index } : { zone: 'tableau', col, index: s.tableau[col].length - 1 }
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
        {state.free.map((card, i) => (
          <Slot key={i} onClick={() => onFreeCardClick(i)}>
            {card ? (
              <Card
                card={card}
                selected={selected?.zone === 'free' && selected.index === i}
                onClick={() => onFreeCardClick(i)}
                onDoubleClick={() => autoFoundation('free', null, i)}
              />
            ) : null}
          </Slot>
        ))}
        <div className="flex-1" />
        {SUITS.map((suit) => (
          <Slot key={suit} placeholder={SUIT_SYMBOL[suit]} onClick={() => attemptMoveToFoundation(suit)}>
            {state.foundations[suit].length > 0 ? <Card card={state.foundations[suit][state.foundations[suit].length - 1]} /> : null}
          </Slot>
        ))}
      </div>

      <div className="flex-1 flex items-start gap-1.5">
        {state.tableau.map((col, colIndex) => (
          <div key={colIndex} className="relative w-[42px]" style={{ height: 58 + Math.max(col.length - 1, 0) * 16 + 20 }}>
            <div className="absolute inset-0" onClick={() => onTableauEmptyClick(colIndex)} />
            {col.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                top={index * 16}
                selected={selected?.zone === 'tableau' && selected.col === colIndex && index >= selected.index}
                onClick={() => onTableauCardClick(colIndex, index)}
                onDoubleClick={() => (index === col.length - 1 ? autoFoundation('tableau', colIndex) : undefined)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={statusBar}>Click a card to select it, then click a pile to move it. Any card may start an empty column.</div>
    </div>
  )
}
