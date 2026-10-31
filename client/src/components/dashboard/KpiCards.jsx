import {
  Activity,
  CircleDollarSign,
  FileText,
  Receipt,
  Repeat,
  Wallet,
} from 'lucide-react'

const KPI_CONFIG = [
  {
    key: 'totalRevenue',
    label: 'Total Revenue',
    icon: CircleDollarSign,
    format: (val) => (val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : null),
    hint: 'All time payments collected',
  },
  {
    key: 'activeSubscriptions',
    label: 'Active Subscriptions',
    icon: Repeat,
    format: (val) => (val !== undefined && val !== null ? Number(val).toLocaleString() : null),
    hint: 'Currently active contracts',
  },
  {
    key: 'mrr',
    label: 'Monthly Recurring Revenue',
    icon: Wallet,
    format: (val) => (val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : null),
    hint: 'Recurring monthly run rate',
  },
  {
    key: 'outstandingInvoices',
    label: 'Outstanding Invoices',
    icon: FileText,
    format: (val) => (val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : null),
    hint: 'Unpaid / pending balances',
  },
  {
    key: 'paymentsReceived',
    label: 'Payments Received',
    icon: Receipt,
    format: (val) => (val !== undefined && val !== null ? `₹${Number(val).toLocaleString()}` : null),
    hint: 'Verified settled transactions',
  },
  {
    key: 'churnRate',
    label: 'Churn Rate',
    icon: Activity,
    format: (val) => (val !== undefined && val !== null ? `${val}%` : null),
    hint: 'Cancelled subscriptions',
  },
]

function KpiCard({ label, icon: Icon, value, hint, index }) {
  const isConnected = value !== null && value !== undefined

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#121216] p-5 shadow-sm transition-all hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{label}</p>
        <span
          className="flex size-9 shrink-0 animate-icon-float items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 motion-reduce:animate-none"
          style={{ animationDelay: `${index * 400}ms` }}
        >
          <Icon className="size-4.5" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-[#0B1A35] dark:text-white">
        {isConnected ? value : '—'}
      </p>
      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-500">
        {isConnected ? hint : 'Not connected'}
      </p>
    </div>
  )
}

export function KpiCards({ data = null, loading = false }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {KPI_CONFIG.map((metric, index) => {
        const rawVal = data ? data[metric.key] : null
        const formattedVal = data && !loading ? metric.format(rawVal) : null

        return (
          <KpiCard
            key={metric.label}
            label={metric.label}
            icon={metric.icon}
            value={formattedVal}
            hint={metric.hint}
            index={index}
          />
        )
      })}
    </div>
  )
}
