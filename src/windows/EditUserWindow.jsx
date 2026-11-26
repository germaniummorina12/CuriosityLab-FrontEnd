import { useEffect, useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function EditUserWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    usersApi
      .getById(params.id)
      .then((u) => {
        setName(u.name ?? '')
        setAge(u.age ?? '')
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  const saveAll = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await usersApi.update(params.id, { id: params.id, name, age: age === '' ? null : Number(age) })
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  // Distinct from saveAll: hits the dedicated update-age endpoint, which only
  // touches Age and leaves Name (and its validation) untouched.
  const saveAgeOnly = async () => {
    setSaving(true)
    setError('')
    try {
      await usersApi.updateAge(params.id, { id: params.id, age: age === '' ? null : Number(age) })
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (status === 'loading') return <div className="p-3 text-[12px] text-[#555]">Loading…</div>
  if (status === 'error') return <div className="p-3 text-[12px] text-[#8a1a1a]">Could not load this user.</div>

  return (
    <form onSubmit={saveAll} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-col gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Name
          <input className={fieldInset} value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Age
          <div className="flex gap-1.5">
            <input type="number" className={`${fieldInset} flex-1`} value={age} onChange={(e) => setAge(e.target.value)} />
            <button type="button" className={buttonXp} disabled={saving} onClick={saveAgeOnly}>
              Update age only
            </button>
          </div>
        </label>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <div className="flex gap-1.5 justify-end px-1">
        <button type="button" className={buttonXp} onClick={() => windowId && closeWindow(windowId)}>
          Cancel
        </button>
        <button type="submit" className={buttonPrimary} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>User #{params.id}</div>
    </form>
  )
}
