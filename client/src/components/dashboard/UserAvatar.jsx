import { cn } from '../../utils/cn'

export function UserAvatar({ initials, className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-100',
        className
      )}
    >
      {initials}
    </span>
  )
}
