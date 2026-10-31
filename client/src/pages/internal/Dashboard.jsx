import { useEffect, useState } from 'react'
import { KpiCards } from '../../components/dashboard/KpiCards'
import { QuickActions } from '../../components/dashboard/QuickActions'
import { RecentTable } from '../../components/dashboard/RecentTable'
import { RevenueChart } from '../../components/dashboard/RevenueChart'
import { toDashboardUser } from '../../components/dashboard/nav'
import { Sidebar } from '../../components/dashboard/Sidebar'
import { SubscriptionOverview } from '../../components/dashboard/SubscriptionOverview'
import { TopBar } from '../../components/dashboard/TopBar'
import { StatusBadge } from '../../components/dashboard/primitives'
import { useAuth } from '../../context/auth-context'
import { billingApi, subscriptionApi } from '../../services/api'

export default function InternalDashboard() {
  const { user } = useAuth()
  const dashboardUser = toDashboardUser(user)

  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [recentSubscriptions, setRecentSubscriptions] = useState([])
  const [recentInvoices, setRecentInvoices] = useState([])
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        setLoading(true)
        const [dashRes, subsRes, invRes, payRes] = await Promise.allSettled([
          billingApi.getDashboard(),
          subscriptionApi.getAll({ limit: 5 }),
          billingApi.getInvoices({ limit: 5 }),
          billingApi.getPayments(),
        ])

        if (!active) return

        if (dashRes.status === 'fulfilled' && dashRes.value.data?.data) {
          setDashboardData(dashRes.value.data.data)
        }

        if (subsRes.status === 'fulfilled' && subsRes.value.data?.data) {
          const rawSubs = Array.isArray(subsRes.value.data.data)
            ? subsRes.value.data.data
            : subsRes.value.data.data.subscriptions || []
          setRecentSubscriptions(rawSubs.slice(0, 5))
        }

        if (invRes.status === 'fulfilled' && invRes.value.data?.data) {
          const rawInvs = Array.isArray(invRes.value.data.data)
            ? invRes.value.data.data
            : invRes.value.data.data.invoices || []
          setRecentInvoices(rawInvs.slice(0, 5))
        }

        if (payRes.status === 'fulfilled' && payRes.value.data?.data) {
          const rawPays = Array.isArray(payRes.value.data.data)
            ? payRes.value.data.data
            : []
          setRecentPayments(rawPays.slice(0, 5))
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [])

  // KPI mappings from backend
  const kpiValues = dashboardData?.kpis
    ? {
        totalRevenue: dashboardData.kpis.collectedRevenue,
        activeSubscriptions: dashboardData.kpis.activeSubscriptions,
        mrr: dashboardData.kpis.activeRecurringValue,
        outstandingInvoices: dashboardData.kpis.outstandingOwed,
        paymentsReceived: dashboardData.kpis.collectedRevenue,
        churnRate: 0,
      }
    : null

  // Map status counts
  const statusCounts = {}
  if (dashboardData?.subscriptionsByStatus) {
    dashboardData.subscriptionsByStatus.forEach((item) => {
      if (item._id) statusCounts[item._id.toUpperCase()] = item.count
    })
  }

  const getSubTone = (status) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'emerald'
      case 'CONFIRMED':
        return 'blue'
      case 'QUOTATION':
        return 'amber'
      case 'DRAFT':
      case 'CLOSED':
      default:
        return 'slate'
    }
  }

  const getInvTone = (inv) => {
    if (inv.status === 'PAID') return 'emerald'
    if (inv.isOverdue) return 'rose'
    if (inv.status === 'CONFIRMED') return 'amber'
    return 'slate'
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#070709] font-sans text-[#0B1A35] dark:text-zinc-100 antialiased transition-colors">
      <Sidebar user={dashboardUser} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title="Dashboard" user={dashboardUser} />
        <div className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <QuickActions />

          <KpiCards data={kpiValues} loading={loading} />

          <div className="grid gap-6 xl:grid-cols-3">
            <RevenueChart className="xl:col-span-2" />
            <SubscriptionOverview statusCounts={statusCounts} />
          </div>

          <RecentTable
            title="Recent subscriptions"
            columns={['Subscription ID', 'Customer', 'Plan', 'Amount', 'Status', 'Next billing']}
            emptyMessage="Subscriptions appear here once the subscriptions data is connected."
            viewAllHref="/subscriptions"
            viewAllLabel="View all"
            rows={recentSubscriptions}
            renderRow={(sub, idx) => (
              <tr key={sub._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  {sub.subNumber || sub._id?.slice(-8)}
                </td>
                <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
                  {sub.customerId?.name || sub.customerId?.email || 'Customer'}
                </td>
                <td className="px-5 py-3 text-sm text-slate-600 dark:text-zinc-400">
                  {sub.planId?.name || 'Custom Plan'}
                </td>
                <td className="px-5 py-3 text-sm font-medium text-[#0B1A35] dark:text-white">
                  ₹{Number(sub.grandTotal || 0).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-sm">
                  <StatusBadge tone={getSubTone(sub.status)}>{sub.status}</StatusBadge>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500 dark:text-zinc-400">
                  {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString() : '—'}
                </td>
              </tr>
            )}
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentTable
              title="Recent invoices"
              columns={['Invoice', 'Customer', 'Amount', 'Due date', 'Status']}
              emptyMessage="Invoices appear here once the invoices data is connected."
              viewAllHref="/invoices"
              viewAllLabel="View all"
              rows={recentInvoices}
              renderRow={(inv, idx) => (
                <tr key={inv._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {inv.invNumber || inv._id?.slice(-8)}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
                    {inv.customerId?.name || inv.customerId?.email || 'Customer'}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-[#0B1A35] dark:text-white">
                    ₹{Number(inv.grandTotal || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-zinc-400">
                    {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm">
                    <StatusBadge tone={getInvTone(inv)}>{inv.status}</StatusBadge>
                  </td>
                </tr>
              )}
            />

            <RecentTable
              title="Recent payments"
              columns={['Reference', 'Customer', 'Amount', 'Date', 'Status']}
              emptyMessage="Payments appear here once the payments data is connected."
              viewAllHref="/payments"
              viewAllLabel="View all"
              rows={recentPayments}
              renderRow={(pay, idx) => (
                <tr key={pay._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {pay._id?.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-700 dark:text-zinc-300">
                    {pay.customerId?.name || pay.customerId?.email || 'Customer'}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    +₹{Number(pay.amount || 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500 dark:text-zinc-400">
                    {pay.paymentDate ? new Date(pay.paymentDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm">
                    <StatusBadge tone="emerald">PAID</StatusBadge>
                  </td>
                </tr>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
