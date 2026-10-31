import { useEffect, useMemo, useState } from 'react'
import {
  FileText,
  Loader2,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCw,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import InternalPage from '../../components/internal/InternalPage'
import Modal, { ConfirmDialog } from '../../components/internal/Modal'
import Pagination from '../../components/internal/Pagination'
import { Notice } from '../../components/internal/Feedback'
import { Field, inputClass } from '../../components/internal/FormControls'
import { DataUnavailable, StatusBadge } from '../../components/dashboard/primitives'
import { billingApi, catalogApi, subscriptionApi, userApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import {
  PAYMENT_TERMS,
  SUBSCRIPTION_STATUSES,
  formatCurrency,
  formatDate,
  subscriptionStatusTone,
} from '../../utils/format'

const PAGE_SIZE = 20
const NEXT_STATUS = {
  DRAFT: 'QUOTATION',
  QUOTATION: 'CONFIRMED',
  CONFIRMED: 'ACTIVE',
}

const emptyCreateForm = {
  customerId: '',
  planId: '',
  templateId: '',
  paymentTerms: 'Net 15',
  expiryDate: '',
}

const emptyLine = {
  productId: '',
  variantAttribute: '',
  variantValue: '',
  quantity: 1,
}

function productForLine(products, productId) {
  return products.find((product) => product._id === productId)
}

function lineUnitPrice(product, variantAttribute, variantValue) {
  if (!product) return 0
  const variant = product.variants?.find(
    (item) => item.value === variantValue && item.attribute === variantAttribute
  )
  return Number(product.salesPrice || 0) + Number(variant?.priceModifier || 0)
}

function toEditableLine(line) {
  return {
    productId: line.productId?._id || line.productId || '',
    variantAttribute: line.variantAttribute || '',
    variantValue: line.variantValue || '',
    quantity: Number(line.quantity || 1),
    taxRate: line.taxRate,
  }
}

function LineItemsEditor({ lines, setLines, products, disabled }) {
  const addLine = () => setLines((current) => [...current, { ...emptyLine }])

  const updateLine = (index, patch) => {
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    )
  }

  const removeLine = (index) => {
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0B1A35] dark:text-white">Line items</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Variant pricing is applied by the server when the subscription is saved.
          </p>
        </div>
        <button
          type="button"
          onClick={addLine}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add line
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          Add at least one product line, or select a quotation template.
        </div>
      ) : (
        <div className="space-y-3">
          {lines.map((line, index) => {
            const product = productForLine(products, line.productId)
            const variants = product?.variants || []
            const variantKey =
              line.variantAttribute && line.variantValue
                ? `${line.variantAttribute}::${line.variantValue}`
                : ''
            const unitPrice = lineUnitPrice(
              product,
              line.variantAttribute,
              line.variantValue
            )

            return (
              <div
                key={`${line.productId}-${index}`}
                className="grid gap-3 rounded-xl border border-slate-200 p-3 dark:border-zinc-800 md:grid-cols-[1.5fr_1fr_92px_44px]"
              >
                <Field id={`line-product-${index}`} label="Product">
                  <select
                    id={`line-product-${index}`}
                    value={line.productId}
                    disabled={disabled}
                    onChange={(event) => {
                      updateLine(index, {
                        productId: event.target.value,
                        variantAttribute: '',
                        variantValue: '',
                      })
                    }}
                    className={inputClass}
                  >
                    <option value="">Select a product</option>
                    {products
                      .filter((item) => item.isActive !== false)
                      .map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name} — {formatCurrency(item.salesPrice)}
                        </option>
                      ))}
                  </select>
                  {product && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-zinc-500">
                      Base {formatCurrency(product.salesPrice)}
                      {line.variantValue
                        ? ` · variant ${formatCurrency(unitPrice)}`
                        : ''}
                    </p>
                  )}
                </Field>

                <Field id={`line-variant-${index}`} label="Variant">
                  <select
                    id={`line-variant-${index}`}
                    value={variantKey}
                    disabled={disabled || !product || variants.length === 0}
                    onChange={(event) => {
                      const [variantAttribute = '', variantValue = ''] =
                        event.target.value.split('::')
                      updateLine(index, { variantAttribute, variantValue })
                    }}
                    className={inputClass}
                  >
                    <option value="">
                      {variants.length === 0 ? 'No variants' : 'Base price'}
                    </option>
                    {variants.map((variant) => (
                      <option
                        key={variant._id || `${variant.attribute}-${variant.value}`}
                        value={`${variant.attribute}::${variant.value}`}
                      >
                        {variant.attribute}: {variant.value}
                        {variant.priceModifier
                          ? ` (${variant.priceModifier > 0 ? '+' : ''}₹${variant.priceModifier})`
                          : ''}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field id={`line-quantity-${index}`} label="Qty">
                  <input
                    id={`line-quantity-${index}`}
                    type="number"
                    min="1"
                    step="1"
                    value={line.quantity}
                    disabled={disabled}
                    onChange={(event) =>
                      updateLine(index, { quantity: Number(event.target.value) })
                    }
                    className={inputClass}
                  />
                </Field>

                <button
                  type="button"
                  onClick={() => removeLine(index)}
                  disabled={disabled}
                  aria-label="Remove line item"
                  className="mt-5 flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SubscriptionTable({ subscriptions, loading, onManage }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[62rem] text-left text-sm">
        <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
          <tr>
            <th scope="col" className="px-5 pb-3 font-medium">Subscription</th>
            <th scope="col" className="px-5 pb-3 font-medium">Customer</th>
            <th scope="col" className="px-5 pb-3 font-medium">Plan</th>
            <th scope="col" className="px-5 pb-3 font-medium">Amount</th>
            <th scope="col" className="px-5 pb-3 font-medium">Status</th>
            <th scope="col" className="px-5 pb-3 font-medium">Next billing</th>
            <th scope="col" className="px-5 pb-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
          {loading ? (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center">
                <Loader2
                  className="mx-auto size-6 animate-spin text-indigo-600 dark:text-indigo-400"
                  aria-label="Loading subscriptions"
                />
              </td>
            </tr>
          ) : subscriptions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5">
                <DataUnavailable message="No subscriptions match the current filters." />
              </td>
            </tr>
          ) : (
            subscriptions.map((subscription) => (
              <tr
                key={subscription._id}
                className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40"
              >
                <td className="px-5 py-3">
                  <p className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {subscription.subNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
                    {formatDate(subscription.createdAt)}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-slate-700 dark:text-zinc-300">
                    {subscription.customerId?.name || 'Customer'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {subscription.customerId?.email || ''}
                  </p>
                </td>
                <td className="px-5 py-3">
                  <p className="text-sm text-slate-700 dark:text-zinc-300">
                    {subscription.planId?.name || 'Custom plan'}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-zinc-500">
                    {subscription.planId?.billingCycle || ''}
                  </p>
                </td>
                <td className="px-5 py-3 font-medium text-[#0B1A35] dark:text-white">
                  {formatCurrency(subscription.grandTotal)}
                </td>
                <td className="px-5 py-3">
                  <StatusBadge tone={subscriptionStatusTone(subscription.status)}>
                    {subscription.status}
                  </StatusBadge>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500 dark:text-zinc-400">
                  {subscription.nextBillingDate
                    ? formatDate(subscription.nextBillingDate)
                    : '—'}
                </td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onManage(subscription)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                  >
                    Manage
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

export default function Subscriptions() {
  const [query, setQuery] = useState({ page: 1, status: '', search: '' })
  const [searchInput, setSearchInput] = useState('')
  const [subscriptions, setSubscriptions] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [customers, setCustomers] = useState([])
  const [plans, setPlans] = useState([])
  const [templates, setTemplates] = useState([])
  const [products, setProducts] = useState([])
  const [taxes, setTaxes] = useState([])
  const [referenceError, setReferenceError] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState(emptyCreateForm)
  const [createLines, setCreateLines] = useState([])
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [detailBusy, setDetailBusy] = useState(false)

  const [confirm, setConfirm] = useState(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const [editLinesOpen, setEditLinesOpen] = useState(false)
  const [editLines, setEditLines] = useState([])
  const [editLinesForm, setEditLinesForm] = useState({ paymentTerms: 'Net 15', expiryDate: '' })
  const [editLinesError, setEditLinesError] = useState('')
  const [editLinesBusy, setEditLinesBusy] = useState(false)

  useEffect(() => {
    let active = true

    Promise.all([
      userApi.getCustomers(),
      catalogApi.getPlans(),
      catalogApi.getTemplates(),
      catalogApi.getProducts(),
      billingApi.getTaxes(),
    ])
      .then(([customerResponse, planResponse, templateResponse, productResponse, taxResponse]) => {
        if (!active) return
        setCustomers(customerResponse.data.data || [])
        setPlans(planResponse.data.data || [])
        setTemplates(templateResponse.data.data || [])
        setProducts(productResponse.data.data || [])
        setTaxes(taxResponse.data.data || [])
        setReferenceError('')
      })
      .catch((err) => {
        if (active) setReferenceError(getApiError(err, 'Could not load subscription reference data.'))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const nextSearch = searchInput.trim()
    if (nextSearch === query.search) return undefined

    const timer = window.setTimeout(() => {
      setLoading(true)
      setQuery((current) => ({ ...current, page: 1, search: nextSearch }))
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchInput, query.search])

  useEffect(() => {
    let active = true

    subscriptionApi
      .getAll({
        page: query.page,
        limit: PAGE_SIZE,
        ...(query.status ? { status: query.status } : {}),
        ...(query.search ? { search: query.search } : {}),
      })
      .then(({ data }) => {
        if (!active) return
        setSubscriptions(data.data || [])
        setMeta(data.meta || { total: 0, page: query.page, pages: 0 })
        setError('')
      })
      .catch((err) => {
        if (active) setError(getApiError(err, 'Could not load subscriptions.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [query.page, query.status, query.search, reloadKey])

  const defaultTaxRate = useMemo(() => {
    const defaultTax = taxes.find((tax) => tax.isDefault && tax.isActive !== false)
    return defaultTax ? Number(defaultTax.ratePercent) : 18
  }, [taxes])

  const selectedPlan = plans.find((plan) => plan._id === createForm.planId)

  const resetCreate = () => {
    setCreateForm(emptyCreateForm)
    setCreateLines([])
    setCreateError('')
  }

  const openCreate = () => {
    resetCreate()
    setCreateOpen(true)
  }

  const handleTemplateSelect = (templateId) => {
    if (!templateId) {
      setCreateForm((current) => ({ ...current, templateId: '' }))
      return
    }

    const template = templates.find((item) => item._id === templateId)
    if (!template) return

    setCreateForm((current) => ({
      ...current,
      templateId,
      planId: template.planId?._id || template.planId || current.planId,
      paymentTerms: template.paymentTerms || current.paymentTerms,
    }))
    setCreateLines((template.lines || []).map(toEditableLine))
  }

  const validateCreate = () => {
    if (!createForm.customerId) return 'Select a customer.'
    if (!createForm.planId) return 'Select a plan.'
    if (createLines.length === 0) return 'Add at least one line item or choose a template.'
    if (createLines.some((line) => !line.productId)) return 'Every line needs a product.'
    if (createLines.some((line) => !Number.isFinite(line.quantity) || line.quantity < 1)) {
      return 'Every line needs a quantity of at least 1.'
    }

    const totalQty = createLines.reduce((sum, line) => sum + Number(line.quantity), 0)
    if (selectedPlan && totalQty < Number(selectedPlan.minQty || 1)) {
      return `This plan requires a total quantity of at least ${selectedPlan.minQty}.`
    }

    return ''
  }

  const submitCreate = async (event) => {
    event.preventDefault()
    const validationError = validateCreate()
    if (validationError) {
      setCreateError(validationError)
      return
    }

    setCreating(true)
    setCreateError('')
    try {
      await subscriptionApi.create({
        customerId: createForm.customerId,
        planId: createForm.planId,
        ...(createForm.templateId ? { templateId: createForm.templateId } : {}),
        paymentTerms: createForm.paymentTerms,
        ...(createForm.expiryDate ? { expiryDate: createForm.expiryDate } : {}),
        defaultTaxRate,
        lines: createLines.map((line) => ({
          productId: line.productId,
          variantAttribute: line.variantAttribute || undefined,
          variantValue: line.variantValue || undefined,
          quantity: Number(line.quantity),
        })),
      })
      setCreateOpen(false)
      setNotice('Subscription created as a draft.')
      setLoading(true)
      setQuery((current) => ({ ...current, page: 1 }))
      setReloadKey((value) => value + 1)
    } catch (err) {
      setCreateError(getApiError(err, 'Could not create the subscription.'))
    } finally {
      setCreating(false)
    }
  }

  const loadDetail = async (id) => {
    setDetailLoading(true)
    setDetailError('')
    try {
      const { data } = await subscriptionApi.getById(id)
      setDetail(data.data)
    } catch (err) {
      setDetailError(getApiError(err, 'Could not load subscription details.'))
    } finally {
      setDetailLoading(false)
    }
  }

  const openDetail = (subscription) => {
    setDetail(subscription)
    setDetailOpen(true)
    loadDetail(subscription._id)
  }

  const requestTransition = (targetStatus) => {
    if (!detail) return
    setConfirm({
      type: 'transition',
      targetStatus,
      title: `Move subscription to ${targetStatus}?`,
      message: `${detail.subNumber} will move from ${detail.status} to ${targetStatus}. This is a lifecycle change.`,
      confirmLabel: `Move to ${targetStatus}`,
      tone: 'primary',
    })
  }

  const requestLifecycle = (action) => {
    if (!detail) return
    const labels = {
      PAUSE: ['Pause subscription?', 'The subscription will stop generating billing until it is resumed.'],
      RESUME: ['Resume subscription?', 'The subscription will resume its normal billing schedule.'],
      RENEW: ['Renew subscription?', 'The subscription will be reactivated with a fresh billing period.'],
    }
    const [title, message] = labels[action] || ['Update subscription?', 'Continue with this action?']
    setConfirm({
      type: 'lifecycle',
      action,
      title,
      message: `${detail.subNumber}: ${message}`,
      confirmLabel: action.charAt(0) + action.slice(1).toLowerCase(),
      tone: action === 'PAUSE' ? 'danger' : 'primary',
    })
  }

  const requestClose = () => {
    if (!detail) return
    setConfirm({
      type: 'transition',
      targetStatus: 'CLOSED',
      title: 'Close subscription?',
      message: `${detail.subNumber} will be closed. This cannot be undone from the subscription screen.`,
      confirmLabel: 'Close subscription',
      tone: 'danger',
    })
  }

  const executeConfirm = async () => {
    if (!confirm || !detail) return
    setConfirmBusy(true)
    setDetailBusy(true)
    try {
      if (confirm.type === 'transition') {
        await subscriptionApi.transitionStatus(detail._id, confirm.targetStatus)
      } else {
        await subscriptionApi.lifecycleAction(detail._id, confirm.action)
      }

      await loadDetail(detail._id)
      setLoading(true)
      setReloadKey((value) => value + 1)
      const actionResult = {
        PAUSE: 'paused',
        RESUME: 'resumed',
        RENEW: 'renewed',
      }
      setNotice(
        confirm.type === 'transition'
          ? `Subscription moved to ${confirm.targetStatus}.`
          : `Subscription ${actionResult[confirm.action] || 'updated'} successfully.`
      )
      setConfirm(null)
    } catch (err) {
      setDetailError(getApiError(err, 'Could not update the subscription.'))
      setConfirm(null)
    } finally {
      setConfirmBusy(false)
      setDetailBusy(false)
    }
  }

  const openEditLines = () => {
    if (!detail) return
    setEditLines((detail.lines || []).map(toEditableLine))
    setEditLinesForm({
      paymentTerms: detail.paymentTerms || 'Net 15',
      expiryDate: detail.expiryDate ? String(detail.expiryDate).slice(0, 10) : '',
    })
    setEditLinesError('')
    setEditLinesOpen(true)
  }

  const submitEditLines = async (event) => {
    event.preventDefault()
    if (!detail) return
    if (editLines.length === 0 || editLines.some((line) => !line.productId)) {
      setEditLinesError('Add at least one complete line item.')
      return
    }
    const totalQty = editLines.reduce((sum, line) => sum + Number(line.quantity), 0)
    if (detail.planId?.minQty && totalQty < Number(detail.planId.minQty)) {
      setEditLinesError(`This plan requires a total quantity of at least ${detail.planId.minQty}.`)
      return
    }

    setEditLinesBusy(true)
    setEditLinesError('')
    try {
      await subscriptionApi.updateLines(detail._id, {
        paymentTerms: editLinesForm.paymentTerms,
        ...(editLinesForm.expiryDate ? { expiryDate: editLinesForm.expiryDate } : {}),
        defaultTaxRate,
        lines: editLines.map((line) => ({
          productId: line.productId,
          variantAttribute: line.variantAttribute || undefined,
          variantValue: line.variantValue || undefined,
          quantity: Number(line.quantity),
          ...(line.taxRate !== undefined ? { taxRate: line.taxRate } : {}),
        })),
      })
      setEditLinesOpen(false)
      await loadDetail(detail._id)
      setLoading(true)
      setReloadKey((value) => value + 1)
      setNotice('Subscription lines updated.')
    } catch (err) {
      setEditLinesError(getApiError(err, 'Could not update subscription lines.'))
    } finally {
      setEditLinesBusy(false)
    }
  }

  const nextStatus = detail ? NEXT_STATUS[detail.status] : null
  const plan = detail?.planId
  const canEditLines = detail && ['DRAFT', 'QUOTATION'].includes(detail.status)
  const canPause = detail?.status === 'ACTIVE' && !detail.isPaused && plan?.canPause
  const canResume = detail?.status === 'ACTIVE' && detail.isPaused
  const canRenew = plan?.canRenew && ['ACTIVE', 'CLOSED'].includes(detail?.status)
  const closeBlocked =
    detail?.status === 'ACTIVE' &&
    plan?.canCloseEarly === false &&
    (!detail.expiryDate || new Date(detail.expiryDate) > new Date())
  const canClose =
    ['ACTIVE', 'CONFIRMED'].includes(detail?.status) && !closeBlocked

  return (
    <InternalPage
      title="Subscriptions"
      description="Create and manage the full subscription lifecycle. Data is loaded with server-side pagination."
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
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
          >
            <Plus className="size-4" aria-hidden="true" />
            Create subscription
          </button>
        </>
      }
    >
      <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>
      <Notice tone="error" onDismiss={() => setReferenceError('')}>{referenceError}</Notice>
      <Notice tone="success" onDismiss={() => setNotice('')}>{notice}</Notice>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-[#121216]">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-zinc-800/80">
          <label className="relative min-w-56 flex-1">
            <span className="sr-only">Search subscriptions</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by subscription number"
              className={`${inputClass} pl-9`}
            />
          </label>
          <select
            value={query.status}
            onChange={(event) => {
              setLoading(true)
              setQuery((current) => ({ ...current, page: 1, status: event.target.value }))
            }}
            aria-label="Filter by status"
            className={`${inputClass} sm:w-56`}
          >
            <option value="">All statuses</option>
            {SUBSCRIPTION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
          {loading && (
            <Loader2 className="size-4 animate-spin text-indigo-600 dark:text-indigo-400" aria-label="Loading" />
          )}
        </div>

        <SubscriptionTable
          subscriptions={subscriptions}
          loading={loading}
          onManage={openDetail}
        />
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
        open={createOpen}
        onClose={creating ? undefined : () => setCreateOpen(false)}
        title="Create subscription"
        description="A subscription starts as a draft. Pricing and variant modifiers are calculated by the API."
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              disabled={creating}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-subscription-form"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Create draft
            </button>
          </>
        }
      >
        <form id="create-subscription-form" onSubmit={submitCreate} className="space-y-5" noValidate>
          {createError && <Notice tone="error">{createError}</Notice>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="sub-customer" label="Customer" required>
              <select
                id="sub-customer"
                value={createForm.customerId}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, customerId: event.target.value }))
                }
                className={inputClass}
                required
              >
                <option value="">Select a customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} — {customer.email}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="sub-plan" label="Plan" required>
              <select
                id="sub-plan"
                value={createForm.planId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    planId: event.target.value,
                    templateId: '',
                  }))
                }
                className={inputClass}
                required
              >
                <option value="">Select a plan</option>
                {plans.map((planOption) => (
                  <option key={planOption._id} value={planOption._id}>
                    {planOption.name} — {formatCurrency(planOption.price)} / {planOption.billingCycle}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              id="sub-template"
              label="Quotation template"
              hint="Selecting a template populates its plan and line items."
            >
              <select
                id="sub-template"
                value={createForm.templateId}
                onChange={(event) => handleTemplateSelect(event.target.value)}
                className={inputClass}
              >
                <option value="">No template</option>
                {templates.map((template) => (
                  <option key={template._id} value={template._id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="sub-payment-terms" label="Payment terms">
              <select
                id="sub-payment-terms"
                value={createForm.paymentTerms}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, paymentTerms: event.target.value }))
                }
                className={inputClass}
              >
                {PAYMENT_TERMS.map((term) => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </Field>

            <Field id="sub-expiry" label="Expiry date" hint="Optional. A template validity period applies when supported.">
              <input
                id="sub-expiry"
                type="date"
                value={createForm.expiryDate}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, expiryDate: event.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-xs leading-5 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-300">
              Default tax rate: <strong>{defaultTaxRate}%</strong>
              {selectedPlan ? ` · Minimum quantity: ${selectedPlan.minQty || 1}` : ''}
            </div>
          </div>

          <LineItemsEditor
            lines={createLines}
            setLines={setCreateLines}
            products={products}
            disabled={creating}
          />
        </form>
      </Modal>

      <Modal
        open={detailOpen}
        onClose={detailBusy ? undefined : () => setDetailOpen(false)}
        title={detail ? `Subscription ${detail.subNumber}` : 'Subscription details'}
        description={detail ? `Current status: ${detail.status}` : 'Loading subscription details...'}
        size="xl"
      >
        {detailLoading ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="size-6 animate-spin text-indigo-600 dark:text-indigo-400" aria-label="Loading details" />
          </div>
        ) : detailError ? (
          <Notice tone="error">{detailError}</Notice>
        ) : detail ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Customer', detail.customerId?.name || '—'],
                ['Plan', detail.planId?.name || '—'],
                ['Billing cycle', detail.planId?.billingCycle || '—'],
                ['Grand total', formatCurrency(detail.grandTotal)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 px-4 py-3 dark:bg-zinc-800/40">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-zinc-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#0B1A35] dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {nextStatus && (
                <button
                  type="button"
                  onClick={() => requestTransition(nextStatus)}
                  disabled={detailBusy}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Move to {nextStatus}
                </button>
              )}
              {canEditLines && (
                <button
                  type="button"
                  onClick={openEditLines}
                  disabled={detailBusy}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  Edit lines
                </button>
              )}
              {canPause && (
                <button type="button" onClick={() => requestLifecycle('PAUSE')} disabled={detailBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-2 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-amber-900/50 dark:text-amber-300 dark:hover:bg-amber-950/30">
                  <Pause className="size-3.5" aria-hidden="true" /> Pause
                </button>
              )}
              {canResume && (
                <button type="button" onClick={() => requestLifecycle('RESUME')} disabled={detailBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-950/30">
                  <Play className="size-3.5" aria-hidden="true" /> Resume
                </button>
              )}
              {canRenew && (
                <button type="button" onClick={() => requestLifecycle('RENEW')} disabled={detailBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 px-3 py-2 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-950/30">
                  <RotateCw className="size-3.5" aria-hidden="true" /> Renew
                </button>
              )}
              {canClose && (
                <button type="button" onClick={requestClose} disabled={detailBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-950/30">
                  <XCircle className="size-3.5" aria-hidden="true" /> Close
                </button>
              )}
              {detailBusy && <Loader2 className="size-4 animate-spin text-indigo-600 dark:text-indigo-400" aria-label="Updating" />}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full min-w-[36rem] text-left text-sm">
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
                    <tr key={line._id || index}>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.productName}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">
                        {line.variantValue ? `${line.variantAttribute}: ${line.variantValue}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.quantity}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{formatCurrency(line.unitPrice)}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">{line.taxRate || 0}%</td>
                      <td className="px-4 py-2.5 text-right font-medium text-[#0B1A35] dark:text-white">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-3 sm:justify-items-end">
              <span className="text-slate-500 dark:text-zinc-400">Subtotal <strong className="ml-2 text-[#0B1A35] dark:text-white">{formatCurrency(detail.subtotal)}</strong></span>
              <span className="text-slate-500 dark:text-zinc-400">Tax <strong className="ml-2 text-[#0B1A35] dark:text-white">{formatCurrency(detail.taxTotal)}</strong></span>
              <span className="text-slate-500 dark:text-zinc-400">Total <strong className="ml-2 text-[#0B1A35] dark:text-white">{formatCurrency(detail.grandTotal)}</strong></span>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5"><FileText className="size-3.5" aria-hidden="true" /> {detail.paymentTerms}</span>
              <span>Next billing: {detail.nextBillingDate ? formatDate(detail.nextBillingDate) : '—'}</span>
              {detail.isPaused && <StatusBadge tone="amber">PAUSED</StatusBadge>}
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={editLinesOpen}
        onClose={editLinesBusy ? undefined : () => setEditLinesOpen(false)}
        title="Edit draft lines"
        description="Only draft and quotation subscriptions can be edited."
        size="xl"
        footer={
          <>
            <button type="button" onClick={() => setEditLinesOpen(false)} disabled={editLinesBusy} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
            <button type="submit" form="edit-lines-form" disabled={editLinesBusy} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {editLinesBusy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Save lines
            </button>
          </>
        }
      >
        <form id="edit-lines-form" onSubmit={submitEditLines} className="space-y-5" noValidate>
          {editLinesError && <Notice tone="error">{editLinesError}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="edit-payment-terms" label="Payment terms">
              <select id="edit-payment-terms" value={editLinesForm.paymentTerms} onChange={(event) => setEditLinesForm((current) => ({ ...current, paymentTerms: event.target.value }))} className={inputClass}>
                {PAYMENT_TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
              </select>
            </Field>
            <Field id="edit-expiry" label="Expiry date">
              <input id="edit-expiry" type="date" value={editLinesForm.expiryDate} onChange={(event) => setEditLinesForm((current) => ({ ...current, expiryDate: event.target.value }))} className={inputClass} />
            </Field>
          </div>
          <LineItemsEditor lines={editLines} setLines={setEditLines} products={products} disabled={editLinesBusy} />
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirm?.title || 'Confirm action'}
        message={confirm?.message || ''}
        confirmLabel={confirm?.confirmLabel || 'Confirm'}
        tone={confirm?.tone || 'danger'}
        busy={confirmBusy}
        onConfirm={executeConfirm}
        onClose={() => setConfirm(null)}
      />
    </InternalPage>
  )
}
