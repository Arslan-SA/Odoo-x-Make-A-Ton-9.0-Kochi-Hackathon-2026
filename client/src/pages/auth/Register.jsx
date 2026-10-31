import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import OtpVerification from '../../components/auth/OtpVerification'
import { useAuth } from '../../context/auth-context'
import { getApiError } from '../../utils/apiError'
import { validatePassword, PASSWORD_HINT } from '../../utils/password'
import { validateEmail } from '../../utils/email'
import { roleHome } from '../../utils/roleHome'

export default function Register() {
  const { user, register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verifyingEmail, setVerifyingEmail] = useState('')

  if (user) {
    return <Navigate to={roleHome(user)} replace />
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const emailError = validateEmail(form.email)
    if (emailError) {
      setError(emailError)
      return
    }

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      setError(passwordError)
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    try {
      const result = await register({
        name: form.name,
        email: form.email,
        company: form.company,
        password: form.password,
      })

      if (result?.requireVerification) {
        setVerifyingEmail(form.email)
        return
      }

      navigate(roleHome(result), { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Could not create your account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      {verifyingEmail ? (
        <OtpVerification
          email={verifyingEmail}
          onVerified={(verifiedUser) => navigate(roleHome(verifiedUser), { replace: true })}
          onCancel={() => setVerifyingEmail('')}
        />
      ) : (
        <>
          {/* Title & Subtitle */}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Create an account</h2>
            <p className="mt-1 text-sm text-zinc-400">
              Get started with Brightloop today
            </p>
          </div>

          {/* Segmented Control */}
          <div className="mt-5 mb-5 flex rounded-xl bg-[#1c1c22] p-1 border border-zinc-800/80">
            <button
              type="button"
              className="flex-1 rounded-lg bg-[#2b2b33] py-1.5 text-center text-xs font-medium text-white shadow-xs"
            >
              Create account
            </button>
            <Link
              to="/login"
              className="flex-1 rounded-lg py-1.5 text-center text-xs font-medium text-zinc-400 transition hover:text-white"
            >
              Sign in
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-red-500/30 bg-red-950/40 px-3.5 py-2.5 text-xs text-red-300"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="name"
              label="Full name"
              value={form.name}
              onChange={updateField('name')}
              placeholder="e.g. Alex Chen"
              required
            />
            <FormField
              id="email"
              label="Work email"
              type="email"
              value={form.email}
              onChange={updateField('email')}
              placeholder="alex@acme.com"
              required
            />
            <FormField
              id="company"
              label="Company (optional)"
              value={form.company}
              onChange={updateField('company')}
              placeholder="Acme Corp"
            />
            <FormField
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={updateField('password')}
              placeholder="Create a password"
              required
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="rounded-lg p-1.5 text-zinc-400 transition hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              }
            />
            <FormField
              id="confirmPassword"
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={updateField('confirmPassword')}
              placeholder="Repeat your password"
              hint={PASSWORD_HINT}
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Creating account…' : 'Sign up'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-zinc-500">
            By creating an account, you agree to our{' '}
            <a href="#" className="underline hover:text-zinc-300">
              Terms
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-zinc-300">
              Privacy Policy
            </a>
            .
          </p>
        </>
      )}
    </AuthLayout>
  )
}
