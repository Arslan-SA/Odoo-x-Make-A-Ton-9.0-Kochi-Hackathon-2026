import { Bell, LogOut, Search, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
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
        className="flex items-center gap-2 rounded-xl p-1 pr-2 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        <UserAvatar initials={user?.initials || 'U'} />
        <span className="hidden text-left lg:block">
          <span className="block text-sm font-medium leading-tight text-[#0B1A35]">{user?.name}</span>
          <span className="block text-xs text-slate-500">{user?.roleLabel}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-slate-100">
            <span className="block truncate text-sm font-medium text-[#0B1A35]">{user?.name}</span>
            <span className="block truncate text-xs text-slate-500">{user?.email}</span>
          </div>

          <div className="py-1">
            {user?.role === 'admin' && (
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="size-4" aria-hidden="true" />
                Admin Settings
              </Link>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-6">
      <MobileNav user={user} />
      <h1 className="text-lg font-semibold tracking-tight text-[#0B1A35]">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <label className="relative hidden sm:block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            disabled
            placeholder="Search"
            title="Search is available once data is connected"
            className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-[#0B1A35] placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        </label>
        <button
          type="button"
          disabled
          aria-label="Notifications"
          title="No notification source connected"
          className="relative flex size-9 items-center justify-center rounded-lg text-slate-400 disabled:cursor-not-allowed"
        >
          <Bell className="size-5" aria-hidden="true" />
        </button>
        <ProfileMenu user={user} />
      </div>
    </header>
  )
}
