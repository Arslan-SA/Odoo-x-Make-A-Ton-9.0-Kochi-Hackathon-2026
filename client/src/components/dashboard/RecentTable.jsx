import { DataUnavailable, SectionCard, SectionLink } from './primitives'

export function RecentTable({
  title,
  columns,
  emptyMessage,
  viewAllHref,
  viewAllLabel = 'View all',
  rows = [],
  renderRow,
}) {
  const hasRows = rows && rows.length > 0

  return (
    <SectionCard title={title} action={<SectionLink label={viewAllLabel} href={viewAllHref} />}>
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
            <tr>
              {columns.map((column) => (
                <th key={column} scope="col" className="px-5 pb-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
            {hasRows ? (
              rows.map((row, idx) =>
                renderRow ? (
                  renderRow(row, idx)
                ) : (
                  <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {Object.values(row).map((val, cellIdx) => (
                      <td key={cellIdx} className="px-5 py-3 text-slate-700 dark:text-zinc-300">
                        {val}
                      </td>
                    ))}
                  </tr>
                )
              )
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-5">
                  <DataUnavailable message={emptyMessage} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}
