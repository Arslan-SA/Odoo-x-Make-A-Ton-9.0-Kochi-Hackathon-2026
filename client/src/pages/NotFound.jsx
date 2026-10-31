import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">404</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1A35]">
        This page does not exist
      </h1>
      <p className="mt-2 max-w-sm text-sm text-slate-500">
        The link may be out of date, or the page has moved.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
      >
        Back to home
      </Link>
    </div>
  )
}
