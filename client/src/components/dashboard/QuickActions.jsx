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
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          <Icon className="size-4 text-indigo-600" aria-hidden="true" />
          {label}
        </button>
      ))}
    </div>
  )
}
