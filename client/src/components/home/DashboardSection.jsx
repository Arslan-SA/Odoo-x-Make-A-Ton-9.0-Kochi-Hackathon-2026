import DashboardPreview from './DashboardPreview'

export default function DashboardSection() {
  return (
    <section id="dashboard" className="scroll-mt-16 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Dashboard</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1A35] sm:text-4xl">
            See your subscription business at a glance
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Active subscriptions, collected revenue, and outstanding invoices, updated as your
            customers pay.
          </p>
        </div>

        <DashboardPreview className="mx-auto mt-14 max-w-3xl transition-transform duration-500 hover:-translate-y-1" />
      </div>
    </section>
  )
}
