import { Bell, LogOut, Moon, Search, Settings, Sun } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useTheme } from '../../context/theme-context'
import { MobileNav } from './Sidebar'
import { UserAvatar } from './UserAvatar'

function ProfileMenu({ user }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800/80 focus-visible:outline-2 focus-visible:outline-indigo-600"
      >
        <UserAvatar initials={user?.initials || 'U'} />
        <span className="hidden text-left lg:block">
          <span className="block text-sm font-medium leading-tight text-[#0B1A35] dark:text-white">
            {user?.name}
          </span>
          <span className="block text-xs text-slate-500 dark:text-zinc-400">
            {user?.roleLabel}
          </span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#141418] p-2 shadow-xl z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-zinc-800/80">
            <span className="block truncate text-sm font-medium text-[#0B1A35] dark:text-white">
              {user?.name}
            </span>
            <span className="block truncate text-xs text-slate-500 dark:text-zinc-400">
              {user?.email}
            </span>
          </div>

          <div className="py-1">
            {user?.role === 'admin' && (
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <Settings className="size-4" aria-hidden="true" />
                Admin Settings
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TopBar({ title, user }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0f0f13]/90 px-4 backdrop-blur sm:px-6 transition-colors">
      <MobileNav user={user} />
      <h1 className="text-lg font-semibold tracking-tight text-[#0B1A35] dark:text-white">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <label className="relative hidden sm:block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" aria-hidden="true" />
          <input
            type="search"
            disabled
            placeholder="Search"
            title="Search is available once data is connected"
            className="h-9 w-56 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#18181c] pl-9 pr-3 text-sm text-[#0B1A35] dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-500 disabled:cursor-not-allowed"
          />
        </label>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex size-9 items-center justify-center rounded-lg text-slate-500 dark:text-zinc-400 transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-[#0B1A35] dark:hover:text-white focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          {isDark ? (
            <Sun className="size-4.5 text-amber-400" aria-hidden="true" />
          ) : (
            <Moon className="size-4.5 text-slate-600" aria-hidden="true" />
          )}
        </button>

        <button
          type="button"
          disabled
          aria-label="Notifications"
          title="No notification source connected"
          className="relative flex size-9 items-center justify-center rounded-lg text-slate-400 dark:text-zinc-600 disabled:cursor-not-allowed"
        >
          <Bell className="size-5" aria-hidden="true" />
        </button>

        <ProfileMenu user={user} />
      </div>
    </header>
  )
}
