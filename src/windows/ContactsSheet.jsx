import { useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { statusBar } from '../styles/xpTheme'

const columns = [
  { key: 'id', label: 'Id' },
  { key: 'type', label: 'Type' },
  { key: 'value', label: 'Value' },
]

export default function ContactsSheet() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    contactsApi
      .search('')
      .then((data) => {
        setRows(Array.isArray(data) ? data : [])
        setStatus('ready')
      })
      .catch(() => setStatus('not-built'))
  }, [])

  return (
    <>
      <SpreadsheetToolbar title="ContactList.xls — Sheet1" />
      {status === 'not-built' ? (
        <div className={`${statusBar} text-[#333]`}>
          This sheet is ready on the frontend, but the Contacts API isn't built yet — it's on the backlog
          (Contacts CRUD/bulk/filter tickets). This window will populate automatically once those endpoints exist.
        </div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={rows}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No data yet'}
      />
      <div className={statusBar}>{rows.length} record(s)</div>
    </>
  )
}
