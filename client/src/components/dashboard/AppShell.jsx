import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Loader2, LogOut } from 'lucide-react'
import Brand from '../home/Brand'
import { useAuth } from '../../context/auth-context'
import { roleHome } from '../../utils/roleHome'

export default function AppShell({ eyebrow, title, description, children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)

  const roleBadgeClass =
    user?.role === 'admin'
      ? 'bg-indigo-50 text-indigo-700'
      : user?.role === 'staff'
        ? 'bg-sky-50 text-sky-700'
        : 'bg-emerald-50 text-emerald-700'

  const navClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 font-medium transition-colors ${
      isActive
        ? 'bg-slate-100 text-[#0B1A35]'
        : 'text-slate-500 hover:bg-slate-50 hover:text-[#0B1A35]'
    }`

  const handleLogout = async () => {
    setLoggingOut(true)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-[#0B1A35]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link to="/" aria-label="Brightloop home">
            <Brand />
          </Link>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            <NavLink to={roleHome(user)} className={navClass}>
              Dashboard
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/settings" className={navClass}>
                Settings
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden text-right lg:block">
              <p className="text-sm font-medium leading-5">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <span
              className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide sm:inline-flex ${roleBadgeClass}`}
            >
              {user?.role}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#0B1A35] disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <LogOut className="size-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  )
}
