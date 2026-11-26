import { useCallback, useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import { contactTypesApi } from '../lib/endpoints/contactTypes'
import { fieldInset, buttonXp, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

let nextKey = 1

export default function ContactsForUserWindow({ params }) {
  const [userName, setUserName] = useState('')
  const [types, setTypes] = useState([])
  const [rows, setRows] = useState([])
  const [selected, setSelected] = useState(new Set())
  const [status, setStatus] = useState('loading')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  const load = useCallback(() => {
    setStatus('loading')
    return Promise.all([contactsApi.getByUser(params.userId), contactTypesApi.getAll()])
      .then(([data, allTypes]) => {
        setTypes(allTypes)
        const user = data[0]
        setUserName(user?.userName ?? '')
        const byName = new Map(allTypes.map((t) => [t.name, t.id]))
        setRows(
          (user?.contacts ?? []).map((c) => ({
            key: nextKey++,
            id: c.id,
            contactTypeId: String(byName.get(c.contactType) ?? ''),
            value: c.value,
          })),
        )
        setSelected(new Set())
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.userId])

  useEffect(() => {
    load()
  }, [load])

  const updateRow = (key, patch) => setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const addRow = () => setRows((prev) => [...prev, { key: nextKey++, id: null, contactTypeId: '', value: '' }])
  const discardRow = (key) => setRows((prev) => prev.filter((r) => r.key !== key))

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const run = async (action) => {
    setBusy(true)
    setMessage('')
    try {
      await action()
      await load()
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  const deleteOne = (id) => run(() => contactsApi.remove(id))

  const deleteSelected = () => {
    if (!selected.size) return
    if (!window.confirm(`Delete ${selected.size} selected contact(s)?`)) return
    run(() => contactsApi.bulkRemove([...selected]))
  }

  const saveNewRows = () => {
    const items = rows
      .filter((r) => !r.id && r.value.trim() && r.contactTypeId)
      .map((r) => ({ contactTypeId: Number(r.contactTypeId), value: r.value }))
    if (!items.length) return setMessage('No new rows to add.')
    run(() => contactsApi.bulkCreate(params.userId, items))
  }

  const saveEditedRows = () => {
    const items = rows
      .filter((r) => r.id)
      .map((r) => ({ id: r.id, contactTypeId: Number(r.contactTypeId), value: r.value }))
    if (!items.length) return setMessage('No existing rows to save.')
    run(() => contactsApi.bulkUpdate(params.userId, items))
  }

  const syncAll = () => {
    const items = rows
      .filter((r) => r.value.trim() && r.contactTypeId)
      .map((r) => ({ id: r.id, contactTypeId: Number(r.contactTypeId), value: r.value }))
    run(() => contactsApi.syncForUser(params.userId, items))
  }

  if (status === 'loading') return <div className="p-3 text-[12px] text-[#555]">Loading…</div>
  if (status === 'error') return <div className="p-3 text-[12px] text-[#8a1a1a]">Could not load this user's contacts.</div>

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className="px-1 text-[13px] font-bold text-[#111]">{userName}'s contacts</div>

      <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2 px-2 py-1.5 border-b border-[#e3e1d6] last:border-b-0">
            {r.id ? (
              <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} />
            ) : (
              <span className="w-[13px]" />
            )}
            <select
              className={`${fieldInset} w-32`}
              value={r.contactTypeId}
              onChange={(e) => updateRow(r.key, { contactTypeId: e.target.value })}
            >
              <option value="">Type…</option>
              {types.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <input
              className={`${fieldInset} flex-1`}
              value={r.value}
              onChange={(e) => updateRow(r.key, { value: e.target.value })}
            />
            {r.id ? (
              <button type="button" className={buttonXp} disabled={busy} onClick={() => deleteOne(r.id)}>
                Delete
              </button>
            ) : (
              <button type="button" className={buttonXp} disabled={busy} onClick={() => discardRow(r.key)}>
                Discard
              </button>
            )}
          </div>
        ))}
        {!rows.length ? <div className="px-3 py-2 text-[12px] text-[#777] italic">No contacts yet</div> : null}
      </div>

      {message ? <div className="text-[12px] text-[#8a1a1a] px-1">{message}</div> : null}

      <div className="flex flex-wrap gap-1.5 px-1">
        <button type="button" className={buttonXp} disabled={busy} onClick={addRow}>
          + Add row
        </button>
        <button type="button" className={buttonXp} disabled={busy || !selected.size} onClick={deleteSelected}>
          Delete selected ({selected.size})
        </button>
        <span className="flex-1" />
        <button type="button" className={buttonXp} disabled={busy} onClick={saveNewRows} title="Only sends rows that don't have an id yet">
          Add new rows
        </button>
        <button type="button" className={buttonXp} disabled={busy} onClick={saveEditedRows} title="Only updates rows that already exist">
          Save edited rows
        </button>
        <button type="button" className={buttonPrimary} disabled={busy} onClick={syncAll} title="Adds, updates and removes in one call so the server list matches exactly what's shown here">
          Sync all
        </button>
      </div>

      <div className={statusBar}>Manage Contacts</div>
    </div>
  )
}
