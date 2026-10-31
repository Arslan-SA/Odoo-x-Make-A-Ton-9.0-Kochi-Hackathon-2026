export const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
})

export const formatCurrency = (value) => currency.format(Number(value || 0))

export const formatDate = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const SUBSCRIPTION_STATUSES = ['DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED']

export const subscriptionStatusTone = (status) => {
  switch (status) {
    case 'ACTIVE':
      return 'emerald'
    case 'CONFIRMED':
      return 'blue'
    case 'QUOTATION':
      return 'amber'
    case 'CLOSED':
      return 'slate'
    case 'DRAFT':
    default:
      return 'slate'
  }
}

export const invoiceStatusTone = (status) => {
  switch (status) {
    case 'PAID':
      return 'emerald'
    case 'CONFIRMED':
      return 'blue'
    case 'CANCELLED':
      return 'rose'
    case 'DRAFT':
    default:
      return 'slate'
  }
}

export const BILLING_CYCLES = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

export const billingCycleLabel = (cycle) =>
  cycle ? cycle.charAt(0) + cycle.slice(1).toLowerCase() : '—'

export const PAYMENT_TERMS = ['Immediate Payment', 'Net 15', 'Net 30', 'Net 45']
