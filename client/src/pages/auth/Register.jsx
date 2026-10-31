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

      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        <FormField
          id="name"
          label="Full name"
          value={form.name}
          onChange={updateField('name')}
          placeholder="Ada Lovelace"
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
          label="Company (optional)"
          value={form.company}
          onChange={updateField('company')}
          placeholder="Acme Retail"
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
          required
          hint={PASSWORD_HINT}
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
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-md transition-all hover:bg-zinc-100 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-zinc-500 pt-1">
          The first account created automatically becomes the workspace admin.
        </p>
      </form>
    </AuthLayout>
  )
}
