import { useEffect, useMemo, useState } from 'react'
import {
  Boxes,
  Eye,
  FileText,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react'
import InternalPage from '../../components/internal/InternalPage'
import Modal from '../../components/internal/Modal'
import { Notice } from '../../components/internal/Feedback'
import { Checkbox, Field, inputClass } from '../../components/internal/FormControls'
import { DataUnavailable, StatusBadge } from '../../components/dashboard/primitives'
import { catalogApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import {
  BILLING_CYCLES,
  PAYMENT_TERMS,
  billingCycleLabel,
  formatCurrency,
} from '../../utils/format'

const TABS = [
  { id: 'products', label: 'Products', icon: Boxes },
  { id: 'plans', label: 'Plans', icon: Layers },
  { id: 'templates', label: 'Quotation Templates', icon: FileText },
]

const emptyProductForm = {
  name: '',
  type: 'SERVICE',
  salesPrice: '',
  costPrice: '',
  notes: '',
  isActive: true,
  variants: [],
}

const emptyPlanForm = {
  name: '',
  price: '',
  billingCycle: 'MONTHLY',
  minQty: 1,
  autoClose: false,
  canCloseEarly: true,
  canPause: true,
  canRenew: true,
  isActive: true,
}

const emptyTemplateLine = {
  productId: '',
  variantAttribute: '',
  variantValue: '',
  quantity: 1,
}

const emptyTemplateForm = {
  name: '',
  planId: '',
  validityDays: 15,
  paymentTerms: 'Net 15',
  lines: [],
}

function variantLabel(variant) {
  const modifier = Number(variant.priceModifier || 0)
  return `${variant.attribute}: ${variant.value}${modifier ? ` ${modifier > 0 ? '+' : ''}₹${modifier}` : ''}`
}

function productVariantPrice(product, variant) {
  return Number(product.salesPrice || 0) + Number(variant?.priceModifier || 0)
}

function VariantEditor({ variants, setVariants, disabled }) {
  const addVariant = () =>
    setVariants((current) => [
      ...current,
      { attribute: 'Brand', value: '', priceModifier: '' },
    ])

  const updateVariant = (index, patch) =>
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant
      )
    )

  const removeVariant = (index) =>
    setVariants((current) => current.filter((_, variantIndex) => variantIndex !== index))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0B1A35] dark:text-white">Variant pricing</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Add modifiers such as Brand: Odoo +₹560.
          </p>
        </div>
        <button
          type="button"
          onClick={addVariant}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add variant
        </button>
      </div>

      {variants.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-4 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          No variants. The base sales price applies.
        </p>
      ) : (
        variants.map((variant, index) => (
          <div
            key={index}
            className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-zinc-800 sm:grid-cols-[1fr_1fr_120px_40px]"
          >
            <input
              value={variant.attribute}
              onChange={(event) => updateVariant(index, { attribute: event.target.value })}
              placeholder="Attribute (Brand)"
              aria-label={`Variant ${index + 1} attribute`}
              disabled={disabled}
              className={inputClass}
            />
            <input
              value={variant.value}
              onChange={(event) => updateVariant(index, { value: event.target.value })}
              placeholder="Value (Odoo)"
              aria-label={`Variant ${index + 1} value`}
              disabled={disabled}
              className={inputClass}
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={variant.priceModifier}
              onChange={(event) =>
                updateVariant(index, { priceModifier: event.target.value })
              }
              placeholder="+₹"
              aria-label={`Variant ${index + 1} price modifier`}
              disabled={disabled}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => removeVariant(index)}
              disabled={disabled}
              aria-label="Remove variant"
              className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))
      )}
    </div>
  )
}

function TemplateLineEditor({ lines, setLines, products, disabled }) {
  const updateLine = (index, patch) =>
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    )

  const removeLine = (index) =>
    setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))

  const addLine = () => setLines((current) => [...current, { ...emptyTemplateLine }])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#0B1A35] dark:text-white">Template lines</p>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            These lines auto-fill a subscription when the template is selected.
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
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-4 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
          Add at least one line to this template.
        </p>
      ) : (
        lines.map((line, index) => {
          const product = products.find((item) => item._id === line.productId)
          const variantKey =
            line.variantAttribute && line.variantValue
              ? `${line.variantAttribute}::${line.variantValue}`
              : ''

          return (
            <div
              key={index}
              className="grid gap-2 rounded-xl border border-slate-200 p-3 dark:border-zinc-800 sm:grid-cols-[1.5fr_1fr_90px_40px]"
            >
              <select
                value={line.productId}
                onChange={(event) =>
                  updateLine(index, {
                    productId: event.target.value,
                    variantAttribute: '',
                    variantValue: '',
                  })
                }
                aria-label={`Template line ${index + 1} product`}
                disabled={disabled}
                className={inputClass}
              >
                <option value="">Select product</option>
                {products
                  .filter((item) => item.isActive !== false)
                  .map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
              <select
                value={variantKey}
                onChange={(event) => {
                  const [variantAttribute = '', variantValue = ''] =
                    event.target.value.split('::')
                  updateLine(index, { variantAttribute, variantValue })
                }}
                aria-label={`Template line ${index + 1} variant`}
                disabled={disabled || !product?.variants?.length}
                className={inputClass}
              >
                <option value="">
                  {product?.variants?.length ? 'Base price' : 'No variants'}
                </option>
                {(product?.variants || []).map((variant) => (
                  <option
                    key={variant._id || `${variant.attribute}-${variant.value}`}
                    value={`${variant.attribute}::${variant.value}`}
                  >
                    {variantLabel(variant)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                step="1"
                value={line.quantity}
                onChange={(event) => updateLine(index, { quantity: Number(event.target.value) })}
                aria-label={`Template line ${index + 1} quantity`}
                disabled={disabled}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                disabled={disabled}
                aria-label="Remove template line"
                className="flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-rose-900/50 dark:hover:bg-rose-950/30 dark:hover:text-rose-300"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          )
        })
      )}
    </div>
  )
}

function TableShell({ children }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-[#121216]">
      {children}
    </div>
  )
}

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5">
        <DataUnavailable message={message} />
      </td>
    </tr>
  )
}

export default function Catalog() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [plans, setPlans] = useState([])
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  const [productOpen, setProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [productForm, setProductForm] = useState(emptyProductForm)
  const [productError, setProductError] = useState('')
  const [productSaving, setProductSaving] = useState(false)

  const [planOpen, setPlanOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planForm, setPlanForm] = useState(emptyPlanForm)
  const [planError, setPlanError] = useState('')
  const [planSaving, setPlanSaving] = useState(false)

  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm)
  const [templateError, setTemplateError] = useState('')
  const [templateSaving, setTemplateSaving] = useState(false)
  const [viewTemplate, setViewTemplate] = useState(null)

  useEffect(() => {
    let active = true

    Promise.all([
      catalogApi.getProducts(),
      catalogApi.getPlans({ includeInactive: true }),
      catalogApi.getTemplates(),
    ])
      .then(([productResponse, planResponse, templateResponse]) => {
        if (!active) return
        setProducts(productResponse.data.data || [])
        setPlans(planResponse.data.data || [])
        setTemplates(templateResponse.data.data || [])
        setError('')
      })
      .catch((err) => {
        if (active) setError(getApiError(err, 'Could not load the catalog.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [reloadKey])

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive !== false),
    [products]
  )

  const openProduct = (product = null) => {
    setEditingProduct(product)
    setProductForm(
      product
        ? {
            name: product.name || '',
            type: product.type || 'SERVICE',
            salesPrice: product.salesPrice ?? '',
            costPrice: product.costPrice ?? '',
            notes: product.notes || '',
            isActive: product.isActive !== false,
            variants: (product.variants || []).map((variant) => ({
              attribute: variant.attribute || '',
              value: variant.value || '',
              priceModifier: variant.priceModifier ?? '',
            })),
          }
        : emptyProductForm
    )
    setProductError('')
    setProductOpen(true)
  }

  const validateProduct = () => {
    if (!productForm.name.trim()) return 'Product name is required.'
    if (productForm.salesPrice === '' || Number(productForm.salesPrice) < 0) {
      return 'Sales price must be zero or more.'
    }
    if (productForm.costPrice !== '' && Number(productForm.costPrice) < 0) {
      return 'Cost price must be zero or more.'
    }
    if (
      productForm.variants.some(
        (variant) =>
          !variant.attribute.trim() ||
          !variant.value.trim() ||
          !Number.isFinite(Number(variant.priceModifier))
      )
    ) {
      return 'Each variant needs an attribute, value and numeric price modifier.'
    }
    return ''
  }

  const submitProduct = async (event) => {
    event.preventDefault()
    const validationError = validateProduct()
    if (validationError) {
      setProductError(validationError)
      return
    }

    setProductSaving(true)
    setProductError('')
    try {
      const payload = {
        name: productForm.name.trim(),
        type: productForm.type,
        salesPrice: Number(productForm.salesPrice),
        costPrice: Number(productForm.costPrice || 0),
        notes: productForm.notes.trim(),
        isActive: productForm.isActive,
        variants: productForm.variants.map((variant) => ({
          attribute: variant.attribute.trim(),
          value: variant.value.trim(),
          priceModifier: Number(variant.priceModifier || 0),
        })),
      }

      if (editingProduct) {
        await catalogApi.updateProduct(editingProduct._id, payload)
      } else {
        await catalogApi.createProduct(payload)
      }
      setProductOpen(false)
      setNotice(editingProduct ? 'Product updated.' : 'Product created.')
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (err) {
      setProductError(getApiError(err, 'Could not save the product.'))
    } finally {
      setProductSaving(false)
    }
  }

  const openPlan = (plan = null) => {
    setEditingPlan(plan)
    setPlanForm(
      plan
        ? {
            name: plan.name || '',
            price: plan.price ?? '',
            billingCycle: plan.billingCycle || 'MONTHLY',
            minQty: plan.minQty ?? 1,
            autoClose: Boolean(plan.autoClose),
            canCloseEarly: plan.canCloseEarly !== false,
            canPause: plan.canPause !== false,
            canRenew: plan.canRenew !== false,
            isActive: plan.isActive !== false,
          }
        : emptyPlanForm
    )
    setPlanError('')
    setPlanOpen(true)
  }

  const validatePlan = () => {
    if (!planForm.name.trim()) return 'Plan name is required.'
    if (planForm.price === '' || Number(planForm.price) < 0) return 'Plan price must be zero or more.'
    if (!BILLING_CYCLES.includes(planForm.billingCycle)) return 'Choose a billing frequency.'
    if (Number(planForm.minQty) < 1) return 'Minimum quantity must be at least 1.'
    return ''
  }

  const submitPlan = async (event) => {
    event.preventDefault()
    const validationError = validatePlan()
    if (validationError) {
      setPlanError(validationError)
      return
    }

    setPlanSaving(true)
    setPlanError('')
    try {
      const payload = {
        name: planForm.name.trim(),
        price: Number(planForm.price),
        billingCycle: planForm.billingCycle,
        minQty: Number(planForm.minQty),
        autoClose: planForm.autoClose,
        canCloseEarly: planForm.canCloseEarly,
        canPause: planForm.canPause,
        canRenew: planForm.canRenew,
        isActive: planForm.isActive,
      }

      if (editingPlan) {
        await catalogApi.updatePlan(editingPlan._id, payload)
      } else {
        await catalogApi.createPlan(payload)
      }
      setPlanOpen(false)
      setNotice(editingPlan ? 'Plan updated.' : 'Plan created.')
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (err) {
      setPlanError(getApiError(err, 'Could not save the plan.'))
    } finally {
      setPlanSaving(false)
    }
  }

  const openTemplate = () => {
    setTemplateForm({
      ...emptyTemplateForm,
      lines: [{ ...emptyTemplateLine }],
    })
    setTemplateError('')
    setTemplateOpen(true)
  }

  const validateTemplate = () => {
    if (!templateForm.name.trim()) return 'Template name is required.'
    if (!templateForm.planId) return 'Select a plan.'
    if (Number(templateForm.validityDays) < 1) return 'Validity must be at least one day.'
    if (templateForm.lines.length === 0) return 'Add at least one template line.'
    if (templateForm.lines.some((line) => !line.productId)) {
      return 'Every template line needs a product.'
    }
    if (templateForm.lines.some((line) => Number(line.quantity) < 1)) {
      return 'Every template line needs a quantity of at least 1.'
    }
    return ''
  }

  const submitTemplate = async (event) => {
    event.preventDefault()
    const validationError = validateTemplate()
    if (validationError) {
      setTemplateError(validationError)
      return
    }

    setTemplateSaving(true)
    setTemplateError('')
    try {
      await catalogApi.createTemplate({
        name: templateForm.name.trim(),
        planId: templateForm.planId,
        validityDays: Number(templateForm.validityDays),
        paymentTerms: templateForm.paymentTerms,
        lines: templateForm.lines.map((line) => ({
          productId: line.productId,
          variantAttribute: line.variantAttribute || null,
          variantValue: line.variantValue || null,
          quantity: Number(line.quantity),
        })),
      })
      setTemplateOpen(false)
      setNotice('Quotation template created.')
      setLoading(true)
      setReloadKey((value) => value + 1)
    } catch (err) {
      setTemplateError(getApiError(err, 'Could not save the quotation template.'))
    } finally {
      setTemplateSaving(false)
    }
  }

  const tabAction =
    activeTab === 'products' ? (
      <button
        type="button"
        onClick={() => openProduct()}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add product
      </button>
    ) : activeTab === 'plans' ? (
      <button
        type="button"
        onClick={() => openPlan()}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add plan
      </button>
    ) : (
      <button
        type="button"
        onClick={openTemplate}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-colors hover:bg-indigo-500"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add template
      </button>
    )

  return (
    <InternalPage
      title="Catalog & Plans"
      description="Products, recurring plans and quotation templates used by the sales workflow."
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
          {tabAction}
        </>
      }
    >
      <Notice tone="error" onDismiss={() => setError('')}>{error}</Notice>
      <Notice tone="success" onDismiss={() => setNotice('')}>{notice}</Notice>

      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const count =
            tab.id === 'products'
              ? products.length
              : tab.id === 'plans'
                ? plans.length
                : templates.length
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-zinc-800 dark:bg-[#121216] dark:text-zinc-300 dark:hover:bg-zinc-800'
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800/80 dark:bg-[#121216]">
          <Loader2 className="size-6 animate-spin text-indigo-600 dark:text-indigo-400" aria-label="Loading catalog" />
        </div>
      ) : activeTab === 'products' ? (
        <TableShell>
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-5 pb-3 font-medium">Product</th>
                <th scope="col" className="px-5 pb-3 font-medium">Type</th>
                <th scope="col" className="px-5 pb-3 font-medium">Base price</th>
                <th scope="col" className="px-5 pb-3 font-medium">Variants / computed price</th>
                <th scope="col" className="px-5 pb-3 font-medium">Status</th>
                <th scope="col" className="px-5 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {products.length === 0 ? (
                <EmptyRow colSpan={6} message="No products yet. Add your first product." />
              ) : (
                products.map((product) => (
                  <tr key={product._id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800 dark:text-zinc-200">{product.name}</p>
                      {product.notes && <p className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">{product.notes}</p>}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{product.type}</td>
                    <td className="px-5 py-3 font-medium text-[#0B1A35] dark:text-white">{formatCurrency(product.salesPrice)}</td>
                    <td className="px-5 py-3">
                      {product.variants?.length ? (
                        <div className="flex flex-wrap gap-1.5">
                          {product.variants.map((variant, index) => (
                            <span
                              key={variant._id || index}
                              className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ${
                                variant.attribute === 'Brand' && variant.value === 'Odoo'
                                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-950/40 dark:text-indigo-300 dark:ring-indigo-500/20'
                                  : 'bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300'
                              }`}
                            >
                              {variantLabel(variant)}
                              <span className="ml-1 opacity-70">= {formatCurrency(productVariantPrice(product, variant))}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-zinc-500">Base price only</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge tone={product.isActive !== false ? 'emerald' : 'slate'}>
                        {product.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" onClick={() => openProduct(product)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300">
                        <Pencil className="size-3.5" aria-hidden="true" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      ) : activeTab === 'plans' ? (
        <TableShell>
          <table className="w-full min-w-[62rem] text-left text-sm">
            <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-5 pb-3 font-medium">Plan</th>
                <th scope="col" className="px-5 pb-3 font-medium">Price</th>
                <th scope="col" className="px-5 pb-3 font-medium">Frequency</th>
                <th scope="col" className="px-5 pb-3 font-medium">Min qty</th>
                <th scope="col" className="px-5 pb-3 font-medium">Lifecycle rules</th>
                <th scope="col" className="px-5 pb-3 font-medium">Status</th>
                <th scope="col" className="px-5 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {plans.length === 0 ? (
                <EmptyRow colSpan={7} message="No plans yet. Add your first recurring plan." />
              ) : (
                plans.map((plan) => (
                  <tr key={plan._id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-zinc-200">{plan.name}</td>
                    <td className="px-5 py-3 font-medium text-[#0B1A35] dark:text-white">{formatCurrency(plan.price)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{billingCycleLabel(plan.billingCycle)}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{plan.minQty || 1}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide">
                        {plan.autoClose && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">auto close</span>}
                        {plan.canCloseEarly === false && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">locked annual</span>}
                        {plan.canPause && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">pause</span>}
                        {plan.canRenew && <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300">renew</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge tone={plan.isActive !== false ? 'emerald' : 'slate'}>
                        {plan.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                      </StatusBadge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" onClick={() => openPlan(plan)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300">
                        <Pencil className="size-3.5" aria-hidden="true" /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      ) : (
        <TableShell>
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
              <tr>
                <th scope="col" className="px-5 pb-3 font-medium">Template</th>
                <th scope="col" className="px-5 pb-3 font-medium">Plan</th>
                <th scope="col" className="px-5 pb-3 font-medium">Validity</th>
                <th scope="col" className="px-5 pb-3 font-medium">Payment terms</th>
                <th scope="col" className="px-5 pb-3 font-medium">Lines</th>
                <th scope="col" className="px-5 pb-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {templates.length === 0 ? (
                <EmptyRow colSpan={6} message="No quotation templates yet. Build one from your products and plans." />
              ) : (
                templates.map((template) => (
                  <tr key={template._id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-zinc-800/40">
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-zinc-200">{template.name}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{template.planId?.name || '—'}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{template.validityDays} days</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{template.paymentTerms}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-zinc-400">{template.lines?.length || 0}</td>
                    <td className="px-5 py-3 text-right">
                      <button type="button" onClick={() => setViewTemplate(template)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300">
                        <Eye className="size-3.5" aria-hidden="true" /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </TableShell>
      )}

      <Modal
        open={productOpen}
        onClose={productSaving ? undefined : () => setProductOpen(false)}
        title={editingProduct ? 'Edit product' : 'Add product'}
        description="Products can carry variant price modifiers; the API calculates the final line price."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setProductOpen(false)} disabled={productSaving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
            <button type="submit" form="product-form" disabled={productSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {productSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingProduct ? 'Save changes' : 'Create product'}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={submitProduct} className="space-y-5" noValidate>
          {productError && <Notice tone="error">{productError}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="product-name" label="Name" required>
              <input id="product-name" value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="product-type" label="Type">
              <select id="product-type" value={productForm.type} onChange={(event) => setProductForm((current) => ({ ...current, type: event.target.value }))} className={inputClass}>
                {['SERVICE', 'CONSUMABLE', 'DIGITAL', 'ADDON'].map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </Field>
            <Field id="product-sales" label="Sales price (₹)" required>
              <input id="product-sales" type="number" min="0" step="0.01" value={productForm.salesPrice} onChange={(event) => setProductForm((current) => ({ ...current, salesPrice: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="product-cost" label="Cost price (₹)">
              <input id="product-cost" type="number" min="0" step="0.01" value={productForm.costPrice} onChange={(event) => setProductForm((current) => ({ ...current, costPrice: event.target.value }))} className={inputClass} />
            </Field>
          </div>
          <Field id="product-notes" label="Notes">
            <textarea id="product-notes" rows="2" value={productForm.notes} onChange={(event) => setProductForm((current) => ({ ...current, notes: event.target.value }))} className={inputClass} />
          </Field>
          <Checkbox id="product-active" label="Product is active" checked={productForm.isActive} onChange={(event) => setProductForm((current) => ({ ...current, isActive: event.target.checked }))} />
          <VariantEditor variants={productForm.variants} setVariants={(variants) => setProductForm((current) => ({ ...current, variants: typeof variants === 'function' ? variants(current.variants) : variants }))} disabled={productSaving} />
          {productForm.salesPrice !== '' && productForm.variants.length > 0 && (
            <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-zinc-800/40 dark:text-zinc-400">
              Odoo Brand preview: {formatCurrency(Number(productForm.salesPrice) + 560)} for Brand: Odoo (+₹560).
            </div>
          )}
        </form>
      </Modal>

      <Modal
        open={planOpen}
        onClose={planSaving ? undefined : () => setPlanOpen(false)}
        title={editingPlan ? 'Edit plan' : 'Add plan'}
        description="Plans define billing frequency, minimum quantity and lifecycle permissions."
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setPlanOpen(false)} disabled={planSaving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
            <button type="submit" form="plan-form" disabled={planSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {planSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {editingPlan ? 'Save changes' : 'Create plan'}
            </button>
          </>
        }
      >
        <form id="plan-form" onSubmit={submitPlan} className="space-y-5" noValidate>
          {planError && <Notice tone="error">{planError}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="plan-name" label="Name" required>
              <input id="plan-name" value={planForm.name} onChange={(event) => setPlanForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="plan-price" label="Price (₹)" required>
              <input id="plan-price" type="number" min="0" step="0.01" value={planForm.price} onChange={(event) => setPlanForm((current) => ({ ...current, price: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="plan-cycle" label="Billing frequency" required>
              <select id="plan-cycle" value={planForm.billingCycle} onChange={(event) => setPlanForm((current) => ({ ...current, billingCycle: event.target.value }))} className={inputClass}>
                {BILLING_CYCLES.map((cycle) => <option key={cycle} value={cycle}>{billingCycleLabel(cycle)}</option>)}
              </select>
            </Field>
            <Field id="plan-minqty" label="Minimum quantity" required>
              <input id="plan-minqty" type="number" min="1" step="1" value={planForm.minQty} onChange={(event) => setPlanForm((current) => ({ ...current, minQty: event.target.value }))} className={inputClass} required />
            </Field>
          </div>
          <div className="grid gap-3 rounded-xl border border-slate-200 p-4 dark:border-zinc-800 sm:grid-cols-2">
            <Checkbox id="plan-autoclose" label="Auto-close at expiry" checked={planForm.autoClose} onChange={(event) => setPlanForm((current) => ({ ...current, autoClose: event.target.checked }))} />
            <Checkbox id="plan-close-early" label="Allow early close" checked={planForm.canCloseEarly} onChange={(event) => setPlanForm((current) => ({ ...current, canCloseEarly: event.target.checked }))} />
            <Checkbox id="plan-pause" label="Allow pause" checked={planForm.canPause} onChange={(event) => setPlanForm((current) => ({ ...current, canPause: event.target.checked }))} />
            <Checkbox id="plan-renew" label="Allow renewal" checked={planForm.canRenew} onChange={(event) => setPlanForm((current) => ({ ...current, canRenew: event.target.checked }))} />
            <Checkbox id="plan-active" label="Plan is active" checked={planForm.isActive} onChange={(event) => setPlanForm((current) => ({ ...current, isActive: event.target.checked }))} />
          </div>
        </form>
      </Modal>

      <Modal
        open={templateOpen}
        onClose={templateSaving ? undefined : () => setTemplateOpen(false)}
        title="Add quotation template"
        description="Templates auto-populate a subscription's plan, validity and line items."
        size="xl"
        footer={
          <>
            <button type="button" onClick={() => setTemplateOpen(false)} disabled={templateSaving} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800">Cancel</button>
            <button type="submit" form="template-form" disabled={templateSaving} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
              {templateSaving && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              Create template
            </button>
          </>
        }
      >
        <form id="template-form" onSubmit={submitTemplate} className="space-y-5" noValidate>
          {templateError && <Notice tone="error">{templateError}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="template-name" label="Template name" required>
              <input id="template-name" value={templateForm.name} onChange={(event) => setTemplateForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="template-plan" label="Plan" required>
              <select id="template-plan" value={templateForm.planId} onChange={(event) => setTemplateForm((current) => ({ ...current, planId: event.target.value }))} className={inputClass} required>
                <option value="">Select a plan</option>
                {plans.map((plan) => <option key={plan._id} value={plan._id}>{plan.name}</option>)}
              </select>
            </Field>
            <Field id="template-validity" label="Validity (days)" required>
              <input id="template-validity" type="number" min="1" step="1" value={templateForm.validityDays} onChange={(event) => setTemplateForm((current) => ({ ...current, validityDays: event.target.value }))} className={inputClass} required />
            </Field>
            <Field id="template-terms" label="Payment terms">
              <select id="template-terms" value={templateForm.paymentTerms} onChange={(event) => setTemplateForm((current) => ({ ...current, paymentTerms: event.target.value }))} className={inputClass}>
                {PAYMENT_TERMS.map((term) => <option key={term} value={term}>{term}</option>)}
              </select>
            </Field>
          </div>
          <TemplateLineEditor
            lines={templateForm.lines}
            setLines={(lines) => setTemplateForm((current) => ({ ...current, lines: typeof lines === 'function' ? lines(current.lines) : lines }))}
            products={activeProducts}
            disabled={templateSaving}
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(viewTemplate)}
        onClose={() => setViewTemplate(null)}
        title={viewTemplate?.name || 'Quotation template'}
        description={viewTemplate ? `${viewTemplate.planId?.name || 'Plan'} · ${viewTemplate.validityDays} days validity` : ''}
        size="lg"
      >
        {viewTemplate && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-zinc-400">
              <span>Payment terms: <strong className="text-[#0B1A35] dark:text-white">{viewTemplate.paymentTerms}</strong></span>
              <span>Lines: <strong className="text-[#0B1A35] dark:text-white">{viewTemplate.lines?.length || 0}</strong></span>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-zinc-800">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-zinc-800/40 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-4 py-2.5 font-medium">Product</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Variant</th>
                    <th scope="col" className="px-4 py-2.5 font-medium">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {(viewTemplate.lines || []).map((line, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.productId?.name || 'Product'}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-zinc-400">{line.variantValue ? `${line.variantAttribute}: ${line.variantValue}` : '—'}</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-zinc-300">{line.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </InternalPage>
  )
}
