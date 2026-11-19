import { useEffect, useRef, useState } from 'react'
import { buttonPrimary } from '../../styles/xpTheme'

const SIZE = 14
const CELL = 18
const BASE_TICK_MS = 160
const MIN_TICK_MS = 70
const MS_FASTER_PER_LEVEL = 12

const randomCell = () => ({
  x: Math.floor(Math.random() * SIZE),
  y: Math.floor(Math.random() * SIZE),
})

export default function Snake({ isActive = true }) {
  const [snake, setSnake] = useState([{ x: 7, y: 7 }])
  const [food, setFood] = useState(randomCell())
  const [dir, setDir] = useState({ x: 1, y: 0 })
  const [status, setStatus] = useState('playing')
  const [score, setScore] = useState(0)
  const dirRef = useRef(dir)
  dirRef.current = dir

  const level = Math.floor(score / 30) + 1
  const tickMs = Math.max(MIN_TICK_MS, BASE_TICK_MS - (level - 1) * MS_FASTER_PER_LEVEL)

  // Only the focused, non-minimized window should eat arrow-key presses or keep ticking —
  // otherwise a Snake sitting open in the background silently steals input and can die
  // off-screen while you're using something else.
  useEffect(() => {
    if (!isActive) return
    const onKey = (e) => {
      const map = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      }
      const next = map[e.key]
      if (!next) return
      e.preventDefault()
      const cur = dirRef.current
      if (next.x === -cur.x && next.y === -cur.y) return
      setDir(next)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isActive])

  useEffect(() => {
    if (status !== 'playing' || !isActive) return
    const t = setInterval(() => {
      setSnake((prev) => {
        const head = { x: prev[0].x + dirRef.current.x, y: prev[0].y + dirRef.current.y }
        const hitWall = head.x < 0 || head.x >= SIZE || head.y < 0 || head.y >= SIZE
        const hitSelf = prev.some((s) => s.x === head.x && s.y === head.y)
        if (hitWall || hitSelf) {
          setStatus('over')
          return prev
        }
        const ate = head.x === food.x && head.y === food.y
        const body = [head, ...prev]
        if (ate) {
          setScore((s) => s + 10)
          setFood(randomCell())
        } else {
          body.pop()
        }
        return body
      })
    }, tickMs)
    return () => clearInterval(t)
  }, [status, food, isActive, tickMs])

  const reset = () => {
    setSnake([{ x: 7, y: 7 }])
    setFood(randomCell())
    setDir({ x: 1, y: 0 })
    setStatus('playing')
    setScore(0)
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center gap-2">
      <div className="flex items-center justify-between w-full px-1 text-[13px] font-bold text-[#111]">
        <span>Score: {score}</span>
        <span className="text-[#1941a5]">Level {level}</span>
        {status === 'over' ? (
          <button className={buttonPrimary} onClick={reset}>
            Play again
          </button>
        ) : null}
      </div>
      <div
        className="relative bg-[#0b2a0b] border border-[#333]"
        style={{ width: SIZE * CELL, height: SIZE * CELL }}
      >
        {snake.map((s, i) => (
          <div
            key={i}
            className={i === 0 ? 'absolute bg-[#7fc93f]' : 'absolute bg-[#4a9a2e]'}
            style={{ left: s.x * CELL, top: s.y * CELL, width: CELL - 1, height: CELL - 1 }}
          />
        ))}
        <div
          className="absolute bg-[#d33b1f] rounded-full"
          style={{ left: food.x * CELL + 2, top: food.y * CELL + 2, width: CELL - 5, height: CELL - 5 }}
        />
        {status === 'over' ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[16px] font-bold">
            Game Over
          </div>
        ) : null}
        {status === 'playing' && !isActive ? (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[13px] font-bold">
            Paused
          </div>
        ) : null}
      </div>
      <p className="text-[11px] text-[#555]">Use the arrow keys to steer. Speed increases every 3 foods.</p>
    </div>
  )
}
