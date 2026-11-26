import { useState } from 'react'
import { addressesApi } from '../lib/endpoints/addresses'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

// There is no "get one address by id" endpoint on the backend — the only queries that
// return an address id (search-street/search-city/range-date) already hand back the full
// record, so this window is seeded straight from that row instead of loading it again.
export default function EditAddressWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [city, setCity] = useState(params.city ?? '')
  const [street, setStreet] = useState(params.street ?? '')
  const [postalCode, setPostalCode] = useState(params.postalCode ?? '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [deleted, setDeleted] = useState(false)
  const [restoring, setRestoring] = useState(false)

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await addressesApi.update(params.id, { city, street, postalCode })
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this address?')) return
    setDeleting(true)
    setError('')
    try {
      await addressesApi.remove(params.id)
      setDeleted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const undoDelete = async () => {
    setRestoring(true)
    setError('')
    try {
      await addressesApi.restore(params.id)
      setDeleted(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setRestoring(false)
    }
  }

  if (deleted) {
    return (
      <div className="flex-1 min-h-0 flex flex-col gap-2 p-3">
        <div className="text-[12px] text-[#333]">Address deleted.</div>
        {error ? <div className="text-[12px] text-[#8a1a1a]">{error}</div> : null}
        <div className="flex gap-1.5">
          <button className={buttonXp} disabled={restoring} onClick={undoDelete}>
            {restoring ? 'Undoing…' : 'Undo'}
          </button>
          <button className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
            Close
          </button>
        </div>
        <div className={`${statusBar} mt-auto`}>Address #{params.id}</div>
      </div>
    )
  }

  return (
    <form onSubmit={save} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-col gap-2`}>
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

      <div className="flex gap-1.5 justify-between px-1">
        <button type="button" className={buttonXp} disabled={deleting} onClick={remove}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
        <div className="flex gap-1.5">
          <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
            Cancel
          </button>
          <button type="submit" className={buttonPrimary} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className={`${statusBar} mt-auto`}>Address #{params.id}</div>
    </form>
  )
}
