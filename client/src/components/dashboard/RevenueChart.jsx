import { useState } from 'react'
import { cn } from '../../utils/cn'
import { DataUnavailable, SectionCard } from './primitives'

const PERIODS = [
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]

export function RevenueChart({ className = '', chartData = null }) {
  const [period, setPeriod] = useState('monthly')

  return (
    <SectionCard
      title="Revenue"
      className={className}
      action={
        <div role="group" aria-label="Revenue period" className="inline-flex rounded-lg bg-slate-100 p-0.5">
          {PERIODS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={period === item.id}
              onClick={() => setPeriod(item.id)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-600',
                period === item.id
                  ? 'bg-white text-[#0B1A35] shadow-sm'
                  : 'text-slate-500 hover:text-[#0B1A35]'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      }
    >
      {chartData && chartData.length > 0 ? (
        <div className="flex h-72 flex-col justify-end gap-2 pt-4">
          <div className="flex h-56 items-end gap-3 px-2">
            {chartData.map((bar, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div
                  className="w-full rounded-t-md bg-indigo-500/80 transition-all hover:bg-indigo-600"
                  style={{ height: `${Math.max(12, bar.heightPercent)}%` }}
                  title={`${bar.label}: ₹${bar.value.toLocaleString()}`}
                />
                <span className="text-[10px] text-slate-400">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-200">
          <DataUnavailable message={`Revenue over time (${period}) appears once billing data is connected.`} />
        </div>
      )}
    </SectionCard>
  )
}
