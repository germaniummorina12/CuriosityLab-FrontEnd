import { useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import { contactTypesApi } from '../lib/endpoints/contactTypes'
import { fieldInset, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'

// GetGroupedByType returns [{ contactType, contacts: [{ id, value }] }] — flatten to one row
// per contact so it can share the same results table as every other mode here.
const flattenGrouped = (groups) =>
  groups.flatMap((g) => g.contacts.map((c) => ({ id: c.id, contactType: g.contactType, value: c.value })))

export default function ContactReportsWindow() {
  const [types, setTypes] = useState([])
  const [modeKey, setModeKey] = useState('byType')
  const [values, setValues] = useState({})
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    contactTypesApi.getAll().then(setTypes).catch(() => {})
  }, [])

  const MODES = [
    {
      key: 'byType',
      label: 'Contacts of a given type',
      fields: [{ key: 'contactTypeId', label: 'Type', type: 'select', options: types }],
      run: (v) => contactsApi.getByType(Number(v.contactTypeId)),
      columns: [
        { key: 'id', label: 'Id' },
        { key: 'userName', label: 'User' },
        { key: 'contactType', label: 'Type' },
        { key: 'value', label: 'Value' },
      ],
    },
    {
      key: 'withoutType',
      label: 'Users without a given type',
      fields: [{ key: 'contactTypeId', label: 'Type', type: 'select', options: types }],
      run: (v) => contactsApi.getUsersWithoutType(Number(v.contactTypeId)),
      columns: [{ key: 'userId', label: 'User id' }, { key: 'userName', label: 'User' }],
    },
    {
      key: 'dateRange',
      label: 'Added between dates',
      fields: [{ key: 'fromDate', label: 'From', type: 'date' }, { key: 'untilDate', label: 'Until', type: 'date' }],
      run: (v) => contactsApi.getByDateRange(v.fromDate, v.untilDate),
      columns: [
        { key: 'id', label: 'Id' },
        { key: 'userName', label: 'User' },
        { key: 'contactTypeName', label: 'Type' },
        { key: 'value', label: 'Value' },
      ],
    },
    {
      key: 'search',
      label: 'Search by value',
      fields: [{ key: 'value', label: 'Contains', type: 'text' }],
      run: (v) => contactsApi.search(v.value),
      columns: [{ key: 'id', label: 'Id' }, { key: 'value', label: 'Value' }],
    },
    {
      key: 'grouped',
      label: "One user's contacts, grouped by type",
      fields: [{ key: 'userId', label: 'User id', type: 'number' }],
      run: (v) => contactsApi.getGroupedByType(Number(v.userId)).then(flattenGrouped),
      columns: [
        { key: 'id', label: 'Id' },
        { key: 'contactType', label: 'Type' },
        { key: 'value', label: 'Value' },
      ],
    },
  ]

  const mode = MODES.find((m) => m.key === modeKey)

  const selectMode = (key) => {
    setModeKey(key)
    setValues({})
    setRows(null)
    setStatus('idle')
    setError('')
  }

  const run = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const data = await mode.run(values)
      setRows(Array.isArray(data) ? data : [])
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <form onSubmit={run} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-wrap items-end gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Report
          <select className={fieldInset} value={modeKey} onChange={(e) => selectMode(e.target.value)}>
            {MODES.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        {mode.fields.map((f) =>
          f.type === 'select' ? (
            <label key={f.key} className="flex flex-col gap-0.5 text-[12px] text-[#333]">
              {f.label}
              <select
                className={fieldInset}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                required
              >
                <option value="">Choose…</option>
                {f.options.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </label>
          ) : (
            <label key={f.key} className="flex flex-col gap-0.5 text-[12px] text-[#333]">
              {f.label}
              <input
                className={fieldInset}
                type={f.type}
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
                required
              />
            </label>
          ),
        )}
        <button type="submit" className={buttonPrimary} disabled={status === 'loading'}>
          {status === 'loading' ? 'Running…' : 'Run'}
        </button>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <SpreadsheetTable
        columns={mode.columns}
        rows={rows ?? []}
        emptyLabel={rows === null ? 'Choose a report and click Run' : 'No results'}
      />

      <div className={statusBar}>{rows ? `${rows.length} result(s)` : 'Contact Reports'}</div>
    </form>
  )
}
