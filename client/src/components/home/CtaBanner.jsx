export default function CtaBanner() {
  return (
    <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-24">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 px-6 py-16 text-center shadow-2xl shadow-indigo-600/25 sm:px-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-2xl"
        />
        <h2 className="relative text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Ready to simplify subscription management?
        </h2>
        <p className="relative mx-auto mt-4 max-w-xl text-indigo-100">
          Start billing your customers on autopilot and see every dollar you collect.
        </p>
        <button
          type="button"
          className="relative mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-xl"
        >
          Get Started
        </button>
      </div>
    </section>
  )
}
