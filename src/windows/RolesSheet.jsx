import { useEffect, useMemo, useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { statusBar } from '../styles/xpTheme'

// The live /roles endpoint only returns { name } right now (no id) — one column until that changes.
const columns = [{ key: 'name', label: 'Role name' }]

export default function RolesSheet() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [nameFilter, setNameFilter] = useState('')

  useEffect(() => {
    rolesApi
      .getAll()
      .then((data) => {
        setRows(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filtered = useMemo(
    () => rows.filter((r) => !nameFilter || r.name?.toLowerCase().includes(nameFilter.toLowerCase())),
    [rows, nameFilter],
  )

  return (
    <>
      <SpreadsheetToolbar
        title="RoleList.xls — Sheet1"
        filters={[
          { key: 'name', label: 'Name contains', value: nameFilter, onChange: setNameFilter, placeholder: 'e.g. admin' },
        ]}
        actions={[{ label: 'Clear filter', onClick: () => setNameFilter('') }]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No roles match this filter'}
      />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
