type IconProps = {
  className?: string
}

export function TicketlyMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 6h24v28H8z" fill="currentColor" />
      <path d="M8 14h24M8 26h24" stroke="var(--color-paper)" strokeWidth="3" strokeDasharray="4 3" />
      <path d="M17 13v14l10-7z" fill="var(--color-paper)" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m16 16 4.2 4.2" strokeLinecap="round" />
    </svg>
  )
}

export function HeartIcon({ filled = false, className }: IconProps & { filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M20.8 8.5c0 5.5-8.8 10.4-8.8 10.4S3.2 14 3.2 8.5A4.5 4.5 0 0 1 12 7.1a4.5 4.5 0 0 1 8.8 1.4Z" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUpRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function TicketIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 5.2h16v4a2.8 2.8 0 0 0 0 5.6v4H4v-4a2.8 2.8 0 0 0 0-5.6v-4Z" strokeLinejoin="round" />
      <path d="M12 7.4v9.2" strokeDasharray="2 2" strokeLinecap="round" />
    </svg>
  )
}

export function PinIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M19 10.2c0 5-7 9.8-7 9.8s-7-4.8-7-9.8a7 7 0 1 1 14 0Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="1" />
      <path d="M8 3.8v3.4M16 3.8v3.4M4 10h16" strokeLinecap="round" />
    </svg>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5" strokeLinecap="round" />
    </svg>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="m9.5 14.5 5-5M7.8 17.8l-1.1 1.1a3.3 3.3 0 0 1-4.7-4.7l3.2-3.2a3.3 3.3 0 0 1 4.7 0M16.2 6.2l1.1-1.1A3.3 3.3 0 0 1 22 9.8L18.8 13a3.3 3.3 0 0 1-4.7 0" strokeLinecap="round" />
    </svg>
  )
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M12 3v12m0 0 4.5-4.5M12 15l-4.5-4.5M4 19.5h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
