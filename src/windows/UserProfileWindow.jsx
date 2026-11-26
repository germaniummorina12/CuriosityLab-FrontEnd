import { useEffect, useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { rolesApi } from '../lib/endpoints/roles'
import { sectionGroove, statusBar, buttonXp, buttonPrimary } from '../styles/xpTheme'
import { useWindowManager } from '../context/WindowManagerContext'
import { trashStore } from '../lib/trashStore'

export default function UserProfileWindow({ params, windowId }) {
  const { closeWindow, openWindow } = useWindowManager()
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')
  const [deleting, setDeleting] = useState(false)

  const [allRoles, setAllRoles] = useState([])
  const [checkedRoleIds, setCheckedRoleIds] = useState(new Set())
  const [rolesStatus, setRolesStatus] = useState('loading')
  const [rolesSaving, setRolesSaving] = useState(false)
  const [rolesMessage, setRolesMessage] = useState('')

  useEffect(() => {
    usersApi
      .getProfile(params.id)
      .then((data) => {
        setUser(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  useEffect(() => {
    // rolesApi.getAll() only returns { name } (no id — see RolesSheet), so the id-bearing
    // source here is get-role-by-name with an empty filter, which matches every role.
    Promise.all([usersApi.getRoles(params.id), rolesApi.getByName('')])
      .then(([userRoles, roles]) => {
        setAllRoles(roles)
        const names = new Set(userRoles.roles ?? [])
        setCheckedRoleIds(new Set(roles.filter((r) => names.has(r.name)).map((r) => r.id)))
        setRolesStatus('ready')
      })
      .catch(() => setRolesStatus('error'))
  }, [params.id])

  const deleteUser = async () => {
    if (!user || deleting) return
    setDeleting(true)
    try {
      await usersApi.remove(params.id)
      trashStore.add({
        id: Number(params.id),
        sourceKind: 'user',
        name: user.name ?? `User #${params.id}`,
        originalLocation: 'C:\\My Documents\\UserList.xls',
        dateDeleted: new Date().toISOString(),
        type: 'User Record',
        size: Math.max(1024, JSON.stringify(user).length),
      })
      if (windowId) closeWindow(windowId)
    } catch {
      setStatus('error')
      setDeleting(false)
    }
  }

  const toggleRole = (id) => {
    setCheckedRoleIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const saveRoles = async () => {
    setRolesSaving(true)
    setRolesMessage('')
    try {
      await usersApi.setRoles(params.id, [...checkedRoleIds])
      setRolesMessage('Saved.')
    } catch (err) {
      setRolesMessage(err.message)
    } finally {
      setRolesSaving(false)
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-auto">
      <div className="flex items-center gap-3 px-1">
        <span className="w-12 h-12 rounded-full bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-[#0a3d8f] flex items-center justify-center text-white font-bold text-[18px]">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </span>
        <div className="flex-1">
          <div className="text-[14px] font-bold text-[#111]">{status === 'loading' ? 'Loading…' : user?.name}</div>
          <div className="text-[12px] text-[#555]">User #{params.id}</div>
        </div>
        <button
          className={buttonXp}
          disabled={status !== 'ready'}
          onClick={() => openWindow({ kind: 'edit-user', title: `Edit User #${params.id}`, params: { id: params.id }, width: 360, height: 300 })}
        >
          Edit
        </button>
        <button className={buttonXp} disabled={status !== 'ready' || deleting} onClick={deleteUser}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {status === 'error' ? (
        <div className="text-[12px] text-[#8a1a1a] px-1">Could not load this user.</div>
      ) : null}

      <div className={sectionGroove}>
        <div className="flex justify-between px-3 py-1.5 border-b border-[#e3e1d6]">
          <span className="text-[12px] text-[#333]">Age</span>
          <span className="text-[12px] font-bold">{user?.age ?? '—'}</span>
        </div>
        <div className="flex justify-between px-3 py-1.5 border-b border-[#e3e1d6]">
          <span className="text-[12px] text-[#333]">Addresses on file</span>
          <span className="text-[12px] font-bold">{user?.addresses?.length ?? 0}</span>
        </div>
        <div className="flex justify-between px-3 py-1.5">
          <span className="text-[12px] text-[#333]">Contacts on file</span>
          <span className="text-[12px] font-bold">{user?.contacts?.length ?? 0}</span>
        </div>
      </div>

      <div className={`${sectionGroove} overflow-auto`}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#e3e1d6]">
          <span className="text-[12px] font-bold text-[#1941a5]">Addresses</span>
          <button
            className={buttonXp}
            disabled={status !== 'ready'}
            onClick={() => openWindow({ kind: 'new-address', title: 'New Address', params: { userId: params.id }, width: 360, height: 360 })}
          >
            Add address
          </button>
        </div>
        {user?.addresses?.length ? (
          user.addresses.map((a, i) => (
            <div key={i} className="px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0 text-[12px]">
              {a.street}, {a.city} {a.postalcode}
            </div>
          ))
        ) : (
          <div className="px-3 py-1.5 text-[12px] text-[#777] italic">No addresses on file</div>
        )}
      </div>

      <div className={`${sectionGroove} overflow-auto`}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#e3e1d6]">
          <span className="text-[12px] font-bold text-[#1941a5]">Contacts</span>
          <button
            className={buttonXp}
            disabled={status !== 'ready'}
            onClick={() => openWindow({ kind: 'contacts-for-user', title: `${user?.name}'s Contacts`, params: { userId: params.id }, width: 480, height: 420 })}
          >
            Manage contacts
          </button>
        </div>
        {user?.contacts?.length ? (
          user.contacts.map((c, i) => (
            <div key={i} className="px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0 text-[12px] flex justify-between">
              <span className="text-[#555]">{c.contactType}</span>
              <span>{c.value}</span>
            </div>
          ))
        ) : (
          <div className="px-3 py-1.5 text-[12px] text-[#777] italic">No contacts on file</div>
        )}
      </div>

      <div className={sectionGroove}>
        <div className="px-3 py-1.5 border-b border-[#e3e1d6] text-[12px] font-bold text-[#1941a5]">Roles</div>
        {rolesStatus === 'loading' ? (
          <div className="px-3 py-1.5 text-[12px] text-[#555]">Loading…</div>
        ) : rolesStatus === 'error' ? (
          <div className="px-3 py-1.5 text-[12px] text-[#8a1a1a]">Could not load roles.</div>
        ) : (
          <>
            {allRoles.map((r) => (
              <label key={r.id} className="flex items-center gap-2 px-3 py-1 text-[12px] border-b border-[#e3e1d6] last:border-b-0">
                <input type="checkbox" checked={checkedRoleIds.has(r.id)} onChange={() => toggleRole(r.id)} />
                {r.name}
              </label>
            ))}
            {!allRoles.length ? <div className="px-3 py-1.5 text-[12px] text-[#777] italic">No roles defined</div> : null}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5">
              <span className="text-[11px] text-[#555]">{rolesMessage}</span>
              <button className={buttonPrimary} disabled={rolesSaving} onClick={saveRoles}>
                {rolesSaving ? 'Saving…' : 'Save roles'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={statusBar}>Properties</div>
    </div>
  )
}
