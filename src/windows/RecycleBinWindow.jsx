import { useState } from 'react'
import { usersApi } from '../lib/endpoints/users'
import { buttonPrimary, fieldInset, statusBar } from '../styles/xpTheme'
import { ExplorerChrome } from '../components/desktop/ExplorerChrome'
import { RecycleBinIcon } from '../components/icons/RetroIcons'

export default function RecycleBinWindow() {
  const [id, setId] = useState('')
  const [message, setMessage] = useState(null)

  const restore = async () => {
    if (!id) return
    try {
      await usersApi.restore(id, { id: Number(id) })
      setMessage({ type: 'ok', text: `User #${id} restored.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3 p-2">
      <ExplorerChrome title="Recycle Bin" icon={RecycleBinIcon} />
      <p className="text-[12px] text-[#333] leading-relaxed">
        There's no endpoint yet to list every deleted item (that's on the backlog), so for now Recycle Bin
        restores a specific user by id — wired straight to the real <code>restore-user</code> endpoint.
      </p>
      <label className="flex flex-col gap-1 text-[12px] text-[#333]">
        User id to restore
        <input
          className={`${fieldInset} w-40`}
          type="number"
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. 7"
        />
      </label>
      <button className={`${buttonPrimary} self-start`} onClick={restore}>
        Restore item
      </button>
      {message ? (
        <div className={`text-[12px] ${message.type === 'ok' ? 'text-[#1a7a2e]' : 'text-[#8a1a1a]'}`}>
          {message.text}
        </div>
      ) : null}
      <div className={`${statusBar} mt-auto`}>0 items shown — listing isn't available yet</div>
    </div>
  )
}
