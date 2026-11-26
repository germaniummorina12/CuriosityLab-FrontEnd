import { useCallback, useEffect, useState } from 'react'
import { rolesApi } from '../lib/endpoints/roles'
import { usersApi } from '../lib/endpoints/users'
import { useWindowManager } from '../context/WindowManagerContext'
import { sectionGroove, statusBar, buttonXp, buttonPrimary, fieldInset } from '../styles/xpTheme'

export default function RoleProfileWindow({ params, windowId }) {
  const { closeWindow, openWindow } = useWindowManager()
  const [name, setName] = useState('')
  const [status, setStatus] = useState('loading')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const [members, setMembers] = useState([])
  const [membersStatus, setMembersStatus] = useState('loading')
  const [allUsers, setAllUsers] = useState([])
  const [pickUserId, setPickUserId] = useState('')
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState('')

  useEffect(() => {
    rolesApi
      .getById(params.id)
      .then((r) => {
        setName(r.name ?? '')
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  const refreshMembers = useCallback(() => {
    setMembersStatus('loading')
    return rolesApi
      .getUsersInRole(params.id)
      .then((data) => {
        setMembers(data)
        setMembersStatus('ready')
      })
      .catch(() => setMembersStatus('error'))
  }, [params.id])

  useEffect(() => {
    refreshMembers()
    usersApi.getAll().then(setAllUsers).catch(() => {})
  }, [refreshMembers])

  const deleteRole = async () => {
    if (deleting) return
    if (!window.confirm(`Delete role "${name}"? This cannot be undone from here.`)) return
    setDeleting(true)
    setDeleteError('')
    try {
      await rolesApi.remove(params.id)
      if (windowId) closeWindow(windowId)
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  const assign = async (e) => {
    e.preventDefault()
    if (!pickUserId) return
    setAssigning(true)
    setAssignError('')
    try {
      await rolesApi.assignToUser(Number(params.id), Number(pickUserId))
      setPickUserId('')
      await refreshMembers()
    } catch (err) {
      setAssignError(err.message)
    } finally {
      setAssigning(false)
    }
  }

  const removeMember = async (userId) => {
    try {
      await rolesApi.removeFromUser(userId, Number(params.id))
      await refreshMembers()
    } catch (err) {
      setAssignError(err.message)
    }
  }

  const memberIds = new Set(members.map((m) => m.id))
  const assignableUsers = allUsers.filter((u) => !memberIds.has(u.id))

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-auto">
      <div className="flex items-center gap-3 px-1">
        <div className="flex-1">
          <div className="text-[14px] font-bold text-[#111]">{status === 'loading' ? 'Loading…' : name}</div>
          <div className="text-[12px] text-[#555]">Role #{params.id}</div>
        </div>
        <button
          className={buttonXp}
          disabled={status !== 'ready'}
          onClick={() => openWindow({ kind: 'edit-role', title: `Edit Role #${params.id}`, params: { id: params.id }, width: 360, height: 240 })}
        >
          Edit
        </button>
        <button className={buttonXp} disabled={status !== 'ready' || deleting} onClick={deleteRole}>
          {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {status === 'error' ? <div className="text-[12px] text-[#8a1a1a] px-1">Could not load this role.</div> : null}
      {deleteError ? <div className="text-[12px] text-[#8a1a1a] px-1">{deleteError}</div> : null}

      <div className={sectionGroove}>
        <div className="px-3 py-1.5 border-b border-[#e3e1d6] text-[12px] font-bold text-[#1941a5]">
          Users in this role ({members.length})
        </div>
        {membersStatus === 'loading' ? (
          <div className="px-3 py-1.5 text-[12px] text-[#555]">Loading…</div>
        ) : membersStatus === 'error' ? (
          <div className="px-3 py-1.5 text-[12px] text-[#8a1a1a]">Could not load members.</div>
        ) : members.length ? (
          members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0 text-[12px]">
              <span>{m.name} {m.age != null ? `(${m.age})` : ''}</span>
              <button className={buttonXp} onClick={() => removeMember(m.id)}>Remove</button>
            </div>
          ))
        ) : (
          <div className="px-3 py-1.5 text-[12px] text-[#777] italic">No users have this role</div>
        )}
      </div>

      <form onSubmit={assign} className={`${sectionGroove} p-3 flex items-end gap-2`}>
        <label className="flex flex-col gap-0.5 text-[12px] text-[#333] flex-1">
          Assign a user
          <select className={fieldInset} value={pickUserId} onChange={(e) => setPickUserId(e.target.value)}>
            <option value="">Choose a user…</option>
            {assignableUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonPrimary} disabled={!pickUserId || assigning}>
          {assigning ? 'Assigning…' : 'Assign'}
        </button>
      </form>
      {assignError ? <div className="text-[12px] text-[#8a1a1a] px-1">{assignError}</div> : null}

      <div className={`${statusBar} mt-auto`}>Role Properties</div>
    </div>
  )
}
