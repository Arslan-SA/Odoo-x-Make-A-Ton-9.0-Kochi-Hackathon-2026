import { useState } from 'react'
import { Loader2, Plus, Users } from 'lucide-react'
import FormField from '../auth/FormField'
import { userApi } from '../../services/api'
import { getApiError } from '../../utils/apiError'
import { validatePassword, PASSWORD_HINT } from '../../utils/password'

const EMPTY_FORM = { name: '', email: '', company: '', password: '' }

export default function StaffSection({ staff, onChanged }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setSubmitting(true)
    try {
      await userApi.createStaff(form)
      setForm(EMPTY_FORM)
      await onChanged()
      setNotice(`${form.name} can now sign in with the staff role.`)
    } catch (err) {
      setError(getApiError(err, 'Could not create the staff account.'))
    } finally {
      setSubmitting(false)
    }
  }

  const toggleStatus = async (member) => {
    setError('')
    setNotice('')
    setTogglingId(member.id)
    try {
      await userApi.updateStaffStatus(member.id, !member.isActive)
      await onChanged()
      setNotice(`${member.name} is now ${member.isActive ? 'disabled' : 'active'}.`)
    } catch (err) {
      setError(getApiError(err, 'Could not update the staff account.'))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Users className="size-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold">Staff accounts</h2>
            <p className="mt-1 text-sm text-slate-500">
              Staff can run catalog, subscription and billing operations, but cannot change
              workspace settings.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {staff.length} {staff.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
        <FormField
          id="staff-name"
          label="Full name"
          value={form.name}
          onChange={updateField('name')}
          placeholder="Riya Menon"
          required
        />
        <FormField
          id="staff-email"
          label="Work email"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          placeholder="riya@brightloop.dev"
          required
        />
        <FormField
          id="staff-company"
          label="Team"
          value={form.company}
          onChange={updateField('company')}
          placeholder="Operations"
        />
        <FormField
          id="staff-password"
          label="Temporary password"
          type="password"
          value={form.password}
          onChange={updateField('password')}
          placeholder="Set an initial password"
          hint={PASSWORD_HINT}
          required
        />
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            {submitting ? 'Adding staff…' : 'Add staff account'}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
        {staff.length === 0 ? (
          <p className="px-4 py-6 text-sm text-slate-500">
            No staff accounts yet. Add the first one above.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {staff.map((member) => (
              <li
                key={member.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">
                    {member.name}
                    <span className="ml-2 rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-700">
                      staff
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {member.email}
                    {member.company ? ` · ${member.company}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-semibold ${
                      member.isActive ? 'text-emerald-600' : 'text-slate-400'
                    }`}
                  >
                    {member.isActive ? 'Active' : 'Disabled'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleStatus(member)}
                    disabled={togglingId === member.id}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
                  >
                    {togglingId === member.id
                      ? 'Updating…'
                      : member.isActive
                        ? 'Deactivate'
                        : 'Activate'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
