import { useEffect, useMemo, useState } from 'react'
import {
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  Filter,
  Loader2,
  Plus,
  Receipt,
  RefreshCw,
  Search,
} from 'lucide-react'
import InternalPage from '../../components/internal/InternalPage'
import Modal from '../../components/internal/Modal'
import { Notice } from '../../components/internal/Feedback'
import { Field, inputClass } from '../../components/internal/FormControls'
import { DataUnavailable, StatusBadge } from '../../components/dashboard/primitives'
import { billingApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format'

const PAYMENT_METHODS = [
  { value: 'BANK_TRANSFER', label: 'Bank Transfer (NEFT/RTGS/IMPS)' },
  { value: 'CREDIT_CARD', label: 'Credit / Debit Card' },
  { value: 'UPI', label: 'UPI / NetBanking' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CHEQUE', label: 'Cheque' },
]

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  // Record Payment Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [unpaidInvoices, setUnpaidInvoices] = useState([])
  const [invoicesLoading, setInvoicesLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [paymentForm, setPaymentForm] = useState({
    invoiceId: '',
    amount: '',
    method: 'BANK_TRANSFER',
    paymentDate: new Date().toISOString().split('T')[0],
    note: '',
  })

  // Load Payments
  const loadPayments = async () => {
    try {
      setLoading(true)
      const res = await billingApi.getPayments()
      setPayments(res.data?.data || [])
      setError('')
    } catch (err) {
      setError(getApiError(err, 'Failed to load payments.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPayments()
  }, [])

  // Open Record Payment Modal & Fetch open invoices
  const handleOpenModal = async () => {
    setModalOpen(true)
    setFormError('')
    setPaymentForm({
      invoiceId: '',
      amount: '',
      method: 'BANK_TRANSFER',
      paymentDate: new Date().toISOString().split('T')[0],
      note: '',
    })

    try {
      setInvoicesLoading(true)
      const res = await billingApi.getInvoices({ limit: 100 })
      const list = res.data?.data?.invoices || res.data?.data || []
      // Show invoices that have balance due or confirmed status
      const eligible = list.filter(
        (inv) => inv.status !== 'CANCELLED' && (inv.status === 'CONFIRMED' || inv.balanceDue > 0)
      )
      setUnpaidInvoices(eligible)
    } catch (err) {
      setFormError('Failed to load eligible invoices.')
    } finally {
      setInvoicesLoading(false)
    }
  }

  // When invoice selection changes, auto-set amount to its balanceDue
  const handleInvoiceChange = (invoiceId) => {
    const selected = unpaidInvoices.find((i) => i._id === invoiceId)
    setPaymentForm((prev) => ({
      ...prev,
      invoiceId,
      amount: selected ? selected.balanceDue || selected.grandTotal : '',
    }))
  }

  // Submit Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    if (!paymentForm.invoiceId) {
      setFormError('Please select an invoice.')
      return
    }
    const amt = Number(paymentForm.amount)
    if (!amt || amt <= 0) {
      setFormError('Please enter a valid positive amount.')
      return
    }

    try {
      setSaving(true)
      setFormError('')
      const res = await billingApi.recordPayment({
        invoiceId: paymentForm.invoiceId,
        amount: amt,
        method: paymentForm.method,
        paymentDate: paymentForm.paymentDate,
        note: paymentForm.note,
      })

      setNotice(
        `Payment of ${formatCurrency(amt)} recorded successfully! Invoice status updated.`
      )
      setModalOpen(false)
      loadPayments()
    } catch (err) {
      setFormError(getApiError(err, 'Failed to record payment.'))
    } finally {
      setSaving(false)
    }
  }

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = search.toLowerCase()
      const invNum = p.invoiceId?.invNumber?.toLowerCase() || ''
      const custName = p.customerId?.name?.toLowerCase() || ''
      const custEmail = p.customerId?.email?.toLowerCase() || ''
      const note = p.note?.toLowerCase() || ''
      const matchesSearch =
        !q ||
        invNum.includes(q) ||
        custName.includes(q) ||
        custEmail.includes(q) ||
        note.includes(q)
      const matchesMethod = !methodFilter || p.method === methodFilter
      return matchesSearch && matchesMethod
    })
  }, [payments, search, methodFilter])

  // Summary Metrics
  const totalCollected = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0)
  }, [payments])

  const selectedInvoice = unpaidInvoices.find((i) => i._id === paymentForm.invoiceId)

  return (
    <InternalPage
      title="Payments & Reconciliation"
      description="Track collected customer revenue, manage payment receipts, and reconcile outstanding invoices."
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500"
          >
            <Plus className="size-4" aria-hidden="true" />
            Record Payment
          </button>
        </div>
      }
    >
      {notice && <Notice type="success" message={notice} onClose={() => setNotice('')} />}
      {error && <Notice type="error" message={error} onRetry={loadPayments} />}

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Total Revenue Collected
            </span>
            <Banknote className="size-4 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalCollected)}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Directly reconciled against invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Total Transactions
            </span>
            <Receipt className="size-4 text-indigo-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">
            {payments.length}
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            All successful transactions logged
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-400">
              Primary Gateway
            </span>
            <CreditCard className="size-4 text-indigo-500" aria-hidden="true" />
          </div>
          <p className="mt-2 text-2xl font-semibold text-[#0B1A35] dark:text-white">
            Bank & UPI
          </p>
          <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
            Instant settlement & zero fraud chargebacks
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]">
        {/* Filters */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800/80">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search by customer, invoice #, note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs text-[#0B1A35] placeholder-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="size-4 text-slate-400 dark:text-zinc-500" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200"
            >
              <option value="">All Payment Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[50rem] text-left text-sm">
            <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800">
              <tr>
                <th scope="col" className="px-5 py-3.5">Reference</th>
                <th scope="col" className="px-5 py-3.5">Invoice</th>
                <th scope="col" className="px-5 py-3.5">Customer</th>
                <th scope="col" className="px-5 py-3.5">Amount</th>
                <th scope="col" className="px-5 py-3.5">Method</th>
                <th scope="col" className="px-5 py-3.5">Payment Date</th>
                <th scope="col" className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Loader2 className="mx-auto size-6 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8">
                    <DataUnavailable message="No payments found matching your criteria." />
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p._id}
                    className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                      {p._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {p.invoiceId?.invNumber || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-zinc-300">
                        {p.customerId?.name || 'Customer'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-zinc-500">
                        {p.customerId?.email || ''}
                      </p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(p.amount)}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 dark:text-zinc-400">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 dark:text-zinc-400">
                      {formatDateTime(p.paymentDate)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge tone="emerald">PAID</StatusBadge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Manual Payment"
        description="Select an outstanding invoice and log a payment against it."
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          {formError && <Notice type="error" message={formError} />}

          <Field label="Select Invoice" required>
            {invoicesLoading ? (
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Loader2 className="size-4 animate-spin" /> Loading eligible invoices...
              </div>
            ) : unpaidInvoices.length === 0 ? (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                No unpaid or confirmed invoices found. All invoices are currently paid!
              </p>
            ) : (
              <select
                value={paymentForm.invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">-- Choose an Invoice to settle --</option>
                {unpaidInvoices.map((inv) => (
                  <option key={inv._id} value={inv._id}>
                    {inv.invNumber} · {inv.customerId?.name || 'Customer'} · Due: {formatCurrency(inv.balanceDue || inv.grandTotal)}
                  </option>
                ))}
              </select>
            )}
          </Field>

          {selectedInvoice && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-zinc-800/40 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-medium text-slate-700 dark:text-zinc-200">
                  {selectedInvoice.customerId?.name} ({selectedInvoice.customerId?.email})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Invoice Total:</span>
                <span className="font-medium text-slate-700 dark:text-zinc-200">
                  {formatCurrency(selectedInvoice.grandTotal)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200/60 pt-1 dark:border-zinc-700">
                <span className="text-slate-500 font-semibold">Remaining Balance Due:</span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedInvoice.balanceDue)}
                </span>
              </div>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Amount (₹)" required>
              <input
                type="number"
                min="1"
                step="0.01"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                required
                placeholder="e.g. 2500"
                className={inputClass}
              />
            </Field>

            <Field label="Payment Method" required>
              <select
                value={paymentForm.method}
                onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                className={inputClass}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Payment Date" required>
              <input
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Reference / Note (Optional)">
              <input
                type="text"
                placeholder="UTR / Cheque # / Bank Ref"
                value={paymentForm.note}
                onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 dark:border-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
              Save Payment
            </button>
          </div>
        </form>
      </Modal>
    </InternalPage>
  )
}
