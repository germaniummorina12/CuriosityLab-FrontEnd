import { useCallback, useEffect, useMemo, useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import SheetTabs from '../components/spreadsheet/SheetTabs'
import { statusBar } from '../styles/xpTheme'
import { useWindowManager } from '../context/WindowManagerContext'

// The live /roles endpoint only returns { name } right now (no id) — one column until that changes.
const columns = [{ key: 'name', label: 'Role name' }]

export default function RolesSheet({ windowId }) {
  const { openWindow } = useWindowManager()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [nameFilter, setNameFilter] = useState('')

  const refresh = useCallback(() => {
    setStatus('loading')
    return rolesApi
      .getAll()
      .then((data) => {
        setRows(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(
    () => rows.filter((r) => !nameFilter || r.name?.toLowerCase().includes(nameFilter.toLowerCase())),
    [rows, nameFilter],
  )

  // GetAll has no id, so resolve one on demand via get-role-by-name (which does return
  // id+name) before opening the per-role Properties window.
  const openRole = async (row) => {
    try {
      const matches = await rolesApi.getByName(row.name)
      const match = matches.find((m) => m.name === row.name) ?? matches[0]
      if (!match) return
      openWindow({ kind: 'role-profile', title: `${row.name} — Properties`, params: { id: match.id }, width: 420, height: 440 })
    } catch {
      // ignore — user can retry
    }
  }

  return (
    <>
      <SpreadsheetToolbar
        title="RoleList.xls — Sheet1"
        windowId={windowId}
        filters={[
          { key: 'name', label: 'Name contains', value: nameFilter, onChange: setNameFilter, placeholder: 'e.g. admin' },
        ]}
        actions={[
          { label: 'Clear filter', onClick: () => setNameFilter('') },
          { label: 'Refresh', onClick: refresh },
          {
            label: 'New…',
            onClick: () => openWindow({ kind: 'new-role', title: 'New Role', width: 340, height: 220 }),
          },
          {
            label: 'Reports…',
            onClick: () => openWindow({ kind: 'role-reports', title: 'Role Reports', width: 540, height: 420 }),
          },
        ]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No roles match this filter'}
        onRowDoubleClick={openRole}
      />
      <SheetTabs />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
