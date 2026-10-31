export default function FormField({
  label,
  id,
  error,
  hint,
  trailing,
  className = '',
  ...inputProps
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-zinc-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`w-full rounded-xl border bg-[#18181c] px-3.5 py-2.5 text-sm text-white shadow-xs outline-none transition placeholder:text-zinc-500 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400/20 ${
            error ? 'border-red-500/70' : 'border-zinc-700/60'
          } ${trailing ? 'pr-11' : ''}`}
          {...inputProps}
        />
        {trailing && (
          <div className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</div>
        )}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
