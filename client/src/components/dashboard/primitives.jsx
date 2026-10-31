import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { isRouteAvailable } from './nav'

export function SectionCard({ title, action, className = '', children }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] shadow-sm transition-colors', className)}>
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800/80 px-5 py-4">
        <h2 className="text-sm font-semibold text-[#0B1A35] dark:text-white">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function DataUnavailable({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-zinc-800/70 text-slate-500 dark:text-zinc-400">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-[#0B1A35] dark:text-white">No data yet</p>
      <p className="max-w-xs text-sm text-slate-500 dark:text-zinc-400">{message}</p>
    </div>
  )
}

export function SectionLink({ label, href }) {
  if (!isRouteAvailable(href)) {
    return (
      <span
        aria-disabled="true"
        title="Not available yet"
        className="cursor-not-allowed text-sm font-medium text-slate-400 dark:text-zinc-600"
      >
        {label}
      </span>
    )
  }
  return (
    <Link to={href} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors hover:text-indigo-500 dark:hover:text-indigo-300">
      {label}
    </Link>
  )
}

const TONES = {
  emerald: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-emerald-600/20 dark:ring-emerald-500/20',
  blue: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-blue-600/20 dark:ring-blue-500/20',
  amber: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 ring-amber-600/20 dark:ring-amber-500/20',
  slate: 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 ring-slate-500/20 dark:ring-zinc-700/40',
  rose: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 ring-rose-600/20 dark:ring-rose-500/20',
}

export function StatusBadge({ tone = 'slate', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        TONES[tone] || TONES.slate
      )}
    >
      {children}
    </span>
  )
}
