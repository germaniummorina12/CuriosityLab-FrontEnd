import { useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { fieldInset, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'
import { User } from 'lucide-react'

// GetByNameOrEmail/GetByEmailDomain return emails as a list ({ emails: [{ email }] })
// instead of a flat field — flatten it so every mode can share one results table.
const flattenEmails = (u) => ({ ...u, email: u.emails?.map((e) => e.email).join(', ') ?? '' })

const MODES = [
  { key: 'minAge', label: 'Minimum age', fields: [{ key: 'age', label: 'Age at least', type: 'number' }], run: (v) => usersApi.getByAge(Number(v.age)) },
  {
    key: 'ageRange',
    label: 'Age range',
    fields: [{ key: 'minAge', label: 'Min age', type: 'number' }, { key: 'maxAge', label: 'Max age', type: 'number' }],
    run: (v) => usersApi.getByAgeRange(Number(v.minAge), Number(v.maxAge)),
  },
  {
    key: 'dateRange',
    label: 'Joined between dates',
    fields: [{ key: 'fromDate', label: 'From', type: 'date' }, { key: 'untilDate', label: 'Until', type: 'date' }],
    run: (v) => usersApi.getByDateRange(v.fromDate, v.untilDate),
  },
  { key: 'dateSort', label: 'All users, sorted by join date', fields: [], run: () => usersApi.getSortedByDate() },
  { key: 'noRole', label: 'Users without a role', fields: [], run: () => usersApi.getWithoutRole() },
  { key: 'noAge', label: 'Users without an age on file', fields: [], run: () => usersApi.getWithoutAge() },
  {
    key: 'exactName',
    label: 'Exact name match',
    fields: [{ key: 'input', label: 'Name', type: 'text' }],
    run: (v) => usersApi.getByName(v.input),
  },
  {
    key: 'nameLength',
    label: 'Name length at least',
    fields: [{ key: 'length', label: 'Characters', type: 'number' }],
    run: (v) => usersApi.getByNameLength(Number(v.length)),
  },
  {
    key: 'nameOrEmail',
    label: 'Name or email contains',
    fields: [{ key: 'text', label: 'Text', type: 'text' }],
    run: (v) => usersApi.getByNameOrEmail(v.text).then((rows) => rows.map(flattenEmails)),
  },
  {
    key: 'emailDomain',
    label: 'Email domain contains',
    fields: [{ key: 'email', label: 'Domain, e.g. gmail.com', type: 'text' }],
    run: (v) => usersApi.getByEmailDomain(v.email).then((rows) => rows.map(flattenEmails)),
  },
]

const columns = [
  { key: 'id', label: 'Id' },
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'email', label: 'Email', render: (r) => r.email ?? '' },
]

export default function FindUsersWindow() {
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

  const search = async (e) => {
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
    <form onSubmit={search} className="flex-1 min-h-0 flex flex-col gap-2">
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
          {status === 'loading' ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <SpreadsheetTable
        columns={columns}
        rows={rows ?? []}
        emptyLabel={rows === null ? 'Choose a search and click Search' : 'No users match this search'}
        onRowDoubleClick={(row) =>
          openWindow({ kind: 'user-profile', title: `${row.name} — Properties`, icon: User, params: { id: row.id }, width: 420, height: 460 })
        }
      />

      <div className={statusBar}>{rows ? `${rows.length} result(s)` : 'Find Users'}</div>
    </form>
  )
}
