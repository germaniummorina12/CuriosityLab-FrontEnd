import { useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import { fieldInset, buttonPrimary, sectionGroove, statusBar } from '../styles/xpTheme'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'

const REPORTS = [
  {
    key: 'noUsers',
    label: 'Roles without any users',
    columns: [{ key: 'role', label: 'Role' }],
    run: () => rolesApi.getRolesWithoutUsers(),
  },
  {
    key: 'ageStats',
    label: 'Age stats per role (min / max / average)',
    columns: [
      { key: 'role', label: 'Role' },
      { key: 'minAgeUser', label: 'Min age' },
      { key: 'maxAgeUser', label: 'Max age' },
      { key: 'avgAgeUser', label: 'Avg age', render: (r) => (r.avgAgeUser != null ? r.avgAgeUser.toFixed(1) : '') },
    ],
    run: () => rolesApi.getAgeStats(),
  },
]

export default function RoleReportsWindow() {
  const [reportKey, setReportKey] = useState(REPORTS[0].key)
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const report = REPORTS.find((r) => r.key === reportKey)

  const selectReport = (key) => {
    setReportKey(key)
    setRows(null)
    setStatus('idle')
    setError('')
  }

  const run = async () => {
    setStatus('loading')
    setError('')
    try {
      const data = await report.run()
      setRows(Array.isArray(data) ? data : [])
      setStatus('ready')
    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className={`${sectionGroove} p-3 flex flex-wrap items-end gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333] flex-1">
          Report
          <select className={fieldInset} value={reportKey} onChange={(e) => selectReport(e.target.value)}>
            {REPORTS.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </label>
        <button className={buttonPrimary} disabled={status === 'loading'} onClick={run}>
          {status === 'loading' ? 'Running…' : 'Run report'}
        </button>
      </div>

      {error ? <div className="text-[12px] text-[#8a1a1a] px-1">{error}</div> : null}

      <SpreadsheetTable
        columns={report.columns}
        rows={rows ?? []}
        emptyLabel={rows === null ? 'Choose a report and click Run report' : 'No results'}
      />

      <div className={statusBar}>{rows ? `${rows.length} row(s)` : 'Role Reports'}</div>
    </div>
  )
}
