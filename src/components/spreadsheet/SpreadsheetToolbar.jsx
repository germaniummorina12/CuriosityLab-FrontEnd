import { buttonXp, fieldInset } from '../../styles/xpTheme'

export default function SpreadsheetToolbar({ title, filters, actions }) {
  return (
    <div className="mb-1.5 flex flex-col gap-1.5">
      <div className="h-[26px] bg-gradient-to-b from-[#3fae4a] to-[#1f7a2e] border border-[#124f1d] rounded-[2px] flex items-center px-2 text-white text-[12px] font-semibold shadow-[1px_1px_1px_rgba(0,0,0,0.2)]">
        {title}
      </div>
      {(filters?.length || actions?.length) ? (
        <div className="flex flex-wrap items-end gap-2 bg-[#f7f6ef] border border-[#c8c4b0] rounded-[3px] px-2 py-1.5">
          {filters?.map((f) => (
            <label key={f.key} className="flex flex-col gap-0.5 text-[11px] text-[#333]">
              {f.label}
              {f.type === 'select' ? (
                <select className={fieldInset} value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                  {f.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className={fieldInset}
                  type={f.type ?? 'text'}
                  value={f.value}
                  placeholder={f.placeholder}
                  onChange={(e) => f.onChange(e.target.value)}
                />
              )}
            </label>
          ))}
          <div className="flex gap-1.5 ml-auto">
            {actions?.map((a) => (
              <button key={a.label} className={buttonXp} onClick={a.onClick} disabled={a.disabled}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
