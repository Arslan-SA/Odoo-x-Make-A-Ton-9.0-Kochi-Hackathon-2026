import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import AuthLayout from '../../components/auth/AuthLayout'
import FormField from '../../components/auth/FormField'
import { useAuth } from '../../context/auth-context'
import { getApiError } from '../../utils/apiError'
import { validatePassword, PASSWORD_HINT } from '../../utils/password'
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

  if (user) {
    return <Navigate to={roleHome(user)} replace />
  }

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

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
      const created = await register({
        name: form.name,
        email: form.email,
        company: form.company,
        password: form.password,
      })
      navigate(roleHome(created), { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Could not create your account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[#0B1A35]">Create your account</h2>
        <p className="mt-2 text-sm text-slate-500">
          Start with a customer workspace — no credit card required.
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
          id="name"
          label="Full name"
          value={form.name}
          onChange={updateField('name')}
          placeholder="Arslan SA"
          autoComplete="name"
          required
        />

        <FormField
          id="email"
          label="Work email"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          placeholder="you@company.com"
          autoComplete="email"
          required
        />

        <FormField
          id="company"
          label="Company"
          value={form.company}
          onChange={updateField('company')}
          placeholder="Acme Retail (optional)"
          autoComplete="organization"
        />

        <FormField
          id="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={updateField('password')}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          hint={PASSWORD_HINT}
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

        <FormField
          id="confirmPassword"
          label="Confirm password"
          type={showPassword ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-xs leading-5 text-slate-400">
          The first account created on a fresh database becomes the workspace admin.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
