import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Loader2, MailCheck } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/auth-context'
import { authApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
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
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0B1A35]">Forgot your password?</h2>
        <p className="mt-2 text-sm text-slate-500">
          Enter the email on your account and we will send you a reset link.
        </p>
      </div>

      {sent ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <MailCheck className="size-8 text-emerald-600" aria-hidden="true" />
          <h3 className="mt-3 text-base font-semibold text-emerald-900">Check your inbox</h3>
          <p className="mt-1.5 text-sm leading-6 text-emerald-800">
            If an account exists for {email}, a reset link is on its way. The link expires in 60
            minutes.
          </p>

          {devResetUrl && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Local development
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                SMTP is not configured, so use this link directly:
              </p>
              <a
                href={devResetUrl}
                className="mt-2 inline-block break-all text-sm font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Open reset link
              </a>
            </div>
          )}

          <Link
            to="/login"
            className="mt-5 inline-flex text-sm font-semibold text-emerald-800 hover:text-emerald-700"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
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

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {submitting ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Remembered it?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
