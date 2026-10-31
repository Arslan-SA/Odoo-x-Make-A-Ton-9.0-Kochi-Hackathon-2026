import { Boxes, ReceiptText, Repeat2, Settings, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppShell from '../../components/dashboard/AppShell'
import { useAuth } from '../../context/auth-context'

const MODULES = [
  {
    icon: Boxes,
    title: 'Catalog',
    detail: 'Products, plans and quotation templates',
    status: 'API ready',
  },
  {
    icon: Repeat2,
    title: 'Subscriptions',
    detail: 'Status transitions, pauses and renewals',
    status: 'API ready',
  },
  {
    icon: ReceiptText,
    title: 'Billing',
    detail: 'Invoices, payments, taxes and discounts',
    status: 'API ready',
  },
]

export default function InternalDashboard() {
  const { user } = useAuth()

  return (
    <AppShell
      eyebrow="Operations console"
      title={user?.role === 'admin' ? 'Admin workspace' : 'Staff workspace'}
      description="A protected area for the team running Brightloop. Access is limited to accounts with the admin or staff role."
    >
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold text-emerald-900">Internal access confirmed</h2>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Signed in as {user?.name} ({user?.email}) with the {user?.role} role. Customers are
              redirected to their own portal.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {MODULES.map(({ icon: Icon, title, detail, status }) => (
          <section
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                {status}
              </span>
            </div>
            <h2 className="mt-4 text-base font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{detail}</p>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 sm:p-8">
        <h2 className="text-base font-semibold">Next: wire the operations screens</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
          The catalog, subscription and billing APIs are live on the server. The next feature branch
          connects them to this console with tables, filters and lifecycle actions.
        </p>
        {user?.role === 'admin' && (
          <Link
            to="/settings"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            <Settings className="size-4" aria-hidden="true" />
            Open admin settings
          </Link>
        )}
      </section>
    </AppShell>
  )
}
