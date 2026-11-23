import { useState } from 'react'
import { buttonXp, statusBar } from '../../styles/xpTheme'
import { Card } from './cardUtils'

const COLS = 10
const SUIT_SETS = { 1: ['S'], 2: ['S', 'H'], 4: ['S', 'H', 'D', 'C'] }

function buildDeck(suitCount) {
  const suits = SUIT_SETS[suitCount]
  const copiesPerSuitRank = 8 / suitCount // always totals 104 cards
  const deck = []
  let uid = 0
  for (const suit of suits) {
    for (let rank = 1; rank <= 13; rank++) {
      for (let c = 0; c < copiesPerSuitRank; c++) deck.push({ suit, rank, id: `${suit}${rank}-${uid++}` })
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

function deal(suitCount) {
  const deck = buildDeck(suitCount)
  const tableau = Array.from({ length: COLS }, () => [])
  for (let col = 0; col < COLS; col++) {
    const count = col < 4 ? 6 : 5
    for (let i = 0; i < count; i++) {
      const card = deck.pop()
      tableau[col].push({ ...card, faceUp: i === count - 1 })
    }
  }
  return { tableau, stock: deck, completed: 0 }
}

const isValidRun = (cards) => {
  for (let i = 0; i < cards.length - 1; i++) {
    const a = cards[i]
    const b = cards[i + 1]
    if (a.suit !== b.suit || a.rank !== b.rank + 1) return false
  }
  return true
}

function extractCompletedRun(column) {
  if (column.length < 13) return null
  const tail = column.slice(-13)
  if (tail[0].rank !== 13) return null
  if (!isValidRun(tail)) return null
  return column.slice(0, -13)
}

export default function SpiderSolitaire() {
  const [suitCount, setSuitCount] = useState(2)
  const [state, setState] = useState(() => deal(2))
  const [selected, setSelected] = useState(null)

  const newGame = (count = suitCount) => {
    setSuitCount(count)
    setState(deal(count))
    setSelected(null)
  }

  const getGroup = (s, sel) => {
    const col = s.tableau[sel.col]
    const group = col.slice(sel.index)
    if (isValidRun(group)) return group
    return sel.index === col.length - 1 ? [col[sel.index]] : null
  }

  const dealFromStock = () => {
    setState((s) => {
      if (s.stock.length === 0) return s
      if (s.tableau.some((c) => c.length === 0)) return s
      const stock = [...s.stock]
      const tableau = s.tableau.map((col) => {
        const card = { ...stock.pop(), faceUp: true }
        return [...col, card]
      })
      return { ...s, stock, tableau }
    })
    setSelected(null)
  }

  const onCardClick = (col, index) => {
    if (!selected) {
      if (!state.tableau[col][index].faceUp) return
      setSelected((prev) =>
        prev && prev.col === col && prev.index === index ? null : { col, index },
      )
      return
    }
    attemptMove(col)
  }

  const onEmptyClick = (col) => {
    if (!selected) return
    attemptMove(col)
  }

  const attemptMove = (destCol) => {
    setState((s) => {
      const group = getGroup(s, selected)
      if (!group) return s
      if (selected.col === destCol) return s
      const destColumn = s.tableau[destCol]
      const destTop = destColumn[destColumn.length - 1]
      if (destTop && destTop.rank !== group[0].rank + 1) return s
      const srcCol = [...s.tableau[selected.col]]
      srcCol.length = selected.index
      if (srcCol.length > 0 && !srcCol[srcCol.length - 1].faceUp) {
        srcCol[srcCol.length - 1] = { ...srcCol[srcCol.length - 1], faceUp: true }
      }
      let newDestCol = [...destColumn, ...group]
      let completedDelta = 0
      const remaining = extractCompletedRun(newDestCol)
      if (remaining) {
        newDestCol = remaining
        completedDelta = 1
        if (newDestCol.length > 0 && !newDestCol[newDestCol.length - 1].faceUp) {
          newDestCol[newDestCol.length - 1] = { ...newDestCol[newDestCol.length - 1], faceUp: true }
        }
      }
      const tableau = [...s.tableau]
      tableau[selected.col] = srcCol
      tableau[destCol] = newDestCol
      return { ...s, tableau, completed: s.completed + completedDelta }
    })
    setSelected(null)
  }

  const won = state.completed === 8

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 -m-2 p-2 bg-[#1f7a2e]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1, 2, 4].map((n) => (
            <button
              key={n}
              className={`${buttonXp} text-[11px] px-2 py-0.5 ${suitCount === n ? 'brightness-90' : ''}`}
              onClick={() => newGame(n)}
            >
              {n} suit{n > 1 ? 's' : ''}
            </button>
          ))}
        </div>
        <span className="text-white text-[12px] font-bold">Completed: {state.completed}/8</span>
      </div>

      <div className="flex items-center gap-2">
        <div
          onClick={dealFromStock}
          className="w-[42px] h-[58px] rounded-[3px] border border-white/30 cursor-pointer flex items-center justify-center"
        >
          {state.stock.length > 0 ? (
            <div className="w-full h-full rounded-[2px] bg-[repeating-linear-gradient(45deg,#1941a5,#1941a5_4px,#2a5ad1_4px,#2a5ad1_8px)]" />
          ) : null}
        </div>
        <span className="text-white text-[11px]">{Math.floor(state.stock.length / 10)} deals left</span>
        {won ? <span className="text-white font-bold text-[13px] ml-auto">You win!</span> : null}
      </div>

      <div className="flex-1 flex items-start gap-1">
        {state.tableau.map((col, colIndex) => (
          <div key={colIndex} className="relative w-[42px]" style={{ height: 58 + Math.max(col.length - 1, 0) * 15 + 20 }}>
            <div className="absolute inset-0" onClick={() => onEmptyClick(colIndex)} />
            {col.map((card, index) => (
              <Card
                key={card.id}
                card={card}
                top={index * 15}
                selected={selected?.col === colIndex && index >= selected.index}
                onClick={() => onCardClick(colIndex, index)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={statusBar}>Build down regardless of suit; only same-suit runs move together. Complete K→A in one suit to clear it.</div>
    </div>
  )
}
