import { useEffect, useState } from 'react'
import { addressesApi } from '../lib/endpoints/addresses'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function NewAddressWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [users, setUsers] = useState([])
  const [userId, setUserId] = useState(params?.userId ? String(params.userId) : '')
  const [city, setCity] = useState('')
  const [street, setStreet] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    usersApi.getAll().then(setUsers).catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setStatus('saving')
    setError('')
    try {
      await addressesApi.create(Number(userId), { city, street, postalCode })
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
          City
          <input className={fieldInset} value={city} onChange={(e) => setCity(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Street
          <input className={fieldInset} value={street} onChange={(e) => setStreet(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Postal code
          <input className={fieldInset} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
        </label>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <div className="flex gap-1.5 justify-end px-1">
        <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary} disabled={status === 'saving' || !userId}>
          {status === 'saving' ? 'Adding…' : 'Add Address'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>New Address</div>
    </form>
  )
}
