import { useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, MailCheck, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/auth-context'
import { getApiError } from '../../utils/apiError'

export default function OtpVerification({ email, onVerified, onCancel }) {
  const { verifyOtp, sendOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [countdown, setCountdown] = useState(30)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    const cleanOtp = otp.trim()
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code.')
      return
    }

    setSubmitting(true)
    try {
      const res = await verifyOtp({ email, otp: cleanOtp })
      setNotice('Email verified successfully! Redirecting...')
      setTimeout(() => {
        onVerified?.(res.data?.user)
      }, 700)
    } catch (err) {
      setError(getApiError(err, 'Invalid or expired verification code.'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || resending) return
    setError('')
    setNotice('')
    setResending(true)
    try {
      await sendOtp({ email })
      setNotice('A new 6-digit verification code has been dispatched to your email!')
      setCountdown(45)
    } catch (err) {
      setError(getApiError(err, 'Could not resend verification code. Please try again.'))
    } finally {
      setResending(false)
    }
  }

  const handleOtpChange = (e) => {
    // Only allow numbers and max 6 chars
    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
    setOtp(val)
    if (error) setError('')
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
          <MailCheck className="size-6" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight text-white">
          Verify your email
        </h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
          We sent a 6-digit code via Resend to{' '}
          <span className="font-medium text-white">{email}</span>.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/30 px-3.5 py-2.5 text-xs text-red-300"
        >
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3.5 py-2.5 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-center text-xs font-medium uppercase tracking-wider text-zinc-400">
            Enter 6-Digit Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={otp}
            onChange={handleOtpChange}
            placeholder="······"
            className="w-full rounded-xl border border-zinc-700/80 bg-[#141418] py-3 text-center font-mono text-2xl font-bold tracking-[0.4em] text-white shadow-xs outline-none transition placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || otp.length !== 6}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <KeyRound className="size-4" />
          )}
          {submitting ? 'Verifying…' : 'Verify & Continue'}
        </button>

        <div className="flex items-center justify-between pt-2 text-xs">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-zinc-400 transition hover:text-white"
            >
              ← Back
            </button>
          )}

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="ml-auto inline-flex items-center gap-1.5 text-indigo-400 transition hover:text-indigo-300 disabled:cursor-not-allowed disabled:text-zinc-500"
          >
            <RefreshCw className={`size-3 ${resending ? 'animate-spin' : ''}`} />
            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
          </button>
        </div>
      </form>
    </div>
  )
}
