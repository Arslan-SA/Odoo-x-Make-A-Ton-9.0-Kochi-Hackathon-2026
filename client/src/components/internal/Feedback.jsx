import { AlertTriangle, CheckCircle2, X } from 'lucide-react'

export function Notice({ tone = 'success', children, onDismiss }) {
  if (!children) return null

  const success = tone === 'success'
  const Icon = success ? CheckCircle2 : AlertTriangle

  return (
    <div
      role={success ? 'status' : 'alert'}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        success
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
          : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
      }`}
    >
      <span className="flex items-start gap-2">
        <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss message"
          className="rounded p-0.5 opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
