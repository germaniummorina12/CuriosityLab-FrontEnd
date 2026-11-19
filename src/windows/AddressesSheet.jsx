import { useEffect, useMemo, useState } from 'react'
import { addressesApi } from '../lib/endpoints/addresses'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import { statusBar } from '../styles/xpTheme'

const columns = [
  { key: 'owner', label: 'User' },
  { key: 'city', label: 'City' },
  { key: 'street', label: 'Street' },
  { key: 'postalCode', label: 'Postal code' },
]

// Live response shape: [{ userId, userName, age, addresses: [{ city, street, postalCode }] }]
function flatten(payload) {
  const list = Array.isArray(payload) ? payload : []
  return list.flatMap((user) => {
    const addresses = user.addresses ?? user.Addresses ?? []
    if (!addresses.length) return []
    return addresses.map((a, i) => ({
      id: `${user.userId ?? user.id}-${i}`,
      owner: user.userName ?? user.name ?? user.Name,
      city: a.city ?? a.City,
      street: a.street ?? a.Street,
      postalCode: a.postalCode ?? a.PostalCode,
    }))
  })
}

export default function AddressesSheet() {
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [cityFilter, setCityFilter] = useState('')

  useEffect(() => {
    addressesApi
      .getUsersWithAddresses()
      .then((data) => {
        setRows(flatten(data))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  const filtered = useMemo(
    () => rows.filter((r) => !cityFilter || r.city?.toLowerCase().includes(cityFilter.toLowerCase())),
    [rows, cityFilter],
  )

  return (
    <>
      <SpreadsheetToolbar
        title="AddressBook.xls — Sheet1"
        filters={[
          { key: 'city', label: 'City contains', value: cityFilter, onChange: setCityFilter, placeholder: 'e.g. Tirana' },
        ]}
        actions={[{ label: 'Clear filter', onClick: () => setCityFilter('') }]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No addresses match this filter'}
      />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
