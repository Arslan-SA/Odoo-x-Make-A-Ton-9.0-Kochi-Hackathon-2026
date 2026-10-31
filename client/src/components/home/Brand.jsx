export default function Brand({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        aria-hidden="true"
        className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-sm shadow-indigo-600/30"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4.5 fill-none stroke-white"
          strokeWidth={2.4}
          strokeLinecap="round"
        >
          <path d="M4 12a8 8 0 1 0 2.34-5.66" />
          <path d="M4 4v4h4" />
        </svg>
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-[#0B1A35] dark:text-white">
        Brightloop
      </span>
    </span>
  )
}
