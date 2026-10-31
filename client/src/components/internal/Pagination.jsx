import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, pages, total, limit, busy, onPageChange }) {
  if (!total) return null

  const safePages = Math.max(1, pages || 1)
  const start = (page - 1) * limit + 1
  const end = Math.min(page * limit, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 dark:border-zinc-800/80">
      <p className="text-xs text-slate-500 dark:text-zinc-400">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={busy || page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <ChevronLeft className="size-3.5" aria-hidden="true" />
          Previous
        </button>
        <span className="px-1 text-xs font-medium text-slate-500 dark:text-zinc-400">
          Page {page} of {safePages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={busy || page >= safePages}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Next
          <ChevronRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
