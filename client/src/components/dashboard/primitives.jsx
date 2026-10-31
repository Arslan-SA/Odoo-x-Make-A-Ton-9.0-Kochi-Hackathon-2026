import { Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { isRouteAvailable } from './nav'

export function SectionCard({ title, action, className = '', children }) {
  return (
    <section className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
      <header className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-[#0B1A35]">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

export function DataUnavailable({ message }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <Inbox className="size-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-medium text-[#0B1A35]">No data yet</p>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
    </div>
  )
}

export function SectionLink({ label, href }) {
  if (!isRouteAvailable(href)) {
    return (
      <span
        aria-disabled="true"
        title="Not available yet"
        className="cursor-not-allowed text-sm font-medium text-slate-400"
      >
        {label}
      </span>
    )
  }
  return (
    <Link to={href} className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500">
      {label}
    </Link>
  )
}

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  slate: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
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
