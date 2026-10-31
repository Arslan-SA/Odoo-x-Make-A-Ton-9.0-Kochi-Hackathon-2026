import { useState } from 'react'
import { Loader2, Percent, Plus } from 'lucide-react'
import FormField from '../auth/FormField'
import { billingApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'

export default function TaxSection({ taxes, onChanged }) {
  const [form, setForm] = useState({ name: '', ratePercent: '', isDefault: false })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const rate = Number(form.ratePercent)
    if (!form.name.trim()) {
      setError('Tax name is required.')
      return
    }
    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      setError('Tax rate must be between 0 and 100.')
      return
    }

    setSubmitting(true)
    try {
      await billingApi.createTax({
        name: form.name.trim(),
        ratePercent: rate,
        isDefault: form.isDefault,
      })
      setForm({ name: '', ratePercent: '', isDefault: false })
      await onChanged()
      setNotice('Tax rule added.')
    } catch (err) {
      setError(getApiError(err, 'Could not create the tax rule.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Percent className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Tax rules</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tax rates used when quotations and invoices are calculated. One rule can be the
              default.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {taxes.length} {taxes.length === 1 ? 'rule' : 'rules'}
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

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField
          id="tax-name"
          label="Tax name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="GST 18%"
          required
        />
        <FormField
          id="tax-rate"
          label="Rate (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.ratePercent}
          onChange={(event) =>
            setForm((current) => ({ ...current, ratePercent: event.target.value }))
          }
          placeholder="18"
          required
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(event) =>
              setForm((current) => ({ ...current, isDefault: event.target.checked }))
            }
            className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Use as the default tax rate for billing
        </label>
        <div className="sm:col-span-2">
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
            {submitting ? 'Adding rule…' : 'Add tax rule'}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        {taxes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">No tax rules yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {taxes.map((tax) => (
              <li
                key={tax._id}
                className="flex items-center justify-between gap-4 px-4 py-4"
              >
                <div>
                  <p className="text-sm font-medium">{tax.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {tax.isDefault ? 'Default rate' : 'Optional rate'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-[#0B1A35]">
                    {tax.ratePercent}%
                  </span>
                  {tax.isDefault && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                      default
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
