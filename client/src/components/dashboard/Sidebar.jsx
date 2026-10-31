import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Brand from '../home/Brand'
import { cn } from '../../utils/cn'
import { DASHBOARD_NAV } from './nav'
import { UserAvatar } from './UserAvatar'

const NAV_ITEM_BASE =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

function NavItem({ item, collapsed, onNavigate }) {
  const Icon = item.icon
  const content = (
    <>
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className={cn('truncate', collapsed && 'sr-only')}>{item.label}</span>
    </>
  )

  if (!item.available) {
    return (
      <span
        aria-disabled="true"
        title="Not available yet"
        className={cn(NAV_ITEM_BASE, 'cursor-not-allowed text-slate-400', collapsed && 'justify-center')}
      >
        {content}
      </span>
    )
  }

  return (
    <NavLink
      to={item.href}
      end
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          NAV_ITEM_BASE,
          collapsed && 'justify-center',
          isActive
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-100 hover:text-[#0B1A35]'
        )
      }
    >
      {content}
    </NavLink>
  )
}

function SidebarNav({ collapsed, onNavigate }) {
  return (
    <nav aria-label="Main" className="space-y-1 px-3">
      {DASHBOARD_NAV.map((item) => (
        <NavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

function ProfileSummary({ user, collapsed }) {
  if (!user) return null

  return (
    <div className={cn('flex items-center gap-3 border-t border-slate-200 p-3', collapsed && 'justify-center')}>
      <UserAvatar initials={user.initials} />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#0B1A35]">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.roleLabel}</p>
        </div>
      )}
    </div>
  )
}

export function Sidebar({ user }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-[width] duration-200 md:flex',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className={cn('flex h-16 items-center gap-2 px-4', collapsed ? 'justify-center' : 'justify-between')}>
        {!collapsed && <Brand />}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#0B1A35] focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          {collapsed ? <PanelLeftOpen className="size-5" aria-hidden="true" /> : <PanelLeftClose className="size-5" aria-hidden="true" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} />
      </div>
      <ProfileSummary user={user} collapsed={collapsed} />
    </aside>
  )
}

export function MobileNav({ user }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex size-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 md:hidden focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-72 max-w-full flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav collapsed={false} onNavigate={() => setOpen(false)} />
            </div>
            <ProfileSummary user={user} collapsed={false} />
          </div>
        </div>
      )}
    </>
  )
}
