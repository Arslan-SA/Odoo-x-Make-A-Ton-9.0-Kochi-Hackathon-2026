import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import AppShell from '../../components/dashboard/AppShell'
import StaffSection from '../../components/settings/StaffSection'
import TaxSection from '../../components/settings/TaxSection'
import DiscountSection from '../../components/settings/DiscountSection'
import { billingApi, userApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'

export default function AdminSettings() {
  const [staff, setStaff] = useState([])
  const [taxes, setTaxes] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadSettings = useCallback(async () => {
    try {
      const [staffResponse, taxResponse, discountResponse] = await Promise.all([
        userApi.getStaff(),
        billingApi.getTaxes(),
        billingApi.getDiscounts(),
      ])
      setStaff(staffResponse.data.data)
      setTaxes(taxResponse.data.data)
      setDiscounts(discountResponse.data.data)
      setError('')
    } catch (err) {
      setError(getApiError(err, 'Could not load workspace settings.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    Promise.all([userApi.getStaff(), billingApi.getTaxes(), billingApi.getDiscounts()])
      .then(([staffResponse, taxResponse, discountResponse]) => {
        if (!active) return
        setStaff(staffResponse.data.data)
        setTaxes(taxResponse.data.data)
        setDiscounts(discountResponse.data.data)
        setError('')
      })
      .catch((err) => {
        if (active) setError(getApiError(err, 'Could not load workspace settings.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  return (
    <AppShell
      eyebrow="Admin settings"
      title="Workspace settings"
      description="Manage staff access and the tax and discount rules that drive billing. Only admins can open this page."
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Staff accounts', value: staff.length },
          { label: 'Tax rules', value: taxes.length },
          { label: 'Discount rules', value: discounts.length },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-zinc-800 dark:bg-[#0E0E12]"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-500">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-semibold text-[#0B1A35] dark:text-white">{item.value}</p>
          </div>
        ))}
      </div>

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
              loadSettings()
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="size-6 animate-spin text-indigo-600" aria-label="Loading settings" />
        </div>
      ) : (
        <div className="space-y-6">
          <StaffSection staff={staff} onChanged={loadSettings} />
          <TaxSection taxes={taxes} onChanged={loadSettings} />
          <DiscountSection discounts={discounts} onChanged={loadSettings} />
        </div>
      )}
    </AppShell>
  )
}
