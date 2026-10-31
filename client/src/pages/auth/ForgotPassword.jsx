import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/auth-context'
import { authApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { validateEmail } from '../../utils/email'
import { roleHome } from '../../utils/roleHome'

export default function ForgotPassword() {
  const { user } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState('')

  if (user) {
    return <Navigate to={roleHome(user)} replace />
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }

    setSubmitting(true)
    try {
      const { data } = await authApi.forgotPassword({ email })
      setSent(true)
      setDevResetUrl(data.devResetUrl || '')
    } catch (err) {
      setError(getApiError(err, 'Could not send the reset link. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-white">Reset password</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Enter your email and we'll send you a recovery link
        </p>
      </div>

      {sent ? (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-5 text-emerald-200">
          <MailCheck className="size-6 text-emerald-400" aria-hidden="true" />
          <h3 className="mt-2 text-sm font-semibold text-white">Check your inbox</h3>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            If an account exists for {email}, a reset link has been dispatched (expires in 60 minutes).
          </p>

          {devResetUrl && (
            <div className="mt-3 rounded-lg border border-zinc-700/60 bg-zinc-900/60 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                Development fallback
              </p>
              <a
                href={devResetUrl}
                className="mt-1 inline-block break-all text-xs font-medium text-white underline hover:text-zinc-200"
              >
                Click to open reset link
              </a>
            </div>
          )}

          <div className="mt-5">
            <Link
              to="/login"
              className="text-xs font-semibold text-white hover:underline"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <>
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
              placeholder="you@company.com"
              autoComplete="email"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Sending link…' : 'Send recovery link'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-zinc-400">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-white hover:underline">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
