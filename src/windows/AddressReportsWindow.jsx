import { useState } from 'react'
import { addressesApi } from '../lib/endpoints/addresses'
import { useWindowManager } from '../context/WindowManagerContext'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { fieldInset, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'

// Flattens the "user with nested addresses" shape several endpoints below return into one
// row per user, since this window shows one table regardless of which mode is active.
const userRow = (u) => ({ id: u.userId ?? u.id, name: u.userName ?? u.name, age: u.age, addressCount: u.addresses?.length ?? 0 })

const MODES = [
  {
    key: 'byStreet',
    label: 'Address: street contains',
    fields: [{ key: 'street', label: 'Street', type: 'text' }],
    run: (v) => addressesApi.getByStreet(v.street),
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'city', label: 'City' },
      { key: 'street', label: 'Street' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    key: 'byCity',
    label: 'Address: city contains',
    fields: [{ key: 'city', label: 'City', type: 'text' }],
    run: (v) => addressesApi.getByCity(v.city),
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'city', label: 'City' },
      { key: 'street', label: 'Street' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    key: 'byPostalCode',
    label: 'Address: exact postal code',
    fields: [{ key: 'postalCode', label: 'Postal code', type: 'text' }],
    run: (v) => addressesApi.getByPostalCode(v.postalCode),
    columns: [
      { key: 'city', label: 'City' },
      { key: 'street', label: 'Street' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    key: 'byDateRange',
    label: 'Address: added between dates',
    fields: [{ key: 'fromDate', label: 'From', type: 'date' }, { key: 'untilDate', label: 'Until', type: 'date' }],
    run: (v) => addressesApi.getByDateRange(v.fromDate, v.untilDate),
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'city', label: 'City' },
      { key: 'street', label: 'Street' },
      { key: 'postalCode', label: 'Postal code' },
    ],
  },
  {
    key: 'perCity',
    label: 'Report: distinct users per city',
    fields: [],
    run: () => addressesApi.getUsersPerCity(),
    columns: [{ key: 'city', label: 'City' }, { key: 'users', label: 'Users' }],
  },
  {
    key: 'noAddress',
    label: 'Report: users without an address',
    fields: [],
    run: () => addressesApi.getUsersWithoutAddress(),
    columns: [{ key: 'id', label: 'Id' }, { key: 'name', label: 'Name' }, { key: 'age', label: 'Age' }],
  },
  {
    key: 'multiAddress',
    // Despite its backend name ("common city"), this actually lists users with more than
    // one address on file — it has nothing to do with which city is most common.
    label: 'Report: users with more than one address',
    fields: [],
    run: () => addressesApi.getMostCommonCity().then((rows) => rows.map(userRow)),
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'addressCount', label: 'Addresses' },
    ],
  },
  {
    key: 'specificCity',
    label: 'Report: users living in an exact city',
    fields: [{ key: 'city', label: 'City', type: 'text' }],
    run: (v) => addressesApi.getSpecificCity(v.city).then((rows) => rows.map(userRow)),
    columns: [
      { key: 'id', label: 'Id' },
      { key: 'name', label: 'Name' },
      { key: 'age', label: 'Age' },
      { key: 'addressCount', label: 'Addresses' },
    ],
  },
]

export default function AddressReportsWindow() {
  const { openWindow } = useWindowManager()
  const [modeKey, setModeKey] = useState(MODES[0].key)
  const [values, setValues] = useState({})
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

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

  // Only the address-level modes return a real address id to edit.
  const editable = ['byStreet', 'byCity', 'byDateRange'].includes(modeKey)

  return (
    <form onSubmit={run} className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-wrap items-end gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333]">
          Search by
          <select className={fieldInset} value={modeKey} onChange={(e) => selectMode(e.target.value)}>
            {MODES.map((m) => (
              <option key={m.key} value={m.key}>{m.label}</option>
            ))}
          </select>
        </label>
        {mode.fields.map((f) => (
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
        ))}
        <button type="submit" className={buttonPrimary} disabled={status === 'loading'}>
          {status === 'loading' ? 'Running…' : 'Run'}
        </button>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}
      {editable ? <div className="text-[11px] text-[#555] px-1">Double-click a row to edit or delete that address.</div> : null}

      <SpreadsheetTable
        columns={mode.columns}
        rows={rows ?? []}
        emptyLabel={rows === null ? 'Choose a search and click Run' : 'No results'}
        onRowDoubleClick={
          editable
            ? (row) =>
                openWindow({
                  kind: 'edit-address',
                  title: `Edit Address #${row.id}`,
                  params: { id: row.id, city: row.city, street: row.street, postalCode: row.postalCode },
                  width: 340,
                  height: 280,
                })
            : undefined
        }
      />

      <div className={statusBar}>{rows ? `${rows.length} result(s)` : 'Address Reports'}</div>
    </form>
  )
}
