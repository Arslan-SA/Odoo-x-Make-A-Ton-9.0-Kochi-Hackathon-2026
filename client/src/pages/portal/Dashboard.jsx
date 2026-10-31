import { useCallback, useEffect, useState } from 'react'
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Loader2,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import AppShell from '../../components/dashboard/AppShell'
import Modal from '../../components/internal/Modal'
import { useAuth } from '../../context/auth-context'
import { billingApi, portalApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { formatCurrency, formatDate } from '../../utils/format'

const STATUS_STYLES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  PAUSED: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  DRAFT: 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300',
  QUOTATION: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  CONFIRMED: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300',
  CLOSED: 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400',
  PAID: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  CANCELLED: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
        STATUS_STYLES[status] || 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0B1A35] disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
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

  // Pay Now Modal State
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [payMethod, setPayMethod] = useState('UPI')
  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState('')

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

  const handleOpenPay = (invoice) => {
    setSelectedInvoice(invoice)
    setPayMethod('UPI')
    setPayError('')
    setPayModalOpen(true)
  }

  const handleExecutePayment = async (e) => {
    e.preventDefault()
    if (!selectedInvoice) return
    try {
      setPaying(true)
      setPayError('')
      await billingApi.recordPayment({
        invoiceId: selectedInvoice._id,
        amount: selectedInvoice.balanceDue,
        method: payMethod,
        note: 'Customer Portal Self-Checkout',
      })
      setPayModalOpen(false)
      setNotice(`Payment of ${formatCurrency(selectedInvoice.balanceDue)} received! Invoice ${selectedInvoice.invNumber} is now marked as PAID.`)
      await loadPortal()
    } catch (err) {
      setPayError(getApiError(err, 'Payment processing failed.'))
    } finally {
      setPaying(false)
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
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              loadPortal()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-zinc-900 dark:text-red-400"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {notice && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
          {notice}
        </div>
      )}
      {actionError && (
        <div role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-[#0E0E12]">
          <Loader2 className="size-6 animate-spin text-indigo-600 dark:text-indigo-400" aria-label="Loading portal" />
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
                value: formatCurrency(summary?.totalDue ?? 0),
                icon: CalendarClock,
              },
            ].map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    {label}
                  </p>
                  <Icon className="size-4 text-indigo-500" aria-hidden="true" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-[#0B1A35] dark:text-white">Your subscriptions</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  Only subscriptions linked to {user?.email} are shown.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                {subscriptions.length} total
              </span>
            </div>

            {subscriptions.length === 0 ? (
              <p className="px-6 py-10 text-sm text-slate-500 dark:text-zinc-400">
                No subscriptions yet. Once your account has one, it will appear here.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
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
                          <p className="font-mono text-[11px] text-slate-400 dark:text-zinc-500">
                            {subscription.subNumber}
                          </p>
                          <h3 className="mt-0.5 text-sm font-semibold text-[#0B1A35] dark:text-white">
                            {plan.name || 'Subscription plan'}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
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
                          <dt className="text-slate-400 dark:text-zinc-500">Total</dt>
                          <dd className="mt-0.5 font-semibold text-[#0B1A35] dark:text-white">
                            {formatCurrency(subscription.grandTotal || 0)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400 dark:text-zinc-500">Started</dt>
                          <dd className="mt-0.5 text-slate-600 dark:text-zinc-300">{formatDate(subscription.startDate)}</dd>
                        </div>
                        <div>
                          <dt className="text-slate-400 dark:text-zinc-500">Next billing</dt>
                          <dd className="mt-0.5 text-slate-600 dark:text-zinc-300">
                            {subscription.isPaused
                              ? 'Paused'
                              : formatDate(subscription.nextBillingDate)}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-slate-400 dark:text-zinc-500">Expires</dt>
                          <dd className="mt-0.5 text-slate-600 dark:text-zinc-300">{formatDate(subscription.expiryDate)}</dd>
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
                            <p className="text-xs text-slate-400 dark:text-zinc-500">
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

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5 dark:border-zinc-800">
              <div>
                <h2 className="text-base font-semibold text-[#0B1A35] dark:text-white">Invoices</h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                  Issued to your account, newest first.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                {invoices.length} shown
              </span>
            </div>

            {invoices.length === 0 ? (
              <p className="px-6 py-10 text-sm text-slate-500 dark:text-zinc-400">
                No invoices yet. They will appear after your first billing cycle.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {invoices.map((invoice) => (
                  <li
                    key={invoice._id}
                    className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-mono text-xs text-slate-500 dark:text-zinc-400">{invoice.invNumber}</p>
                      <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                        Issued {formatDate(invoice.issueDate)} · Due {formatDate(invoice.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-sm font-semibold text-[#0B1A35] dark:text-white">
                          {formatCurrency(invoice.grandTotal || 0)}
                        </p>
                        <p
                          className={`text-xs ${
                            invoice.balanceDue > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {invoice.balanceDue > 0
                            ? `${formatCurrency(invoice.balanceDue)} due`
                            : 'Paid'}
                        </p>
                      </div>
                      <StatusBadge status={invoice.status} />
                      {invoice.balanceDue > 0 && (
                        <button
                          type="button"
                          onClick={() => handleOpenPay(invoice)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
                        >
                          <CreditCard className="size-3.5" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* Customer Pay Now Checkout Modal */}
      <Modal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Pay Invoice Online"
        description={`Direct settlement for invoice ${selectedInvoice?.invNumber}`}
      >
        <form onSubmit={handleExecutePayment} className="space-y-4">
          {payError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
              {payError}
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-zinc-800/40 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 dark:text-zinc-500">Invoice:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200">
                {selectedInvoice?.invNumber}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 dark:text-zinc-500">Due Date:</span>
              <span className="text-slate-700 dark:text-zinc-300">
                {formatDate(selectedInvoice?.dueDate)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-semibold dark:border-zinc-700">
              <span className="text-[#0B1A35] dark:text-white">Amount to Pay:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatCurrency(selectedInvoice?.balanceDue || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Select Payment Method
            </label>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { id: 'UPI', label: 'UPI / QR', desc: 'GPay, PhonePe, Paytm' },
                { id: 'CREDIT_CARD', label: 'Card', desc: 'Visa, Mastercard' },
                { id: 'BANK_TRANSFER', label: 'NetBanking', desc: 'Direct Transfer' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`rounded-xl border p-3 text-left transition-all ${
                    payMethod === m.id
                      ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                      : 'border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <p className="text-xs font-semibold text-[#0B1A35] dark:text-white">{m.label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400 dark:text-zinc-500">{m.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs text-indigo-700 dark:border-indigo-950/60 dark:bg-indigo-950/20 dark:text-indigo-300 flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>256-bit encrypted checkout with instant receipt generation.</span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={paying}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
            >
              {paying ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Pay {formatCurrency(selectedInvoice?.balanceDue || 0)}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
