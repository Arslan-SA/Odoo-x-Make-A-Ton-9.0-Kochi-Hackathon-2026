import { useEffect, useState } from 'react'
import {
  AlertCircle,
  CalendarClock,
  CreditCard,
  FileText,
  Loader2,
  PlayCircle,
  RefreshCw,
} from 'lucide-react'
import InternalPage from '../../components/internal/InternalPage'
import Modal, { ConfirmDialog } from '../../components/internal/Modal'
import Pagination from '../../components/internal/Pagination'
import { Notice } from '../../components/internal/Feedback'
import { Checkbox, inputClass } from '../../components/internal/FormControls'
import { DataUnavailable, StatusBadge } from '../../components/dashboard/primitives'
import { billingApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  invoiceStatusTone,
} from '../../utils/format'

const PAGE_SIZE = 20
const INVOICE_STATUSES = ['DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED']

function InvoiceTable({ invoices, loading, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[58rem] text-left text-sm">
        <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          <tr>
            <th scope="col" className="px-5 pb-3 font-medium">Invoice</th>
            <th scope="col" className="px-5 pb-3 font-medium">Customer</th>
            <th scope="col" className="px-5 pb-3 font-medium">Subscription</th>
            <th scope="col" className="px-5 pb-3 font-medium">Amount</th>
            <th scope="col" className="px-5 pb-3 font-medium">Due date</th>
            <th scope="col" className="px-5 pb-3 font-medium">Status</th>
            <th scope="col" className="px-5 pb-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center">
                <Loader2
                  className="mx-auto size-6 animate-spin text-indigo-600 dark:text-indigo-400"
                  aria-label="Loading invoices"
                />
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5">
                <DataUnavailable message="No invoices match the current filters." />
              </td>
            </tr>
          ) : (
            invoices.map((invoice) => (
              <tr
                key={invoice._id}
                className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
              >
                <td className="px-5 py-3">
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {invoice.invNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                    Issued {formatDate(invoice.issueDate)}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-slate-700 dark:text-zinc-300">
                    {invoice.customerId?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {invoice.customerId?.email || ''}
                  </p>
                </td>
                <td className="px-5 py-3 font-mono text-xs text-slate-500 dark:text-zinc-400">
                  {invoice.subscriptionId?.subNumber || '—'}
                </td>
                <td className="px-5 py-3">
                  <p className="font-medium text-[#0B1A35] dark:text-white">
                    {formatCurrency(invoice.grandTotal)}
                  </p>
                  {Number(invoice.balanceDue) > 0 && (
                    <p className="text-xs text-slate-400 dark:text-zinc-500">
                      Balance {formatCurrency(invoice.balanceDue)}
                    </p>
                  )}
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-slate-600 dark:text-zinc-400">
                    {formatDate(invoice.dueDate)}
                  </p>
                  {invoice.isOverdue && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700 ring-1 ring-inset ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-500/20">
                      <AlertCircle className="size-3" aria-hidden="true" />
                      Overdue
                    </span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge tone={invoiceStatusTone(invoice.status)}>
                    {invoice.status}
                  </StatusBadge>
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onView(invoice)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default function Invoices() {
  const [query, setQuery] = useState({ page: 1, status: '', overdueOnly: false })
  const [invoices, setInvoices] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')

  const [runConfirmOpen, setRunConfirmOpen] = useState(false)
  const [runBusy, setRunBusy] = useState(false)
  const [runSummary, setRunSummary] = useState(null)

  useEffect(() => {
    let active = true

    billingApi
      .getInvoices({
        page: query.page,
        limit: PAGE_SIZE,
        ...(query.status ? { status: query.status } : {}),
        ...(query.overdueOnly ? { overdueOnly: true } : {}),
      })
      .then(({ data }) => {
        if (!active) return
        setInvoices(data.data || [])
        setMeta(data.meta || { total: 0, page: query.page, pages: 0 })
        setError('')
      })
      .catch((err) => {
        if (active) setError(getApiError(err, 'Could not load invoices.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query.page, query.status, query.overdueOnly, reloadKey])

  const openInvoice = async (invoice) => {
    setDetail(invoice)
    setDetailOpen(true)
    setDetailLoading(true)
    setDetailError('')

    try {
      const { data } = await billingApi.getInvoiceById(invoice._id)
      setDetail(data.data)
    } catch (err) {
      setDetailError(getApiError(err, 'Could not load invoice details.'))
    } finally {
      setDetailLoading(false)
    }
  }

  const runBillingDay = async () => {
    setRunBusy(true)
    setRunSummary(null)
    try {
      const { data } = await billingApi.runBillingDay({ autoConfirm: true })
      setRunSummary(data.summary || {})
      setRunConfirmOpen(false)
      setNotice('Billing Day Engine completed.')
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (err) {
      setError(getApiError(err, 'Could not run the Billing Day Engine.'))
      setRunConfirmOpen(false)
    } finally {
      setRunBusy(false)
    }
  }

  return (
    <InternalPage
      title="Invoices"
      description="Review billed subscriptions, overdue balances and the billing engine output. Invoice data is paginated on the server."
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              setLoading(true)
              setReloadKey((value) => value + 1)
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setRunConfirmOpen(true)}
            disabled={runBusy}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {runBusy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <PlayCircle className="size-4" aria-hidden="true" />
            )}
            {runBusy ? 'Running billing…' : 'Run Billing Day Engine'}
          </button>
        </>
      }
    >
      <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>
      <Notice tone="success" onDismiss={() => setNotice('')}>{notice}</Notice>

      {runSummary && (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              <CalendarClock className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">
                Billing Day summary
              </h3>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <p className="rounded-xl bg-white/70 px-3 py-2 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  Processed <strong>{runSummary.processed ?? 0}</strong>
                </p>
                <p className="rounded-xl bg-white/70 px-3 py-2 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  Invoices created <strong>{runSummary.invoicesCreated ?? 0}</strong>
                </p>
                <p className="rounded-xl bg-white/70 px-3 py-2 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  Duplicates skipped <strong>{runSummary.skippedDuplicates ?? 0}</strong>
                </p>
                <p className="rounded-xl bg-white/70 px-3 py-2 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                  Subscriptions closed <strong>{runSummary.autoClosedSubscriptions ?? 0}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setRunSummary(null)}
              className="text-xs font-medium text-indigo-700 underline-offset-2 hover:underline dark:text-indigo-300"
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-[#121216]">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-zinc-800/80">
          <select
            value={query.status}
            disabled={query.overdueOnly}
            onChange={(event) => {
              setLoading(true)
              setQuery((current) => ({ ...current, page: 1, status: event.target.value }))
            }}
            aria-label="Filter by invoice status"
            className={`${inputClass} sm:w-56`}
          >
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Checkbox
            id="overdue-only"
            label="Overdue only"
            checked={query.overdueOnly}
            onChange={(event) => {
              setLoading(true)
              setQuery((current) => ({
                ...current,
                page: 1,
                overdueOnly: event.target.checked,
                status: event.target.checked ? '' : current.status,
              }))
            }}
          />
          {query.overdueOnly && (
            <span className="text-xs text-amber-600 dark:text-amber-300">
              Showing confirmed invoices past their due date.
            </span>
          )}
          {loading && (
            <Loader2
              className="size-4 animate-spin text-indigo-600 dark:text-indigo-400"
              aria-label="Loading"
            />
          )}
          <span className="ml-auto text-xs text-slate-400 dark:text-zinc-500">
            {meta.total || 0} invoice{meta.total === 1 ? '' : 's'}
          </span>
        </div>

        <InvoiceTable invoices={invoices} loading={loading} onView={openInvoice} />
        <Pagination
          page={meta.page || query.page}
          pages={meta.pages}
          total={meta.total}
          limit={PAGE_SIZE}
          busy={loading}
          onPageChange={(page) => {
            setLoading(true)
            setQuery((current) => ({ ...current, page }))
          }}
        />
      </section>

      <Modal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detail ? `Invoice ${detail.invNumber}` : 'Invoice details'}
        description={detail ? `${detail.customerId?.name || 'Customer'} · ${detail.status}` : 'Loading invoice details...'}
        size="xl"
      >
        {detailLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2
              className="size-6 animate-spin text-indigo-600 dark:text-indigo-400"
              aria-label="Loading invoice details"
            />
          </div>
        ) : detailError ? (
          <Notice tone="error">{detailError}</Notice>
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Issue date', formatDate(detail.issueDate)],
                ['Due date', formatDate(detail.dueDate)],
                ['Grand total', formatCurrency(detail.grandTotal)],
                ['Balance due', formatCurrency(detail.balanceDue)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-zinc-800/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0B1A35] dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <FileText className="size-3.5" aria-hidden="true" />
                Subscription {detail.subscriptionId?.subNumber || '—'}
              </span>
              {detail.subscriptionId?.paymentTerms && (
                <span>Terms: {detail.subscriptionId.paymentTerms}</span>
              )}
              <StatusBadge tone={invoiceStatusTone(detail.status)}>{detail.status}</StatusBadge>
              {detail.status === 'CONFIRMED' && new Date(detail.dueDate) < new Date() && (
                <StatusBadge tone="rose">OVERDUE</StatusBadge>
              )}
            </div>

            <div>
              <h3 className="mb-2 text-sm font-semibold text-[#0B1A35] dark:text-white">Line items</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
                <table className="w-full min-w-[38rem] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-zinc-800/40 dark:text-zinc-400">
                    <tr>
                      <th scope="col" className="px-4 py-2.5 font-medium">Product</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Variant</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Qty</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Unit price</th>
                      <th scope="col" className="px-4 py-2.5 font-medium">Tax</th>
                      <th scope="col" className="px-4 py-2.5 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                    {(detail.lines || []).map((line, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.productName}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">{line.variantValue || '—'}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.quantity}</td>
                        <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">
                          {line.taxRate || 0}% ({formatCurrency(line.taxAmount)})
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-[#0B1A35] dark:text-white">{formatCurrency(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-zinc-800/40">
                <p className="flex justify-between gap-4 text-slate-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#0B1A35] dark:text-white">{formatCurrency(detail.subtotal)}</span>
                </p>
                <p className="flex justify-between gap-4 text-slate-500 dark:text-zinc-400">
                  <span>Discount</span>
                  <span className="font-medium text-[#0B1A35] dark:text-white">−{formatCurrency(detail.discountTotal)}</span>
                </p>
                <p className="flex justify-between gap-4 text-slate-500 dark:text-zinc-400">
                  <span>Tax</span>
                  <span className="font-medium text-[#0B1A35] dark:text-white">{formatCurrency(detail.taxTotal)}</span>
                </p>
                <p className="flex justify-between gap-4 border-t border-slate-200 pt-1.5 text-slate-600 dark:border-zinc-700 dark:text-zinc-300">
                  <span>Grand total</span>
                  <span className="font-semibold text-[#0B1A35] dark:text-white">{formatCurrency(detail.grandTotal)}</span>
                </p>
                <p className="flex justify-between gap-4 text-slate-500 dark:text-zinc-400">
                  <span>Paid</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-300">{formatCurrency(detail.paidAmount)}</span>
                </p>
                <p className="flex justify-between gap-4 text-slate-500 dark:text-zinc-400">
                  <span>Balance</span>
                  <span className="font-medium text-rose-600 dark:text-rose-300">{formatCurrency(detail.balanceDue)}</span>
                </p>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#0B1A35] dark:text-white">
                  <CreditCard className="size-4" aria-hidden="true" />
                  Payments
                </h3>
                {detail.payments?.length ? (
                  <div className="space-y-2">
                    {detail.payments.map((payment) => (
                      <div
                        key={payment._id}
                        className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm dark:border-zinc-800"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-[#0B1A35] dark:text-white">{formatCurrency(payment.amount)}</span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500">{payment.method}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                          {formatDateTime(payment.paymentDate)}
                          {payment.note ? ` · ${payment.note}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
                    No payments recorded for this invoice.
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={runConfirmOpen}
        title="Run Billing Day Engine?"
        message="This will generate invoices for every active subscription due today, advance billing dates and auto-close eligible subscriptions. Duplicate cycles are skipped by the backend."
        confirmLabel="Run billing"
        tone="primary"
        busy={runBusy}
        onConfirm={runBillingDay}
        onClose={() => setRunConfirmOpen(false)}
      />
    </InternalPage>
  )
}
