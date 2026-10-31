import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const HIGHLIGHTS = [
  'Recurring plans, quotations and invoices in one flow.',
  'Role-based workspaces for admins and customers.',
  'Live subscription metrics without spreadsheets.',
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#0B1A35] px-12 py-12 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-24 top-1/4 size-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-sky-500/20 blur-3xl" />

        <Link to="/" className="relative inline-flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-950/40">
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-none stroke-white"
              strokeWidth={2.4}
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 12a8 8 0 1 0 2.34-5.66" />
              <path d="M4 4v4h4" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">Brightloop</span>
        </Link>

        <div className="relative my-auto max-w-md py-12">
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-indigo-200">
            Subscription operations
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white">
            Billing that runs itself, so your team can build.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">
            One workspace for plans, quotations, subscriptions and invoices — with a clear
            separation between the people selling and the people buying.
          </p>

          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-200">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-indigo-300" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-400">
          Odoo x Make-A-Ton 9.0 · Kochi 2026
        </p>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-6 sm:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#0B1A35]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back to home
          </Link>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1A35] lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700">
              <svg
                viewBox="0 0 24 24"
                className="size-4 fill-none stroke-white"
                strokeWidth={2.4}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 12a8 8 0 1 0 2.34-5.66" />
                <path d="M4 4v4h4" />
              </svg>
            </span>
            Brightloop
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-10">
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="px-5 pb-6 text-center text-xs text-slate-400">
          Brightloop · Subscription operations for modern teams
        </p>
      </main>
    </div>
  )
}
