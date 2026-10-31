import { useState } from 'react'
import { BadgePercent, Loader2, Plus } from 'lucide-react'
import FormField from '../auth/FormField'
import { billingApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'

const EMPTY_FORM = {
  name: '',
  code: '',
  type: 'PERCENT',
  value: '',
  minPurchaseAmount: '',
  maxUses: '',
}

export default function DiscountSection({ discounts, onChanged }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const value = Number(form.value)
    if (!form.name.trim() || !form.code.trim()) {
      setError('Discount name and code are required.')
      return
    }
    if (!Number.isFinite(value) || value <= 0) {
      setError('Discount value must be greater than 0.')
      return
    }
    if (form.type === 'PERCENT' && value > 100) {
      setError('A percentage discount cannot exceed 100%.')
      return
    }

    setSubmitting(true)
    try {
      await billingApi.createDiscount({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value,
        minPurchaseAmount: Number(form.minPurchaseAmount) || 0,
        maxUses: form.maxUses === '' ? null : Number(form.maxUses),
      })
      setForm(EMPTY_FORM)
      await onChanged()
      setNotice('Discount rule added.')
    } catch (err) {
      setError(getApiError(err, 'Could not create the discount rule.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-[#0E0E12]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
            <BadgePercent className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-[#0B1A35] dark:text-white">Discount rules</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
              Promo codes and automatic discounts applied to subscriptions and invoices.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
          {discounts.length} {discounts.length === 1 ? 'rule' : 'rules'}
        </span>
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField
          id="discount-name"
          label="Discount name"
          value={form.name}
          onChange={updateField('name')}
          placeholder="Diwali launch offer"
          required
        />
        <FormField
          id="discount-code"
          label="Code"
          value={form.code}
          onChange={updateField('code')}
          placeholder="DIWALI20"
          required
        />
        <div>
          <label htmlFor="discount-type" className="mb-1.5 block text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            id="discount-type"
            value={form.type}
            onChange={updateField('type')}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0B1A35] shadow-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          >
            <option value="PERCENT">Percentage</option>
            <option value="FIXED">Fixed amount</option>
          </select>
        </div>
        <FormField
          id="discount-value"
          label={form.type === 'PERCENT' ? 'Value (%)' : 'Value (₹)'}
          type="number"
          min="0"
          step="0.01"
          value={form.value}
          onChange={updateField('value')}
          placeholder={form.type === 'PERCENT' ? '20' : '500'}
          required
        />
        <FormField
          id="discount-min"
          label="Minimum purchase (₹)"
          type="number"
          min="0"
          step="0.01"
          value={form.minPurchaseAmount}
          onChange={updateField('minPurchaseAmount')}
          placeholder="0"
        />
        <FormField
          id="discount-uses"
          label="Maximum uses"
          type="number"
          min="1"
          step="1"
          value={form.maxUses}
          onChange={updateField('maxUses')}
          placeholder="Unlimited"
        />
        <div className="sm:col-span-2 lg:col-span-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {submitting ? 'Adding rule…' : 'Add discount rule'}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
        {discounts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500 dark:text-zinc-400">No discount rules yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-zinc-800">
            {discounts.map((discount) => (
              <li
                key={discount._id}
                className="flex flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-850/50"
              >
                <div>
                  <p className="text-sm font-medium text-[#0B1A35] dark:text-white">
                    {discount.name}
                    <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-slate-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {discount.code}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-zinc-400">
                    {discount.type === 'PERCENT'
                      ? `${discount.value}% off`
                      : `₹${discount.value} off`}
                    {discount.minPurchaseAmount > 0
                      ? ` · min ₹${discount.minPurchaseAmount}`
                      : ''}
                    {discount.maxUses ? ` · ${discount.usedCount || 0}/${discount.maxUses} used` : ''}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    discount.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {discount.isActive ? 'active' : 'inactive'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
