import { useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function NewRoleWindow({ windowId }) {
  const { closeWindow } = useWindowManager()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await rolesApi.create({ name })
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
          Role name
          <input className={fieldInset} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <div className="flex gap-1.5 justify-end px-1">
        <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary} disabled={status === 'saving'}>
          {status === 'saving' ? 'Creating…' : 'Create Role'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>New Role</div>
    </form>
  )
}
