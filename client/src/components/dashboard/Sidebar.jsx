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
        className={cn(NAV_ITEM_BASE, 'cursor-not-allowed text-slate-400 dark:text-zinc-600', collapsed && 'justify-center')}
      >
        {content}
      </span>
    );
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
            ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/70 hover:text-[#0B1A35] dark:hover:text-white'
        )
      }
    >
      {content}
    </NavLink>
  )
}

function SidebarNav({ collapsed, onNavigate, role }) {
  const items = DASHBOARD_NAV.filter((item) => !item.roles || item.roles.includes(role))

  return (
    <nav aria-label="Main" className="space-y-1 px-3">
      {items.map((item) => (
        <NavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />
      ))}
    </nav>
  )
}

function ProfileSummary({ user, collapsed }) {
  if (!user) return null

  return (
    <div className={cn('flex items-center gap-3 border-t border-slate-200 dark:border-zinc-800/80 p-3', collapsed && 'justify-center')}>
      <UserAvatar initials={user.initials} />
      {!collapsed && (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[#0B1A35] dark:text-white">{user.name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-zinc-400">{user.roleLabel}</p>
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
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0f0f13] transition-[width,background-color] duration-200 md:flex',
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
          className="flex size-8 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#0B1A35] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          {collapsed ? <PanelLeftOpen className="size-5" aria-hidden="true" /> : <PanelLeftClose className="size-5" aria-hidden="true" />}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} role={user?.role} />
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
        className="flex size-9 items-center justify-center rounded-lg text-slate-600 dark:text-zinc-300 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 md:hidden focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />
          <div className="relative flex w-72 max-w-full flex-col bg-white dark:bg-[#0f0f13] shadow-xl border-r dark:border-zinc-800">
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-zinc-800/80">
              <Brand />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-8 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <SidebarNav collapsed={false} onNavigate={() => setOpen(false)} role={user?.role} />
            </div>
            <ProfileSummary user={user} collapsed={false} />
          </div>
        </div>
      )}
    </>
  )
}
