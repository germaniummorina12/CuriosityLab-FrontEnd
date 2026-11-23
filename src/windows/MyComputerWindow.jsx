import { useEffect, useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { rolesApi } from '../lib/endpoints/roles'
import { sectionGroove, statusBar } from '../styles/xpTheme'
import { ExplorerChrome } from '../components/desktop/ExplorerChrome'
import { MyComputerIcon } from '../components/icons/RetroIcons'

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#e3e1d6] last:border-b-0">
      <span className="text-[12px] text-[#333]">{label}</span>
      <span className="text-[12px] font-bold text-[#111]">{value}</span>
    </div>
  )
}

export default function MyComputerWindow() {
  const [totals, setTotals] = useState(null)
  const [avgAge, setAvgAge] = useState(null)
  const [roleCounts, setRoleCounts] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    Promise.allSettled([usersApi.getTotals(), usersApi.getAverageAge(), rolesApi.getUserCounts()]).then(
      ([t, a, c]) => {
        if (t.status === 'fulfilled') setTotals(t.value)
        if (a.status === 'fulfilled') setAvgAge(a.value)
        if (c.status === 'fulfilled') setRoleCounts(Array.isArray(c.value) ? c.value : [])
        setStatus('ready')
      },
    )
  }, [])

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-2">
      <ExplorerChrome title="My Computer" icon={MyComputerIcon} />
      <div className="flex items-center gap-2 px-1">
        <span className="w-9 h-9 rounded-[4px] bg-gradient-to-b from-[#6fa6f0] to-[#1941a5] border border-[#0a3d8f]" />
        <div>
          <div className="text-[13px] font-bold text-[#111]">CuriosityLab System Properties</div>
          <div className="text-[11px] text-[#555]">Live data pulled from the API at startup</div>
        </div>
      </div>

      <div className={`${sectionGroove}`}>
        <StatRow label="Total users" value={status === 'loading' ? '…' : totals?.users ?? '—'} />
        <StatRow label="Total roles" value={status === 'loading' ? '…' : totals?.roles ?? '—'} />
        <StatRow
          label="Average user age"
          value={status === 'loading' ? '…' : avgAge?.avgAge != null ? Number(avgAge.avgAge).toFixed(1) : '—'}
        />
      </div>

      <div className="text-[12px] font-bold text-[#111] px-1 mt-1">Users per role</div>
      <div className={`${sectionGroove} flex-1 min-h-0 overflow-auto`}>
        {roleCounts.length === 0 ? (
          <div className="px-3 py-2 text-[12px] text-[#777] italic">No role data</div>
        ) : (
          roleCounts.map((r, i) => <StatRow key={i} label={r.role} value={r.user} />)
        )}
      </div>

      <div className={statusBar}>
        {status === 'loading' ? 'Reading system information…' : 'Ready'}
      </div>
    </div>
  )
}
