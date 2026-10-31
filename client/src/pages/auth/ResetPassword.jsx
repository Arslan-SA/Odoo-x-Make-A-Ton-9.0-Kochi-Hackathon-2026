import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/auth-context'
import { authApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { validatePassword, PASSWORD_HINT } from '../../utils/password'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { logout } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      await authApi.resetPassword({ token, password })
      await logout()
      setDone(true)
    } catch (err) {
      setError(getApiError(err, 'Could not reset your password. Request a new link.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-5 text-red-200">
          <h2 className="text-sm font-semibold text-white">Reset link incomplete</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            The security token is missing from the URL. Please request a fresh reset link.
          </p>
          <div className="mt-4">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-white hover:underline"
            >
              Request a new link
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-emerald-200">
          <CheckCircle2 className="size-6 text-emerald-400" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-white">Password updated</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            Your new password has been set. Sign in to access your workspace.
          </p>
          <div className="mt-4">
            <Link
              to="/login"
              className="inline-flex rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-zinc-100"
            >
              Sign in now
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Set new password</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose a strong password you haven't used before
        </p>
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
          id="password"
          label="New password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
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

        <FormField
          id="confirmPassword"
          label="Confirm new password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="Repeat your new password"
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Updating password…' : 'Update password'}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-zinc-400">
        <Link to="/login" className="font-medium text-white hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
