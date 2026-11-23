import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  buttonPrimary,
  buttonXp,
  fieldInset,
  windowFrameBase,
  windowBorderActive,
  titleBarActive,
} from '../styles/xpTheme'
import Wallpaper from '../components/desktop/Wallpaper'

export default function Signup() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="relative w-screen h-screen flex items-center justify-center">
      <Wallpaper />
      <div className={`relative rounded-t-[8px] ${windowBorderActive} ${windowFrameBase} w-[420px]`}>
        <div className={`h-[30px] flex items-center px-3 text-[12px] font-bold ${titleBarActive}`}>
          Create a new account
        </div>
        <div className="bg-[#ece9d8] p-5 flex flex-col gap-3">
          {submitted ? (
            <>
              <p className="text-[13px] text-[#111]">
                Thanks, {name || 'friend'}. There's no account/auth API yet, so nothing was actually sent
                anywhere — this form is just wired up and ready for when that backend work lands.
              </p>
              <button className={buttonPrimary} onClick={() => navigate('/')}>
                Back to login
              </button>
            </>
          ) : (
            <>
              <label className="flex flex-col gap-1 text-[12px] text-[#333]">
                Full name
                <input className={fieldInset} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="flex flex-col gap-1 text-[12px] text-[#333]">
                Email
                <input
                  className={fieldInset}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <div className="flex gap-2 justify-end mt-2">
                <button className={buttonXp} onClick={() => navigate('/')}>
                  Cancel
                </button>
                <button className={buttonPrimary} onClick={() => setSubmitted(true)}>
                  Create account
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
