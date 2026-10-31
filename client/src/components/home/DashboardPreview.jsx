import { TrendingUp } from 'lucide-react'

const METRICS = [
  { label: 'Active Subscriptions', value: '1,284', delta: '+6.2%' },
  { label: 'Revenue Collected', value: '$84,320', delta: '+12.4%' },
  { label: 'Outstanding Invoices', value: '$3,910', delta: '-2.1%' },
]

const REVENUE = [
  { month: 'May', value: 52 },
  { month: 'Jun', value: 58 },
  { month: 'Jul', value: 55 },
  { month: 'Aug', value: 66 },
  { month: 'Sep', value: 72 },
  { month: 'Oct', value: 80 },
  { month: 'Nov', value: 92 },
]

const INVOICES = [
  { customer: 'Northwind Labs', plan: 'Growth', amount: '$299', status: 'Paid' },
  { customer: 'Acme Studio', plan: 'Starter', amount: '$49', status: 'Pending' },
  { customer: 'Lumen Health', plan: 'Scale', amount: '$899', status: 'Paid' },
]

export default function DashboardPreview({ className = '' }) {
  const maxRevenue = Math.max(...REVENUE.map((entry) => entry.value))

  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 ${className}`}
      aria-label="Brightloop dashboard preview with sample data"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">Overview</p>
          <p className="text-sm font-semibold text-[#0B1A35]">Last 7 months</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
          Live sample
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition-shadow hover:shadow-md"
          >
            <p className="text-xs text-slate-500">{metric.label}</p>
            <p className="mt-1 text-lg font-semibold tracking-tight text-[#0B1A35]">{metric.value}</p>
            <p
              className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${
                metric.delta.startsWith('-') ? 'text-rose-500' : 'text-emerald-600'
              }`}
            >
              <TrendingUp className="size-3" aria-hidden="true" />
              {metric.delta}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-slate-100 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0B1A35]">Revenue Chart</p>
          <p className="text-xs text-slate-500">Monthly</p>
        </div>
        <div className="flex h-36 items-end gap-2.5" role="img" aria-label="Monthly revenue bar chart">
          {REVENUE.map((entry, index) => (
            <div key={entry.month} className="flex h-full flex-1 flex-col items-center gap-2">
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md transition-all duration-500 hover:opacity-80 ${
                    index === REVENUE.length - 1
                      ? 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                      : 'bg-indigo-100'
                  }`}
                  style={{ height: `${(entry.value / maxRevenue) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">{entry.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-[#0B1A35]">Recent Invoices</p>
        <ul className="divide-y divide-slate-100">
          {INVOICES.map((invoice) => (
            <li key={invoice.customer} className="flex items-center justify-between py-2.5 text-sm">
              <div>
                <p className="font-medium text-slate-800">{invoice.customer}</p>
                <p className="text-xs text-slate-500">{invoice.plan} plan</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-800">{invoice.amount}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    invoice.status === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
