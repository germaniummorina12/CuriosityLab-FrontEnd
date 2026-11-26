import { useEffect, useState } from 'react'
import { statusBar } from '../../styles/xpTheme'
import { RED_SUITS, SUIT_SYMBOL, freshDeck } from './cardUtils'
import { XpMenuBar } from '../../components/desktop/XpMenuBar'
import { useWindowManager } from '../../context/WindowManagerContext'

const NAMES = ['You', 'West', 'North', 'East']
const value = (card) => (card.rank === 1 ? 14 : card.rank) // Ace-high for trick comparisons
const isPointCard = (card) => card.suit === 'H' || (card.suit === 'S' && card.rank === 12)
const cardPoints = (card) => (card.suit === 'H' ? 1 : card.suit === 'S' && card.rank === 12 ? 13 : 0)

function dealHands() {
  const deck = freshDeck()
  const hands = [[], [], [], []]
  deck.forEach((card, i) => hands[i % 4].push(card))
  hands.forEach((h) => h.sort((a, b) => (a.suit === b.suit ? value(a) - value(b) : a.suit.localeCompare(b.suit))))
  return hands
}

function startingLeader(hands) {
  return hands.findIndex((h) => h.some((c) => c.suit === 'C' && c.rank === 2))
}

// First-trick point restriction (no hearts/Q♠ unless forced) is applied by callers on top of this.
function legalPlays(hand, trick, heartsBroken) {
  const leadSuit = trick[0]?.card.suit
  if (leadSuit) {
    const matching = hand.filter((c) => c.suit === leadSuit)
    if (matching.length > 0) return matching
    return hand
  }
  // Leading: can't lead hearts unless broken (or hand is all hearts)
  const nonHearts = hand.filter((c) => c.suit !== 'H')
  if (!heartsBroken && nonHearts.length > 0) return nonHearts
  return hand
}

function botChoice(hand, trick, heartsBroken) {
  const legal = legalPlays(hand, trick, heartsBroken)
  if (trick.length === 0) {
    const safe = legal.filter((c) => !isPointCard(c))
    const pool = safe.length > 0 ? safe : legal
    return pool.reduce((lo, c) => (value(c) < value(lo) ? c : lo), pool[0])
  }
  const leadSuit = trick[0].card.suit
  const following = legal.filter((c) => c.suit === leadSuit)
  if (following.length > 0) {
    const highestInTrick = Math.max(...trick.filter((t) => t.card.suit === leadSuit).map((t) => value(t.card)))
    const safe = following.filter((c) => value(c) < highestInTrick)
    const pool = safe.length > 0 ? safe : following
    return pool.reduce((hi, c) => (value(c) > value(hi) && safe.length > 0 ? c : hi), pool[0])
  }
  const qs = legal.find((c) => c.suit === 'S' && c.rank === 12)
  if (qs) return qs
  const hearts = legal.filter((c) => c.suit === 'H')
  const pool = hearts.length > 0 ? hearts : legal
  return pool.reduce((hi, c) => (value(c) > value(hi) ? c : hi), pool[0])
}

export default function Hearts({ windowId }) {
  const { closeWindow } = useWindowManager()
  const [hands, setHands] = useState(() => dealHands())
  const [trick, setTrick] = useState([]) // [{player, card}]
  const [turn, setTurn] = useState(() => startingLeader(hands))
  const [heartsBroken, setHeartsBroken] = useState(false)
  const [scores, setScores] = useState([0, 0, 0, 0])
  const [, setRoundPoints] = useState([0, 0, 0, 0])
  const [message, setMessage] = useState('')
  const [gameOver, setGameOver] = useState(false)
  const [firstTrick, setFirstTrick] = useState(true)
  const [aboutOpen, setAboutOpen] = useState(false)

  const newGame = () => {
    const next = dealHands()
    setHands(next)
    setTrick([])
    setTurn(startingLeader(next))
    setHeartsBroken(false)
    setScores([0, 0, 0, 0])
    setRoundPoints([0, 0, 0, 0])
    setMessage('')
    setGameOver(false)
    setFirstTrick(true)
  }

  const playCard = (player, card) => {
    setHands((h) => {
      const next = [...h]
      next[player] = next[player].filter((c) => c.id !== card.id)
      return next
    })
    if (isPointCard(card)) setHeartsBroken(true)
    setTrick((t) => [...t, { player, card }])
  }

  // Bot turns. The `hands[turn]` emptiness check matters at round boundaries: once the
  // last trick of a round resolves, turn gets set to that trick's winner so play can
  // "continue", but if the winner isn't the human, this effect would otherwise schedule
  // a play for them immediately — before the 1800ms redeal delay has refilled their hand.
  useEffect(() => {
    if (gameOver || turn === 0 || trick.length === 4 || !hands[turn]?.length) return
    const t = setTimeout(() => {
      let legal = legalPlays(hands[turn], trick, heartsBroken)
      if (firstTrick) {
        const noPoints = legal.filter((c) => !isPointCard(c))
        if (noPoints.length > 0) legal = noPoints
      }
      const card = botChoice(hands[turn].filter((c) => legal.some((l) => l.id === c.id)), trick, heartsBroken)
      playCard(turn, card)
      setTurn((p) => (p + 1) % 4)
    }, 500)
    return () => clearTimeout(t)
    // hands is intentionally included despite changing on every single card play (by any
    // seat): without it, a redeal that happens to reuse the same `turn` value as the round
    // that just ended (same dependency snapshot) would never re-trigger this effect, and
    // a non-human seat's turn would stall silently. heartsBroken/firstTrick are read fresh
    // from closure each time this does re-run, which is all they need.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, trick.length, gameOver, hands])

  // Resolve a completed trick. Round-end can only be known for certain right here (hands
  // already emptied by the 4th playCard, so this is the single moment that both "trick over"
  // and "round over" are decidable) — settling in a separate effect keyed on `hands` going
  // empty raced this one, since that happens at card-*play* time while this points tally
  // only exists 900ms later at card-*resolve* time; the last trick of a round fired the
  // other effect before its own points were counted, then again after, double-crediting it.
  useEffect(() => {
    if (trick.length !== 4) return
    const t = setTimeout(() => {
      const leadSuit = trick[0].card.suit
      const winner = trick.reduce((best, cur) =>
        cur.card.suit === leadSuit && value(cur.card) > value(best.card) ? cur : best,
      ).player
      const points = trick.reduce((sum, c) => sum + cardPoints(c.card), 0)
      const roundOver = hands.every((h) => h.length === 0)

      setRoundPoints((rp) => {
        const next = [...rp]
        next[winner] += points
        if (!roundOver) return next

        const moonShooter = next.findIndex((p) => p === 26)
        const adjusted = moonShooter >= 0 ? next.map((_, i) => (i === moonShooter ? 0 : 26)) : next
        setScores((prevScores) => {
          const nextScores = prevScores.map((s, i) => s + adjusted[i])
          if (nextScores.some((s) => s >= 100)) {
            setGameOver(true)
            const min = Math.min(...nextScores)
            setMessage(`Game over — ${NAMES[nextScores.indexOf(min)]} wins with the lowest score!`)
          } else {
            setTimeout(() => {
              const nextHands = dealHands()
              setHands(nextHands)
              setHeartsBroken(false)
              setFirstTrick(true)
              setRoundPoints([0, 0, 0, 0])
              setTurn(startingLeader(nextHands))
              setMessage('')
            }, 1800)
          }
          return nextScores
        })
        return [0, 0, 0, 0]
      })
      setTrick([])
      setFirstTrick(false)
      setTurn(winner)
    }, 900)
    return () => clearTimeout(t)
  }, [trick])

  const humanLegal = turn === 0 && trick.length < 4 ? legalPlays(hands[0], trick, heartsBroken) : []
  const humanNoPoints = firstTrick ? humanLegal.filter((c) => !isPointCard(c)) : humanLegal
  const playable = humanNoPoints.length > 0 ? humanNoPoints : humanLegal

  const onPlayHuman = (card) => {
    if (turn !== 0 || trick.length >= 4) return
    if (!playable.some((c) => c.id === card.id)) return
    playCard(0, card)
    setTurn(1)
  }

  const seatCard = (seat) => trick.find((t) => t.player === seat)?.card

  const menus = {
    Game: [
      { label: 'New Game', onClick: newGame },
      { divider: true },
      { label: 'Exit', onClick: () => windowId && closeWindow(windowId) },
    ],
    Help: [{ label: 'About Hearts', onClick: () => setAboutOpen(true) }],
  }

  return (
    <div className="relative flex-1 min-h-0 flex flex-col -m-2">
      <XpMenuBar menus={menus} />
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-2 bg-[#1f7a2e]">
      <div className="flex items-center justify-between text-white text-[11px] font-bold">
        <span>
          {NAMES.map((n, i) => `${n}: ${scores[i]}`).join('   ')}
        </span>
        {message ? <span>{message}</span> : <span>{heartsBroken ? 'Hearts broken' : ''}</span>}
      </div>

      <div className="relative flex-1 flex items-center justify-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 text-center">
          <div className="text-white text-[10px] mb-1">North</div>
          {seatCard(2) ? <MiniCard card={seatCard(2)} /> : <div className="w-[42px] h-[58px]" />}
        </div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <div className="text-white text-[10px]">West</div>
          {seatCard(1) ? <MiniCard card={seatCard(1)} /> : <div className="w-[42px] h-[58px]" />}
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {seatCard(3) ? <MiniCard card={seatCard(3)} /> : <div className="w-[42px] h-[58px]" />}
          <div className="text-white text-[10px]">East</div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          {seatCard(0) ? <MiniCard card={seatCard(0)} /> : <div className="w-[42px] h-[58px]" />}
        </div>
      </div>

      <div className="flex justify-center gap-1 flex-wrap">
        {hands[0]?.map((card) => (
          <MiniCard
            key={card.id}
            card={card}
            clickable={playable.some((c) => c.id === card.id) && turn === 0}
            onClick={() => onPlayHuman(card)}
          />
        ))}
      </div>

      <div className={statusBar}>
        {turn === 0 && trick.length < 4 && !gameOver ? 'Your turn — click a card to play it.' : 'Waiting...'}
      </div>
      </div>

      {aboutOpen ? (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50" onClick={() => setAboutOpen(false)}>
          <div
            className="bg-[#ece9d8] border border-[#716f64] shadow-[2px_2px_8px_rgba(0,0,0,0.5)] p-4 text-[12px] text-[#111] w-[220px]"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-bold mb-1">Hearts</p>
            <p className="mb-3">Avoid taking hearts and the queen of spades — lowest score wins.</p>
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

function MiniCard({ card, clickable, onClick }) {
  const isRed = RED_SUITS.has(card.suit)
  return (
    <button
      onClick={clickable ? onClick : undefined}
      className={`w-[42px] h-[58px] rounded-[3px] bg-white border text-left px-1 pt-0.5 leading-none font-bold ${
        isRed ? 'text-[#c00000]' : 'text-[#111]'
      } ${clickable ? 'border-[#555] hover:-translate-y-1 transition-transform cursor-pointer' : 'border-[#999] opacity-95 cursor-default'}`}
    >
      <div className="text-[11px]">{card.rank === 1 ? 'A' : card.rank === 11 ? 'J' : card.rank === 12 ? 'Q' : card.rank === 13 ? 'K' : card.rank}</div>
      <div className="text-[14px]">{SUIT_SYMBOL[card.suit]}</div>
    </button>
  )
}
