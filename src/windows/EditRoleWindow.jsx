import { useEffect, useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import { useWindowManager } from '../context/WindowManagerContext'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

export default function EditRoleWindow({ params, windowId }) {
  const { closeWindow } = useWindowManager()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('loading')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    rolesApi
      .getById(params.id)
      .then((r) => {
        setName(r.name ?? '')
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await rolesApi.update(params.id, { id: params.id, name })
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (status === 'loading') return <div className="p-3 text-[12px] text-[#555]">Loading…</div>
  if (status === 'error') return <div className="p-3 text-[12px] text-[#8a1a1a]">Could not load this role.</div>

  return (
    <form onSubmit={save} className="flex-1 min-h-0 flex flex-col gap-2">
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
        <button type="submit" className={buttonPrimary} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className={`${statusBar} mt-auto`}>Role #{params.id}</div>
    </form>
  )
}
