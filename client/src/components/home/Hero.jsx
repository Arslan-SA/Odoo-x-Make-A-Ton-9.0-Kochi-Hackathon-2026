import { ArrowRight } from 'lucide-react'
import DashboardPreview from './DashboardPreview'
import scrollToSection from '../../utils/scrollToSection'

export default function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden scroll-mt-16 bg-gradient-to-b from-indigo-50/70 via-white to-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-2 lg:pb-28 lg:pt-24">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-white px-3 py-1 text-xs font-medium text-indigo-600 shadow-sm">
            Subscription billing, simplified
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-[#0B1A35] sm:text-5xl lg:text-6xl">
            Manage Subscriptions.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              Simplify Billing.
            </span>{' '}
            Grow Revenue.
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
            One powerful platform to manage subscriptions, automate recurring billing, track payments,
            and understand your revenue — all in one place.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <button
              type="button"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-xl sm:w-auto"
            >
              Get Started
              <ArrowRight
                className="size-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-[#0B1A35] shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:w-auto"
            >
              Explore Features
            </button>
          </div>
        </div>

        <div className="relative">
          <DashboardPreview className="relative transition-transform duration-500 hover:-translate-y-1 lg:rotate-1" />
        </div>
      </div>
    </section>
  )
}
