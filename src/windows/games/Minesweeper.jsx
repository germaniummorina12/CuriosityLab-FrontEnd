import { useEffect, useMemo, useState } from 'react'
import { buttonXp } from '../../styles/xpTheme'
import { useWindowManager } from '../../context/WindowManagerContext'

const CELL_PX = 22
const CHROME_W = 20 // window borders/padding outside the grid
const CHROME_H = 110 // toolbar + status row + window chrome above/below the grid

const DIFFICULTIES = {
  beginner: { label: 'Beginner', rows: 9, cols: 9, mines: 10 },
  intermediate: { label: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  expert: { label: 'Expert', rows: 16, cols: 30, mines: 99 },
}

function buildBoard(rows, cols, mines, safeIndex) {
  const total = rows * cols
  const mineSet = new Set()
  while (mineSet.size < mines) {
    const idx = Math.floor(Math.random() * total)
    if (idx !== safeIndex) mineSet.add(idx)
  }
  const cells = Array.from({ length: total }, (_, i) => ({
    mine: mineSet.has(i),
    revealed: false,
    flagged: false,
    adjacent: 0,
  }))
  const at = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? cells[r * cols + c] : null)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r * cols + c].mine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          if (at(r + dr, c + dc)?.mine) count++
        }
      cells[r * cols + c].adjacent = count
    }
  }
  return cells
}

export default function Minesweeper({ isActive = true, windowId }) {
  const { resizeWindow } = useWindowManager()
  const [difficulty, setDifficulty] = useState('beginner')
  const { rows: ROWS, cols: COLS, mines: MINES } = DIFFICULTIES[difficulty]

  const [cells, setCells] = useState(() => buildBoard(ROWS, COLS, MINES, -1))
  const [status, setStatus] = useState('playing')
  const [firstClick, setFirstClick] = useState(true)
  const [seconds, setSeconds] = useState(0)

  const changeDifficulty = (key) => {
    const d = DIFFICULTIES[key]
    setDifficulty(key)
    setCells(buildBoard(d.rows, d.cols, d.mines, -1))
    setStatus('playing')
    setFirstClick(true)
    setSeconds(0)
    if (windowId) {
      resizeWindow(windowId, d.cols * CELL_PX + CHROME_W, d.rows * CELL_PX + CHROME_H)
    }
  }

  useEffect(() => {
    if (status !== 'playing' || firstClick || !isActive) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [status, firstClick, isActive])

  const flagsUsed = useMemo(() => cells.filter((c) => c.flagged).length, [cells])

  const reset = () => {
    setCells(buildBoard(ROWS, COLS, MINES, -1))
    setStatus('playing')
    setFirstClick(true)
    setSeconds(0)
  }

  const reveal = (index) => {
    if (status !== 'playing' || cells[index].flagged) return

    let board = cells
    if (firstClick) {
      board = buildBoard(ROWS, COLS, MINES, index)
      setFirstClick(false)
    }

    if (board[index].mine) {
      setCells(board.map((c) => (c.mine ? { ...c, revealed: true } : c)))
      setStatus('lost')
      return
    }

    const next = board.map((c) => ({ ...c }))
    const stack = [index]
    while (stack.length) {
      const i = stack.pop()
      if (next[i].revealed) continue
      next[i].revealed = true
      if (next[i].adjacent === 0) {
        const r = Math.floor(i / COLS)
        const c = i % COLS
        for (let dr = -1; dr <= 1; dr++)
          for (let dc = -1; dc <= 1; dc++) {
            const rr = r + dr
            const cc = c + dc
            if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS) {
              const ni = rr * COLS + cc
              if (!next[ni].revealed && !next[ni].mine) stack.push(ni)
            }
          }
      }
    }

    const won = next.every((c) => c.mine || c.revealed)
    setCells(next)
    setStatus(won ? 'won' : 'playing')
  }

  const toggleFlag = (e, index) => {
    e.preventDefault()
    if (status !== 'playing' || cells[index].revealed) return
    setCells(cells.map((c, i) => (i === index ? { ...c, flagged: !c.flagged } : c)))
  }

  const numberColors = ['', '#0a3d8f', '#1a7a2e', '#cc0000', '#4b0082', '#8a1a1a', '#0a7a7a', '#111', '#555']

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {Object.entries(DIFFICULTIES).map(([key, d]) => (
          <button
            key={key}
            onClick={() => changeDifficulty(key)}
            className={`${buttonXp} text-[11px] px-2 py-0.5 ${difficulty === key ? 'brightness-90' : ''}`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between w-full px-1">
        <div className="font-mono text-[14px] bg-black text-red-500 px-2 py-0.5 border border-[#555]">
          {String(Math.max(0, MINES - flagsUsed)).padStart(3, '0')}
        </div>
        <button className={buttonXp} onClick={reset}>
          {status === 'lost' ? 'Try again' : status === 'won' ? 'You win!' : 'Reset'}
        </button>
        <div className="font-mono text-[14px] bg-black text-red-500 px-2 py-0.5 border border-[#555]">
          {String(Math.min(seconds, 999)).padStart(3, '0')}
        </div>
      </div>

      <div
        className="relative grid border border-[#716f64] bg-[#bdbdbd]"
        style={{ gridTemplateColumns: `repeat(${COLS}, ${CELL_PX}px)` }}
      >
        {cells.map((cell, i) => (
          <button
            key={i}
            onClick={() => reveal(i)}
            onContextMenu={(e) => toggleFlag(e, i)}
            className={`text-[12px] font-bold flex items-center justify-center border ${
              cell.revealed
                ? 'bg-[#d8d8d8] border-[#9a9a9a]'
                : 'bg-[#c6c6c6] border-t-white border-l-white border-b-[#7a7a7a] border-r-[#7a7a7a] hover:bg-[#d2d2d2]'
            }`}
            style={{ width: CELL_PX, height: CELL_PX, color: cell.revealed && !cell.mine ? numberColors[cell.adjacent] : undefined }}
          >
            {cell.revealed
              ? cell.mine
                ? '*'
                : cell.adjacent || ''
              : cell.flagged
                ? 'F'
                : ''}
          </button>
        ))}
        {status === 'playing' && !isActive ? (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-[13px] font-bold">
            Paused
          </div>
        ) : null}
      </div>
      <p className="text-[11px] text-[#555]">Left click to reveal, right click to flag.</p>
    </div>
  )
}
