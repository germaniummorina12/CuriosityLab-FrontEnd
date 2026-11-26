import { useCallback, useEffect, useMemo, useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import SheetTabs from '../components/spreadsheet/SheetTabs'
import { statusBar } from '../styles/xpTheme'
import { useWindowManager } from '../context/WindowManagerContext'
import { User, Search } from 'lucide-react'

// The live GetAll endpoint currently mislabels its second field "email" while actually
// populating it with the user's Name (backend bug, not fixed here) — read defensively
// so the sheet still shows a real name either way.
const displayName = (u) => u.name ?? u.email ?? ''

const columns = [
  { key: 'id', label: 'Id' },
  { key: 'name', label: 'Name', render: displayName },
  { key: 'age', label: 'Age' },
]

export default function UsersSheet({ windowId }) {
  const { openWindow } = useWindowManager()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [nameFilter, setNameFilter] = useState('')
  const [minAge, setMinAge] = useState('')
  const [maxAge, setMaxAge] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(() => {
    setStatus('loading')
    return usersApi
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

  const filtered = useMemo(() => {
    return rows.filter((u) => {
      if (nameFilter && !displayName(u).toLowerCase().includes(nameFilter.toLowerCase())) return false
      if (minAge && (u.age ?? -Infinity) < Number(minAge)) return false
      if (maxAge && (u.age ?? Infinity) > Number(maxAge)) return false
      return true
    })
  }, [rows, nameFilter, minAge, maxAge])

  const toggleRow = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const deleteSelected = async () => {
    if (!selectedIds.size || deleting) return
    if (!window.confirm(`Delete ${selectedIds.size} selected user(s)? This cannot be undone from here.`)) return
    setDeleting(true)
    try {
      await usersApi.bulkDelete([...selectedIds])
      setSelectedIds(new Set())
      await refresh()
    } catch {
      setStatus('error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <SpreadsheetToolbar
        title="UserList.xls — Sheet1"
        windowId={windowId}
        filters={[
          { key: 'name', label: 'Name contains', value: nameFilter, onChange: setNameFilter, placeholder: 'e.g. ana' },
          { key: 'minAge', label: 'Min age', type: 'number', value: minAge, onChange: setMinAge },
          { key: 'maxAge', label: 'Max age', type: 'number', value: maxAge, onChange: setMaxAge },
        ]}
        actions={[
          { label: 'Clear filters', onClick: () => { setNameFilter(''); setMinAge(''); setMaxAge('') } },
          { label: 'Refresh', onClick: refresh },
          {
            label: 'New…',
            onClick: () => openWindow({ kind: 'new-user', title: 'New User', icon: User, width: 360, height: 300 }),
          },
          {
            label: 'Find…',
            onClick: () => openWindow({ kind: 'find-users', title: 'Find Users', icon: Search, width: 580, height: 460 }),
          },
          {
            label: deleting ? 'Deleting…' : `Delete selected (${selectedIds.size})`,
            onClick: deleteSelected,
            disabled: !selectedIds.size || deleting,
          },
        ]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>
          Could not reach the backend at the configured API URL. Is the API running on localhost:5258?
        </div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No users match these filters'}
        selectable
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onRowDoubleClick={(row) =>
          openWindow({ kind: 'user-profile', title: `${displayName(row)} — Properties`, icon: User, params: { id: row.id }, width: 420, height: 460 })
        }
      />
      <SheetTabs />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
