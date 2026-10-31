import { useCallback, useEffect, useState } from 'react'
import {
  CalendarClock,
  CreditCard,
  FileText,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  XCircle,
} from 'lucide-react'
import AppShell from '../../components/dashboard/AppShell'
import { useAuth } from '../../context/auth-context'
import { portalApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700',
  PAUSED: 'bg-amber-50 text-amber-700',
  DRAFT: 'bg-slate-100 text-slate-600',
  QUOTATION: 'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-sky-50 text-sky-700',
  CLOSED: 'bg-slate-100 text-slate-500',
  PAID: 'bg-emerald-50 text-emerald-700',
  CANCELLED: 'bg-rose-50 text-rose-700',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {status}
    </span>
  )
}

function ActionButton({ label, icon: Icon, disabled, title, busy, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || busy}
      title={title}
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0B1A35] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? (
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
      ) : (
        <Icon className="size-3.5" aria-hidden="true" />
      )}
      {label}
    </button>
  )
}

export default function PortalDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const [activeAction, setActiveAction] = useState('')

  const loadPortal = useCallback(async () => {
    try {
      const { data: response } = await portalApi.getOverview()
      setData(response.data)
      setError('')
    } catch (err) {
      setError(getApiError(err, 'Could not load your portal.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    portalApi
      .getOverview()
      .then(({ data }) => {
        if (!active) return
        setData(data.data)
        setError('')
      })
      .catch((err) => {
        if (active) setError(getApiError(err, 'Could not load your portal.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const runAction = async (subscription, action) => {
    setActiveAction(`${subscription._id}:${action}`)
    setActionError('')
    setNotice('')
    try {
      const { data: response } = await portalApi.lifecycleAction(subscription._id, action)
      setNotice(response.message)
      await loadPortal()
    } catch (err) {
      setActionError(getApiError(err, 'Could not update this subscription.'))
    } finally {
      setActiveAction('')
    }
  }

  const firstName = user?.name?.split(' ')[0] || 'there'
  const summary = data?.summary
  const subscriptions = data?.subscriptions || []
  const invoices = data?.invoices || []

  return (
    <AppShell
      eyebrow="Customer portal"
      title={`Welcome, ${firstName}`}
      description="Your own subscriptions and invoices, scoped to your account. Pause, resume, renew or close a plan without contacting support."
    >
      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              loadPortal()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}
      {actionError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="size-6 animate-spin text-indigo-600" aria-label="Loading portal" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Active subscriptions',
                value: summary?.activeSubscriptions ?? 0,
                icon: CreditCard,
              },
              {
                label: 'Paused',
                value: summary?.pausedSubscriptions ?? 0,
                icon: Pause,
              },
              {
                label: 'Open invoices',
                value: summary?.openInvoices ?? 0,
                icon: FileText,
              },
              {
                label: 'Total due',
                value: currency.format(summary?.totalDue ?? 0),
                icon: CalendarClock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {label}
                  </p>
                  <Icon className="size-4 text-indigo-500" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#0B1A35]">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold">Your subscriptions</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Only subscriptions linked to {user?.email} are shown.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {subscriptions.length} total
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <p className="px-6 py-10 text-sm text-slate-500">
                No subscriptions yet. Once your account has one, it will appear here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {subscriptions.map((subscription) => {
                  const plan = subscription.planId || {}
                  const isActive = subscription.status === 'ACTIVE'
                  const beforeExpiry =
                    !subscription.expiryDate ||
                    new Date(subscription.expiryDate) > new Date()
                  const closeBlocked =
                    isActive && beforeExpiry && plan.canCloseEarly === false
                  const canPause = isActive && !subscription.isPaused && plan.canPause
                  const canResume = isActive && subscription.isPaused
                  const canRenew =
                    plan.canRenew && (subscription.status === 'CLOSED' || isActive)
                  const canClose =
                    ['ACTIVE', 'CONFIRMED'].includes(subscription.status) && !closeBlocked

                  return (
                    <article key={subscription._id} className="px-6 py-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[11px] text-slate-400">
                            {subscription.subNumber}
                          </p>
                          <h3 className="mt-0.5 text-sm font-semibold">
                            {plan.name || 'Subscription plan'}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {plan.billingCycle ? `${plan.billingCycle} billing` : 'Recurring billing'}
                            {subscription.lines?.length
                              ? ` · ${subscription.lines.length} line${subscription.lines.length === 1 ? '' : 's'}`
                              : ''}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge status={subscription.status} />
                          {subscription.isPaused && <StatusBadge status="PAUSED" />}
                        </div>
                      </div>

                      <dl className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                        <div>
                          <dt className="text-slate-400">Total</dt>
                          <dd className="mt-0.5 font-semibold text-[#0B1A35]">
                            {currency.format(subscription.grandTotal || 0)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Started</dt>
                          <dd className="mt-0.5">{formatDate(subscription.startDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Next billing</dt>
                          <dd className="mt-0.5">
                            {subscription.isPaused
                              ? 'Paused'
                              : formatDate(subscription.nextBillingDate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400">Expires</dt>
                          <dd className="mt-0.5">{formatDate(subscription.expiryDate)}</dd>
                        </div>
                      </dl>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {canPause && (
                          <ActionButton
                            action="PAUSE"
                            label="Pause"
                            icon={Pause}
                            busy={activeAction === `${subscription._id}:PAUSE`}
                            onClick={() => runAction(subscription, 'PAUSE')}
                          />
                        )}
                        {canResume && (
                          <ActionButton
                            action="RESUME"
                            label="Resume"
                            icon={Play}
                            busy={activeAction === `${subscription._id}:RESUME`}
                            onClick={() => runAction(subscription, 'RESUME')}
                          />
                        )}
                        {canRenew && (
                          <ActionButton
                            action="RENEW"
                            label="Renew"
                            icon={RotateCw}
                            busy={activeAction === `${subscription._id}:RENEW`}
                            onClick={() => runAction(subscription, 'RENEW')}
                          />
                        )}
                        {canClose && (
                          <ActionButton
                            action="CLOSE"
                            label="Close"
                            icon={XCircle}
                            busy={activeAction === `${subscription._id}:CLOSE`}
                            onClick={() => runAction(subscription, 'CLOSE')}
                          />
                        )}
                        {closeBlocked && (
                          <ActionButton
                            action="CLOSE"
                            label="Close"
                            icon={XCircle}
                            disabled
                            title="This plan does not allow closing before the expiry date."
                            onClick={() => {}}
                          />
                        )}
                        {!canPause &&
                          !canResume &&
                          !canRenew &&
                          !canClose &&
                          !closeBlocked && (
                            <p className="text-xs text-slate-400">
                              No self-service actions available.
                            </p>
                          )}
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-base font-semibold">Invoices</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Issued to your account, newest first.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {invoices.length} shown
              </span>
            </div>

            {invoices.length === 0 ? (
              <p className="px-6 py-10 text-sm text-slate-500">
                No invoices yet. They will appear after your first billing cycle.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {invoices.map((invoice) => (
                  <li
                    key={invoice._id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-mono text-xs text-slate-500">{invoice.invNumber}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-sm font-semibold text-[#0B1A35]">
                          {currency.format(invoice.grandTotal || 0)}
                        </p>
                        <p
                          className={`text-xs ${
                            invoice.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          {invoice.balanceDue > 0
                            ? `${currency.format(invoice.balanceDue)} due`
                            : 'Paid'}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AppShell>
  )
}
