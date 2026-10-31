import { ChevronRight } from 'lucide-react'

const STEPS = ['Customer Signup', 'Select Plan', 'Subscription', 'Invoice', 'Payment']

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-slate-50/70 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1A35] sm:text-4xl">
            From signup to payment in five steps
          </h2>
        </div>

        <ol className="mt-14 grid gap-4 md:grid-cols-5 md:gap-2">
          {STEPS.map((step, index) => (
            <li key={step} className="relative flex md:flex-col md:items-center">
              <div className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:flex-col md:text-center">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white shadow-md shadow-indigo-600/30">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold text-[#0B1A35]">{step}</span>
              </div>
              {index < STEPS.length - 1 && (
                <ChevronRight
                  className="absolute -bottom-4 left-1/2 size-5 -translate-x-1/2 rotate-90 text-indigo-300 md:-right-3 md:bottom-auto md:left-auto md:top-1/2 md:translate-x-0 md:-translate-y-1/2 md:rotate-0"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
