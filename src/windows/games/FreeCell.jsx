import { useEffect, useState } from 'react'
import { buttonXp, statusBar } from '../../styles/xpTheme'
import { SUITS, RED_SUITS, SUIT_SYMBOL, freshDeck, Card, Slot, CARD_W, CARD_H } from './cardUtils'
import { XpMenuBar } from '../../components/desktop/XpMenuBar'
import { useWindowManager } from '../../context/WindowManagerContext'

const COLS = 8
const STACK_OFFSET = 26

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

export default function FreeCell({ windowId }) {
  const { closeWindow } = useWindowManager()
  const [state, setState] = useState(() => deal())
  const [selected, setSelected] = useState(null)
  const [won, setWon] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [dropTarget, setDropTarget] = useState(null) // { zone, col } | { zone: 'free', index } | { zone: 'foundation', suit }

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

  const onCardDragStart = (zone, col, index) => (e) => {
    setSelected({ zone, col, index })
    e.dataTransfer.effectAllowed = 'move'
  }

  const onCardDragEnd = () => {
    setSelected(null)
    setDropTarget(null)
  }

  const dragOverHandler = (target) => (e) => {
    e.preventDefault()
    setDropTarget(target)
  }

  const dragLeaveHandler = (target) => () => {
    setDropTarget((t) => (t && t.zone === target.zone && t.col === target.col && t.suit === target.suit && t.index === target.index ? null : t))
  }

  const onFreeDrop = (index) => (e) => {
    e.preventDefault()
    setDropTarget(null)
    if (selected) attemptMoveToFree(index)
  }

  const onFoundationDrop = (suit) => (e) => {
    e.preventDefault()
    setDropTarget(null)
    if (selected) attemptMoveToFoundation(suit)
  }

  const onTableauDrop = (col) => (e) => {
    e.preventDefault()
    setDropTarget(null)
    if (selected) attemptMoveToTableau(col)
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

  const menus = {
    Game: [
      { label: 'New Game', onClick: newGame },
      { divider: true },
      { label: 'Exit', onClick: () => windowId && closeWindow(windowId) },
    ],
    Help: [{ label: 'About FreeCell', onClick: () => setAboutOpen(true) }],
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col -m-2">
      <XpMenuBar menus={menus} />
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2 bg-[#1f7a2e]">
      <div className="flex items-center justify-between">
        <button className={`${buttonXp} text-[11px] px-2 py-0.5`} onClick={newGame}>
          New Game
        </button>
        {won ? <span className="text-white font-bold text-[13px]">You win!</span> : null}
      </div>

      <div className="flex items-start gap-2">
        {state.free.map((card, i) => (
          <Slot
            key={i}
            onClick={() => onFreeCardClick(i)}
            onDragOver={dragOverHandler({ zone: 'free', index: i })}
            onDragLeave={dragLeaveHandler({ zone: 'free', index: i })}
            onDrop={onFreeDrop(i)}
            dropTarget={dropTarget?.zone === 'free' && dropTarget.index === i}
          >
            {card ? (
              <Card
                card={card}
                draggable
                dragging={selected?.zone === 'free' && selected.index === i}
                selected={selected?.zone === 'free' && selected.index === i}
                onClick={() => onFreeCardClick(i)}
                onDoubleClick={() => autoFoundation('free', null, i)}
                onDragStart={onCardDragStart('free', null, i)}
                onDragEnd={onCardDragEnd}
              />
            ) : null}
          </Slot>
        ))}
        <div className="flex-1" />
        {SUITS.map((suit) => (
          <Slot
            key={suit}
            placeholder={SUIT_SYMBOL[suit]}
            onClick={() => attemptMoveToFoundation(suit)}
            onDragOver={dragOverHandler({ zone: 'foundation', suit })}
            onDragLeave={dragLeaveHandler({ zone: 'foundation', suit })}
            onDrop={onFoundationDrop(suit)}
            dropTarget={dropTarget?.zone === 'foundation' && dropTarget.suit === suit}
          >
            {state.foundations[suit].length > 0 ? <Card card={state.foundations[suit][state.foundations[suit].length - 1]} /> : null}
          </Slot>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex items-start gap-1.5">
          {state.tableau.map((col, colIndex) => (
            <div
              key={colIndex}
              className={`relative rounded-[3px] transition-colors ${
                dropTarget?.zone === 'tableau' && dropTarget.col === colIndex
                  ? 'bg-white/15 outline outline-2 outline-dashed outline-white/60'
                  : ''
              }`}
              style={{ width: CARD_W, height: CARD_H + Math.max(col.length - 1, 0) * STACK_OFFSET + 20 }}
              onDragOver={dragOverHandler({ zone: 'tableau', col: colIndex })}
              onDragLeave={dragLeaveHandler({ zone: 'tableau', col: colIndex })}
              onDrop={onTableauDrop(colIndex)}
            >
              <div className="absolute inset-0" onClick={() => onTableauEmptyClick(colIndex)} />
              {col.map((card, index) => (
                <Card
                  key={card.id}
                  card={card}
                  top={index * STACK_OFFSET}
                  draggable
                  dragging={selected?.zone === 'tableau' && selected.col === colIndex && index >= selected.index}
                  selected={selected?.zone === 'tableau' && selected.col === colIndex && index >= selected.index}
                  onClick={() => onTableauCardClick(colIndex, index)}
                  onDoubleClick={() => (index === col.length - 1 ? autoFoundation('tableau', colIndex) : undefined)}
                  onDragStart={onCardDragStart('tableau', colIndex, index)}
                  onDragEnd={onCardDragEnd}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={statusBar}>Click a card to select it, then click a pile to move it. Any card may start an empty column.</div>
      </div>

      {aboutOpen ? (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setAboutOpen(false)}>
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-4 text-[12px] text-[#111] w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">FreeCell</p>
            <p className="mb-3">Move every card to a foundation using the four free cells to park cards temporarily.</p>
            <button
              onClick={() => setAboutOpen(false)}
              className="px-3 py-0.5 bg-[#ece9d8] border-t-white border-l-white border-b-[#716f64] border-r-[#716f64] border"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
