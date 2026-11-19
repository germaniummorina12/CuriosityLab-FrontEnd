import { useEffect, useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { sectionGroove, statusBar } from '../styles/xpTheme'

export default function UserProfileWindow({ params }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    usersApi
      .getById(params.id)
      .then((data) => {
        setUser(data)
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [params.id])

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <div className="flex items-center gap-3 px-1">
        <span className="w-12 h-12 rounded-full bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-[#0a3d8f] flex items-center justify-center text-white font-bold text-[18px]">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </span>
        <div>
          <div className="text-[14px] font-bold text-[#111]">{status === 'loading' ? 'Loading…' : user?.name}</div>
          <div className="text-[12px] text-[#555]">User #{params.id}</div>
        </div>
      </div>

      {status === 'error' ? (
        <div className="text-[12px] text-[#8a1a1a] px-1">Could not load this user.</div>
      ) : null}

      <div className={sectionGroove}>
        <div className="flex justify-between px-3 py-1.5 border-b border-[#e3e1d6]">
          <span className="text-[12px] text-[#333]">Age</span>
          <span className="text-[12px] font-bold">{user?.age ?? '—'}</span>
        </div>
        <div className="flex justify-between px-3 py-1.5">
          <span className="text-[12px] text-[#333]">Addresses on file</span>
          <span className="text-[12px] font-bold">{user?.addresses?.length ?? 0}</span>
        </div>
      </div>

      {user?.addresses?.length ? (
        <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
          {user.addresses.map((a, i) => (
            <div key={i} className="px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0 text-[12px]">
              {a.street}, {a.city} {a.postalcode}
            </div>
          ))}
        </div>
      ) : null}

      <div className={statusBar}>Properties</div>
    </div>
  )
}
