import { useCallback, useEffect, useMemo, useState } from 'react'
import { addressesApi } from '../lib/endpoints/addresses'
import SpreadsheetToolbar from '../components/spreadsheet/SpreadsheetToolbar'
import SpreadsheetTable from '../components/spreadsheet/SpreadsheetTable'
import SheetTabs from '../components/spreadsheet/SheetTabs'
import { statusBar } from '../styles/xpTheme'
import { useWindowManager } from '../context/WindowManagerContext'

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

export default function AddressesSheet({ windowId }) {
  const { openWindow } = useWindowManager()
  const [rows, setRows] = useState([])
  const [status, setStatus] = useState('loading')
  const [cityFilter, setCityFilter] = useState('')

  const refresh = useCallback(() => {
    setStatus('loading')
    return addressesApi
      .getUsersWithAddresses()
      .then((data) => {
        setRows(flatten(data))
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const filtered = useMemo(
    () => rows.filter((r) => !cityFilter || r.city?.toLowerCase().includes(cityFilter.toLowerCase())),
    [rows, cityFilter],
  )

  return (
    <>
      <SpreadsheetToolbar
        title="AddressBook.xls — Sheet1"
        windowId={windowId}
        filters={[
          { key: 'city', label: 'City contains', value: cityFilter, onChange: setCityFilter, placeholder: 'e.g. Tirana' },
        ]}
        actions={[
          { label: 'Clear filter', onClick: () => setCityFilter('') },
          { label: 'Refresh', onClick: refresh },
          {
            label: 'New…',
            onClick: () => openWindow({ kind: 'new-address', title: 'New Address', width: 360, height: 360 }),
          },
          {
            label: 'Reports…',
            onClick: () => openWindow({ kind: 'address-reports', title: 'Address Reports', width: 600, height: 460 }),
          },
        ]}
      />
      {status === 'error' ? (
        <div className={`${statusBar} text-[#8a1a1a]`}>Could not reach the backend.</div>
      ) : null}
      <SpreadsheetTable
        columns={columns}
        rows={filtered}
        emptyLabel={status === 'loading' ? 'Loading…' : 'No addresses match this filter'}
      />
      <SheetTabs />
      <div className={statusBar}>{filtered.length} of {rows.length} record(s)</div>
    </>
  )
}
