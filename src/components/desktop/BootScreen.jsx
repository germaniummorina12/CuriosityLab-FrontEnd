import { useEffect, useRef, useState } from 'react'

const DURATION = 2800
const CYCLE = 900
const TRACK_WIDTH = 224
const BLOCK_WIDTH = 16
const BLOCK_GAP = 6
const GROUP_WIDTH = BLOCK_WIDTH * 3 + BLOCK_GAP * 2

export default function BootScreen({ onDone }) {
  const [elapsed, setElapsed] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    const tick = (now) => {
      if (startRef.current === null) startRef.current = now
      const t = now - startRef.current
      setElapsed(t)
      if (t < DURATION) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onDone()
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onDone])

  // The real XP boot bar is 3 blocks sliding left-to-right in a continuous loop, not bouncing.
  const cycle = (elapsed % CYCLE) / CYCLE
  const left = cycle * (TRACK_WIDTH - GROUP_WIDTH)

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 z-[999]">
      <img
        src="/16-162608_windows-logo-png-windows-xp-logo.png"
        alt="Windows"
        className="w-32 h-32 object-contain"
      />
      <div className="text-white text-[22px] tracking-wide">
        <span className="font-semibold">CuriosityLab</span>{' '}
        <span className="italic opacity-80">xp</span>
      </div>
      <div
        className="rounded-[2px] border border-[#333] overflow-hidden"
        style={{ width: TRACK_WIDTH, height: 14, background: '#0a0a0a' }}
      >
        <div
          className="flex h-full items-center gap-[6px]"
          style={{ transform: `translateX(${left}px)` }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-[10px] rounded-[1px] bg-gradient-to-b from-[#9fc3f5] via-[#3a7fe0] to-[#0a3d8f]"
              style={{ width: BLOCK_WIDTH }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
