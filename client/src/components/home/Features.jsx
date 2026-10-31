import { CreditCard, Percent, Receipt, Repeat, TrendingUp, Wallet } from 'lucide-react'

const FEATURES = [
  {
    title: 'Subscription Management',
    description:
      'Create plans, add or pause subscriptions, and manage upgrades and cancellations from one view.',
    icon: Repeat,
  },
  {
    title: 'Automated Billing',
    description:
      'Charge customers on schedule with recurring billing that retries failed payments for you.',
    icon: CreditCard,
  },
  {
    title: 'Invoice Management',
    description:
      'Generate, send, and track invoices automatically so every billing cycle is documented.',
    icon: Receipt,
  },
  {
    title: 'Payment Tracking',
    description:
      'See every payment as it lands, spot failures early, and reconcile collections in seconds.',
    icon: Wallet,
  },
  {
    title: 'Discounts and Taxes',
    description:
      'Apply coupons, trials, and regional tax rules to plans without touching your pricing logic.',
    icon: Percent,
  },
  {
    title: 'Revenue Analytics',
    description:
      'Track MRR, churn, and collected revenue with charts that update as your subscriptions change.',
    icon: TrendingUp,
  },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-16 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Features</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1A35] sm:text-4xl">
            Everything you need to run recurring revenue
          </h2>
          <p className="mt-4 text-base text-slate-600">
            From the first signup to the final payment, Brightloop handles the work behind every
            subscription.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-600/10"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-[#0B1A35]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
