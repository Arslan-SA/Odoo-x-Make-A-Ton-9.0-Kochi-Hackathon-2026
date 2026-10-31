import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Brand from './Brand'
import { useAuth } from '../../context/auth-context'
import { roleHome } from '../../utils/roleHome'
import scrollToSection from '../../utils/scrollToSection'

const NAV_LINKS = [
  { label: 'Features', href: 'features' },
  { label: 'About', href: 'about' },
  { label: 'Contact', href: 'contact' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user } = useAuth()

  const navigateTo = (id) => {
    setMenuOpen(false)
    // Wait for the menu to collapse so the scroll target isn't offset by its height.
    requestAnimationFrame(() => scrollToSection(id))
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          aria-label="Brightloop home"
        >
          <Brand />
        </button>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <button
                type="button"
                onClick={() => navigateTo(link.href)}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600"
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to={roleHome(user)}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-[#0B1A35] transition-colors hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="rounded-md p-2 text-[#0B1A35] md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" className="border-t border-slate-200 bg-white px-5 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => navigateTo(link.href)}
                  className="w-full rounded-md px-2 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-3">
            {user ? (
              <Link
                to={roleHome(user)}
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-[#0B1A35]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-medium text-white"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
