import { FilePlus, FileText, Repeat, Wallet } from 'lucide-react'

const ACTIONS = [
  { label: 'Create Subscription', icon: Repeat },
  { label: 'Create Quotation', icon: FilePlus },
  { label: 'Create Invoice', icon: FileText },
  { label: 'Record Payment', icon: Wallet },
]

export function QuickActions({ onAction }) {
  return (
    <div className="flex flex-wrap gap-3">
      {ACTIONS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAction && onAction(label)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-zinc-300 shadow-sm transition-all hover:border-indigo-200 dark:hover:border-indigo-500/40 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Icon className="size-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
