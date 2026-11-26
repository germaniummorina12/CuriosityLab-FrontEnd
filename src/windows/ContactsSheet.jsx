import { useCallback, useEffect, useMemo, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import SheetTabs from '../components/spreadsheet/SheetTabs'
import { statusBar } from '../styles/xpTheme'
import { useWindowManager } from '../context/WindowManagerContext'

const columns = [
  { key: 'id', label: 'Id' },
  { key: 'userName', label: 'User' },
  { key: 'contactType', label: 'Type' },
  { key: 'value', label: 'Value' },
]

export default function ContactsSheet({ windowId }) {
  const { openWindow } = useWindowManager()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [userFilter, setUserFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [valueFilter, setValueFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleting, setDeleting] = useState(false)

  const refresh = useCallback(() => {
    setStatus('loading')
    return contactsApi
      .getAll()
      .then((data) => {
        setRows(Array.isArray(data) ? data : [])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const typeOptions = useMemo(() => {
    const types = new Set(rows.map((r) => r.contactType).filter(Boolean))
    return [{ value: '', label: 'All' }, ...[...types].sort().map((t) => ({ value: t, label: t }))]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (userFilter && !r.userName?.toLowerCase().includes(userFilter.toLowerCase())) return false
      if (typeFilter && r.contactType !== typeFilter) return false
      if (valueFilter && !r.value?.toLowerCase().includes(valueFilter.toLowerCase())) return false
      return true
    })
  }, [rows, userFilter, typeFilter, valueFilter])

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
    if (!window.confirm(`Delete ${selectedIds.size} selected contact(s)?`)) return
    setDeleting(true)
    try {
      await contactsApi.bulkRemove([...selectedIds])
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
        title="ContactList.xls — Sheet1"
        windowId={windowId}
        filters={[
          { key: 'user', label: 'User contains', value: userFilter, onChange: setUserFilter, placeholder: 'e.g. ana' },
          { key: 'type', label: 'Type', type: 'select', value: typeFilter, onChange: setTypeFilter, options: typeOptions },
          { key: 'value', label: 'Value contains', value: valueFilter, onChange: setValueFilter, placeholder: 'e.g. @gmail.com' },
        ]}
        actions={[
          { label: 'Clear filters', onClick: () => { setUserFilter(''); setTypeFilter(''); setValueFilter('') } },
          { label: 'Refresh', onClick: refresh },
          {
            label: 'New…',
            onClick: () => openWindow({ kind: 'new-contact', title: 'New Contact', width: 360, height: 320 }),
          },
          {
            label: 'Reports…',
            onClick: () => openWindow({ kind: 'contact-reports', title: 'Contact Reports', width: 600, height: 460 }),
          },
          {
            label: deleting ? 'Deleting…' : `Delete selected (${selectedIds.size})`,
            onClick: deleteSelected,
            disabled: !selectedIds.size || deleting,
          },
        ]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No contacts match these filters'}
        selectable
        selectedIds={selectedIds}
        onToggleRow={toggleRow}
        onRowDoubleClick={(row) =>
          openWindow({ kind: 'edit-contact', title: `Edit Contact #${row.id}`, params: { id: row.id }, width: 360, height: 300 })
        }
      />
      <SheetTabs />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
