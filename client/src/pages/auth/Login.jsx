import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/auth-context'
import { getApiError } from '../../utils/apiError'
import { roleHome } from '../../utils/roleHome'

const DEMO_ACCOUNTS = [
  { label: 'Admin demo', email: 'admin@brightloop.dev', password: 'Admin@12345' },
  { label: 'Staff demo', email: 'staff@brightloop.dev', password: 'Staff@12345' },
  { label: 'Customer demo', email: 'customer@brightloop.dev', password: 'Customer@12345' },
]

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (user) {
    return <Navigate to={roleHome(user)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const loggedIn = await login({ email, password })
      const redirectTo = location.state?.from?.pathname || roleHome(loggedIn)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Could not sign in. Check your details and try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0B1A35]">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to manage subscriptions, invoices and your catalog.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />

        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          autoComplete="current-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="rounded-md p-2 text-slate-400 transition-colors hover:text-slate-600"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          }
        />

        <div className="-mt-1 flex justify-end">
          <Link
            to="/forgot-password"
            className="text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {account.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-400">
          Run <code className="rounded bg-slate-100 px-1 py-0.5">npm run seed:auth</code> in{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">server/</code> to create them.
        </p>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Brightloop?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}
