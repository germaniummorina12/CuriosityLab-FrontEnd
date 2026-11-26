import { useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import { contactTypesApi } from '../lib/endpoints/contactTypes'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function NewContactWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [users, setUsers] = useState([])
  const [types, setTypes] = useState([])
  const [userId, setUserId] = useState(params?.userId ? String(params.userId) : '')
  const [contactTypeId, setContactTypeId] = useState('')
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
    contactTypesApi.getAll().then(setTypes).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await contactsApi.create(Number(userId), Number(contactTypeId), value)
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
          User
          <select className={fieldInset} value={userId} onChange={(e) => setUserId(e.target.value)} required disabled={!!params?.userId}>
            <option value="">Choose a user…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Type
          <select className={fieldInset} value={contactTypeId} onChange={(e) => setContactTypeId(e.target.value)} required>
            <option value="">Choose a type…</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Value
          <input className={fieldInset} value={value} onChange={(e) => setValue(e.target.value)} required />
        </label>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <div className="flex gap-1.5 justify-end px-1">
        <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary} disabled={status === 'saving' || !userId || !contactTypeId}>
          {status === 'saving' ? 'Adding…' : 'Add Contact'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>New Contact</div>
    </form>
  )
}
