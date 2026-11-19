import { useEffect, useRef, useState } from 'react'

const DURATION = 2800
const TRACK_WIDTH = 224
const BLOCK_WIDTH = 64

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

  // Triangle wave 0→1→0 so the block slides back and forth like the real XP boot bar.
  const cycle = (elapsed % 900) / 900
  const wave = cycle < 0.5 ? cycle * 2 : 2 - cycle * 2
  const left = wave * (TRACK_WIDTH - BLOCK_WIDTH)

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
        className="rounded-[2px] border border-[#333]"
        style={{ width: TRACK_WIDTH, height: 14, background: '#0a0a0a' }}
      >
        <div
          className="h-full rounded-[1px] bg-gradient-to-r from-[#0a3d8f] via-[#6fa6f0] to-[#0a3d8f]"
          style={{ width: BLOCK_WIDTH, transform: `translateX(${left}px)` }}
        />
      </div>
    </div>
  )
}
