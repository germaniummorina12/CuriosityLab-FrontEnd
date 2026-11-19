const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export default function SpreadsheetTable({ columns, rows, emptyLabel = 'No rows', onRowDoubleClick }) {
  return (
    <div className="flex-1 min-h-0 overflow-auto border border-[#8a9aad] bg-white">
      <table className="border-collapse w-full text-[12px]">
        <thead>
          <tr>
            <th className="sticky top-0 z-10 w-10 bg-[#d8dde3] border border-[#8a9aad] text-[#444] font-normal" />
            {columns.map((_, i) => (
              <th
                key={i}
                className="sticky top-0 z-10 bg-[#d8dde3] border border-[#8a9aad] text-[#444] font-normal px-2 py-0.5 min-w-[110px]"
              >
                {letters[i] ?? i}
              </th>
            ))}
          </tr>
          <tr>
            <th className="sticky top-[21px] z-10 bg-[#eef1f5] border border-[#8a9aad] text-[#444]">#</th>
            {columns.map((col) => (
              <th
                key={col.key}
                className="sticky top-[21px] z-10 bg-[#eef1f5] border border-[#8a9aad] text-left px-2 py-1 font-bold text-[#111]"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="border border-[#8a9aad] text-center text-[#444] bg-[#fafaf6]" />
              <td
                colSpan={columns.length}
                className="border border-[#8a9aad] text-center text-[#777] italic py-4 bg-[#fafaf6]"
              >
                {emptyLabel}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr
                key={row.id ?? idx}
                className="hover:bg-[#e3ecfb] cursor-default"
                onDoubleClick={() => onRowDoubleClick?.(row)}
              >
                <td className="border border-[#8a9aad] text-center text-[#444] bg-[#eef1f5]">{idx + 1}</td>
                {columns.map((col) => (
                  <td key={col.key} className="border border-[#8a9aad] px-2 py-1 text-[#111] whitespace-nowrap">
                    {col.render ? col.render(row) : String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
