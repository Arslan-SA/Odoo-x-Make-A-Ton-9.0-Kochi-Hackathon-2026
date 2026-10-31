import {
  CreditCard,
  FileText,
  LayoutDashboard,
  Package,
  Repeat,
  Settings,
  BarChart3,
} from 'lucide-react'

export const DASHBOARD_NAV = [
  { label: 'Dashboard', href: '/internal', icon: LayoutDashboard, available: true },
  { label: 'Catalog & Plans', href: '/catalog', icon: Package, available: false },
  { label: 'Subscriptions', href: '/subscriptions', icon: Repeat, available: false },
  { label: 'Invoices', href: '/invoices', icon: FileText, available: false },
  { label: 'Payments', href: '/payments', icon: CreditCard, available: false },
  { label: 'Finance Reports', href: '/finance-reports', icon: BarChart3, available: false },
  { label: 'Settings', href: '/settings', icon: Settings, available: true },
]

export function isRouteAvailable(href) {
  return DASHBOARD_NAV.some((item) => item.href === href && item.available)
}

export function toDashboardUser(user) {
  const email = user?.email || ''
  const name = user?.name?.trim() || email || 'Account'
  const role = user?.role || 'staff'
  const roleLabel = role === 'admin' ? 'Admin' : role === 'staff' ? 'Staff' : 'Customer'
  const letters = name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return { name, email, role, roleLabel, initials: letters || '?' }
}
