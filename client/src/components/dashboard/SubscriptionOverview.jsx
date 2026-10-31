import { SectionCard, SectionLink, StatusBadge } from './primitives'

const SUBSCRIPTION_STATUSES = [
  { key: 'ACTIVE', label: 'Active', tone: 'emerald' },
  { key: 'CONFIRMED', label: 'Confirmed', tone: 'blue' },
  { key: 'QUOTATION', label: 'Quotation', tone: 'amber' },
  { key: 'DRAFT', label: 'Draft', tone: 'slate' },
  { key: 'CLOSED', label: 'Closed', tone: 'slate' },
]

export function SubscriptionOverview({ statusCounts = null }) {
  return (
    <SectionCard
      title="Subscription overview"
      action={<SectionLink label="View all subscriptions" href="/subscriptions" />}
    >
      <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80">
        {SUBSCRIPTION_STATUSES.map((status) => {
          const count = statusCounts ? statusCounts[status.key] : null
          const hasCount = count !== undefined && count !== null

          return (
            <li key={status.label} className="flex items-center justify-between py-3">
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
              <span className={`text-sm font-semibold ${hasCount ? 'text-[#0B1A35] dark:text-white' : 'text-slate-400 dark:text-zinc-600'}`}>
                {hasCount ? Number(count).toLocaleString() : '—'}
              </span>
            </li>
          )
        })}
      </ul>
    </SectionCard>
  )
}
