import { useAuth } from '../../context/auth-context'
import { toDashboardUser } from '../dashboard/nav'
import { Sidebar } from '../dashboard/Sidebar'
import { TopBar } from '../dashboard/TopBar'

export default function InternalPage({ title, description, actions, children }) {
  const { user } = useAuth()
  const dashboardUser = toDashboardUser(user)

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-[#0B1A35] antialiased transition-colors dark:bg-[#070709] dark:text-zinc-100">
      <Sidebar user={dashboardUser} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} user={dashboardUser} />
        <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
                Operations
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#0B1A35] dark:text-white">
                {title}
              </h2>
              {description && (
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 dark:text-zinc-400">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
