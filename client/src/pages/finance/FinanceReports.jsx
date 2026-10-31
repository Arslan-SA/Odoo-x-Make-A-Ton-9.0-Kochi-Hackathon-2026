import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Loader2,
  PlayCircle,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react'
import InternalPage from '../../components/internal/InternalPage'
import Modal, { ConfirmDialog } from '../../components/internal/Modal'
import { Notice } from '../../components/internal/Feedback'
import { DataUnavailable, StatusBadge } from '../../components/dashboard/primitives'
import { billingApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { formatCurrency, formatDate } from '../../utils/format'

export default function FinanceReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Billing Engine State
  const [runModalOpen, setRunModalOpen] = useState(false)
  const [autoConfirm, setAutoConfirm] = useState(true)
  const [runningBilling, setRunningBilling] = useState(false)
  const [billingResult, setBillingResult] = useState(null)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const res = await billingApi.getDashboard()
      setData(res.data?.data || null)
      setError('')
    } catch (err) {
      setError(getApiError(err, 'Failed to load financial metrics.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const handleRunBilling = async () => {
    try {
      setRunningBilling(true)
      const res = await billingApi.runBillingDay({ autoConfirm })
      setBillingResult(res.data?.data || res.data)
      setNotice(
        `Billing Day complete! Processed ${res.data?.data?.processedCount || 0} subscriptions, created ${res.data?.data?.generatedInvoicesCount || 0} invoices.`
      )
      setRunModalOpen(false)
      loadDashboard()
    } catch (err) {
      setError(getApiError(err, 'Billing engine run failed.'))
    } finally {
      setRunningBilling(false)
    }
  }

  const kpis = data?.kpis || {}
  const statusBreakdown = data?.subscriptionsByStatus || []
  const overdueWatchlist = data?.overdueWatchlist || []

  // Efficiency calculation
  const totalBilled = (kpis.collectedRevenue || 0) + (kpis.outstandingOwed || 0)
  const collectionEfficiency =
    totalBilled > 0 ? Math.round(((kpis.collectedRevenue || 0) / totalBilled) * 100) : 100

  const arr = (kpis.activeRecurringValue || 0) * 12

  return (
    <InternalPage
      title="Finance Reports & Billing Engine"
      description="Automate recurring billing runs, track MRR velocity, and monitor collection health."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setRunModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:from-indigo-500 hover:to-violet-500"
          >
            <PlayCircle className="size-4" aria-hidden="true" />
            Run Billing Day Engine
          </button>
        </div>
      }
    >
      {notice && <Notice type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <Notice type="error" message={error} onRetry={loadDashboard} />}

      {/* Hero Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Collected Revenue
            </span>
            <span className="rounded-full bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">
            {formatCurrency(kpis.collectedRevenue || 0)}
          </p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <ArrowUpRight className="size-3" /> Reconciled into ledger
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Monthly Run Rate (MRR)
            </span>
            <span className="rounded-full bg-indigo-50 p-1.5 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">
            {formatCurrency(kpis.activeRecurringValue || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            ARR Run-rate: {formatCurrency(arr)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Outstanding Owed
            </span>
            <span className="rounded-full bg-amber-50 p-1.5 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
              <Clock className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-amber-600 dark:text-amber-400">
            {formatCurrency(kpis.outstandingOwed || 0)}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Pending collection from confirmed invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Collection Efficiency
            </span>
            <span className="rounded-full bg-sky-50 p-1.5 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <ShieldCheck className="size-4" />
            </span>
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">
            {collectionEfficiency}%
          </p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${Math.min(100, collectionEfficiency)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Automated Billing Engine Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-indigo-50/30 to-violet-50/50 p-6 shadow-sm dark:border-indigo-950/60 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-zinc-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              <Zap className="size-3" /> Automated Recurring Engine
            </div>
            <h3 className="mt-2 text-lg font-semibold text-[#0B1A35] dark:text-white">
              Billing Day Engine with Zero Double-Billing Guarantee
            </h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
              Processes all due active subscriptions, validates billing dates, calculates taxes & discounts,
              advances next billing dates, and generates invoices with unique cryptographic cycle keys.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRunModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/25 transition-all hover:bg-indigo-500 whitespace-nowrap"
          >
            <PlayCircle className="size-4" />
            Run Billing Engine Now
          </button>
        </div>
      </div>

      {/* Grid: Overdue Watchlist & Status Breakdown */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Overdue Watchlist (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-zinc-800/80">
            <div>
              <h3 className="text-sm font-semibold text-[#0B1A35] dark:text-white flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-500" />
                Overdue Watchlist
              </h3>
              <p className="text-xs text-slate-400 dark:text-zinc-500">
                Invoices that have exceeded payment terms and require follow-up.
              </p>
            </div>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              {overdueWatchlist.length} Accounts
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            {overdueWatchlist.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
                <p className="mt-2 text-sm font-medium text-slate-700 dark:text-zinc-300">
                  Zero overdue accounts!
                </p>
                <p className="text-xs text-slate-400 dark:text-zinc-500">
                  All customer invoices are currently paid or within their payment terms.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 dark:text-zinc-500 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <tr>
                    <th className="pb-2 font-medium">Invoice #</th>
                    <th className="pb-2 font-medium">Customer</th>
                    <th className="pb-2 font-medium">Due Date</th>
                    <th className="pb-2 font-medium">Balance Due</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                  {overdueWatchlist.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30">
                      <td className="py-2.5 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                        {inv.invNumber}
                      </td>
                      <td className="py-2.5">
                        <p className="font-medium text-slate-700 dark:text-zinc-200">
                          {inv.customerId?.name || 'Customer'}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {inv.customerId?.email}
                        </p>
                      </td>
                      <td className="py-2.5 text-rose-600 dark:text-rose-400 font-medium">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-2.5 font-semibold text-rose-600 dark:text-rose-400">
                        {formatCurrency(inv.balanceDue || inv.grandTotal)}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge tone="rose">OVERDUE</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Subscription Status Breakdown (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <h3 className="text-sm font-semibold text-[#0B1A35] dark:text-white flex items-center gap-2">
            <BarChart3 className="size-4 text-indigo-500" />
            Subscription Pipeline
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500">
            Active subscriptions and recurring volume by status.
          </p>

          <div className="mt-5 space-y-4">
            {statusBreakdown.map((item) => {
              const toneMap = {
                ACTIVE: 'emerald',
                CONFIRMED: 'blue',
                QUOTATION: 'amber',
                DRAFT: 'slate',
                CLOSED: 'slate',
              }
              const tone = toneMap[item._id] || 'slate'
              return (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-zinc-800/60 dark:bg-zinc-900/40"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge tone={tone}>{item._id}</StatusBadge>
                    <span className="font-mono text-xs font-semibold text-[#0B1A35] dark:text-white">
                      {item.count} subscriptions
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
                    <span>Recurring Value:</span>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                      {formatCurrency(item.mrr || 0)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Billing Run Modal */}
      <ConfirmDialog
        open={runModalOpen}
        title="Execute Billing Day Engine"
        message="This will evaluate all active subscriptions that are due for billing today, apply active discounts and taxes, advance next billing dates, and generate new invoices. Our billingCycleKey index guarantees that no customer is ever double-billed."
        confirmLabel="Run Billing Now"
        tone="primary"
        busy={runningBilling}
        onConfirm={handleRunBilling}
        onClose={() => setRunModalOpen(false)}
      />
    </InternalPage>
  )
}
