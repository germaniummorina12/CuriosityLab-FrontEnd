import { useEffect, useState } from 'react'
import { contactsApi } from '../lib/endpoints/contacts'
import { usersApi } from '../lib/endpoints/users'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { statusBar } from '../styles/xpTheme'

const columns = [
  { key: 'id', label: 'Id' },
  { key: 'userName', label: 'User' },
  { key: 'contactType', label: 'Type' },
  { key: 'value', label: 'Value' },
]

// Backend has no "all contacts" endpoint, only by-user/{userId} — fetch each user's
// contacts and flatten, same approach AddressesSheet uses for get-user-with-Addresses.
async function loadAllContacts() {
  const users = await usersApi.getAll()
  const perUser = await Promise.all(
    (Array.isArray(users) ? users : []).map((user) =>
      contactsApi.getByUser(user.id).catch(() => []),
    ),
  )
  return perUser.flat()
}

export default function ContactsSheet() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    loadAllContacts()
      .then((data) => {
        setRows(Array.isArray(data) ? data : [])
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  return (
    <>
      <SpreadsheetToolbar title="ContactList.xls — Sheet1" />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={rows}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No contacts on file'}
      />
      <div className={statusBar}>{rows.length} record(s)</div>
    </>
  )
}
