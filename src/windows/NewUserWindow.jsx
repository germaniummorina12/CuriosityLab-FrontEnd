import { useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function NewUserWindow({ windowId }) {
  const { closeWindow } = useWindowManager()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await usersApi.create({ name, email, age: age === '' ? null : Number(age) })
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={submit} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-col gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Name
          <input className={fieldInset} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Email
          <input type="email" className={fieldInset} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Age (optional)
          <input type="number" className={fieldInset} value={age} onChange={(e) => setAge(e.target.value)} />
        </label>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <div className="flex gap-1.5 justify-end px-1">
        <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary} disabled={status === 'saving'}>
          {status === 'saving' ? 'Creating…' : 'Create User'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>New User</div>
    </form>
  )
}
