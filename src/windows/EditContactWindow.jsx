import { useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import { contactTypesApi } from '../lib/endpoints/contactTypes'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function EditContactWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [types, setTypes] = useState([])
  const [contactTypeId, setContactTypeId] = useState('')
  const [value, setValue] = useState('')
  const [userName, setUserName] = useState('')
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([contactsApi.getById(params.id), contactTypesApi.getAll()])
      .then(([contact, allTypes]) => {
        setTypes(allTypes)
        setUserName(contact.userName)
        setValue(contact.value ?? '')
        const match = allTypes.find((t) => t.name === contact.contactType)
        setContactTypeId(match ? String(match.id) : '')
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await contactsApi.update(params.id, Number(contactTypeId), value)
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Delete this contact?')) return
    setDeleting(true)
    setError('')
    try {
      await contactsApi.remove(params.id)
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  if (status === 'loading') return <div className="p-3 text-[12px] text-[#555]">Loading…</div>
  if (status === 'error') return <div className="p-3 text-[12px] text-[#8a1a1a]">Could not load this contact.</div>

  return (
    <form onSubmit={save} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-col gap-2`}>
        <div className="text-[12px] text-[#555]">User: <span className="font-bold text-[#111]">{userName}</span></div>
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

      <div className={`${statusBar} mt-auto`}>Contact #{params.id}</div>
    </form>
  )
}
