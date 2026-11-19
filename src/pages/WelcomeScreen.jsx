import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function WelcomeScreen() {
  const { accounts, login } = useAuth()
  const navigate = useNavigate()

  const pick = (id) => {
    login(id)
    navigate('/desktop')
  }

  return (
    <div className="w-screen h-screen bg-gradient-to-b from-[#1941a5] via-[#2a6fe0] to-[#0b2a7a] flex flex-col">
      <div className="flex-1 flex items-center justify-center gap-16 px-10">
        <div className="text-white text-right flex flex-col items-end">
          <img
            src="/16-162608_windows-logo-png-windows-xp-logo.png"
            alt=""
            className="w-16 h-16 object-contain mb-1"
          />
          <div className="text-[40px] font-bold italic leading-none">CuriosityLab</div>
          <div className="text-[16px] mt-3 opacity-90">To begin, click your account name</div>
        </div>
        <div className="w-px h-[260px] bg-white/30" />
        <div className="flex flex-col gap-3">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => pick(acc.id)}
              className="flex items-center gap-4 px-3 py-2 rounded-[4px] hover:bg-white/15 text-left"
            >
              <span className="w-12 h-12 rounded-[6px] bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-white/60 flex items-center justify-center text-white font-bold text-[18px] shadow-[1px_2px_4px_rgba(0,0,0,0.4)]">
                {acc.tile}
              </span>
              <span className="text-white text-[18px] font-semibold">{acc.name}</span>
            </button>
          ))}
          <button
            onClick={() => navigate('/signup')}
            className="mt-2 text-white/90 text-[13px] underline text-left px-3"
          >
            Create a new account
          </button>
        </div>
      </div>
      <div className="h-[46px] bg-[#0b2a7a]/70 flex items-center justify-between px-6 text-white/80 text-[12px]">
        <span>Login/Signup will connect to real authentication once the backend ships it.</span>
        <span>CuriosityLab © {new Date().getFullYear()}</span>
      </div>
    </div>
  )
}
