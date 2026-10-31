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
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">Welcome back</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Sign in to your account
        </p>
      </div>

      {/* Segmented Control: Create account / Sign in */}
      <div className="mt-5 mb-5 flex rounded-xl bg-[#1c1c22] p-1 border border-zinc-800/80">
        <Link
          to="/register"
          className="flex-1 rounded-lg py-1.5 text-center text-xs font-medium text-zinc-400 transition hover:text-white"
        >
          Create account
        </Link>
        <button
          type="button"
          className="flex-1 rounded-lg bg-[#2b2b33] py-1.5 text-center text-xs font-medium text-white shadow-xs"
        >
          Sign in
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300"
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
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          autoComplete="current-password"
          required
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="rounded-md p-1.5 text-zinc-400 transition hover:text-zinc-200"
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

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-xs text-zinc-400 transition hover:text-zinc-200"
          >
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Demo Accounts Pill List */}
      <div className="mt-6 pt-5 border-t border-zinc-800/60">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Demo accounts
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemo(account)}
              className="rounded-lg border border-zinc-700/60 bg-zinc-800/40 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:bg-zinc-700/60 hover:text-white"
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
