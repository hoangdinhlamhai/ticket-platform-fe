export function BrandMark() {
  return (
    <svg className="h-[2.1rem] w-[2.1rem]" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M8 6h24v28H8z" fill="currentColor" />
      <path d="M8 14h24M8 26h24" stroke="var(--color-paper)" strokeWidth="3" strokeDasharray="4 3" />
      <path d="M17 13v14l10-7z" fill="var(--color-paper)" />
    </svg>
  )
}

export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 5.1A10.7 10.7 0 0 1 12 5c5.2 0 8.7 4.2 9.7 6.4a1.5 1.5 0 0 1 0 1.2 15.7 15.7 0 0 1-3 4.1M6.6 6.6A15.5 15.5 0 0 0 2.3 11.4a1.5 1.5 0 0 0 0 1.2C3.3 14.8 6.8 19 12 19c.8 0 1.6-.1 2.3-.3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.3 11.4C3.3 9.2 6.8 5 12 5s8.7 4.2 9.7 6.4a1.5 1.5 0 0 1 0 1.2C20.7 14.8 17.2 19 12 19S3.3 14.8 2.3 12.6a1.5 1.5 0 0 0 0-1.2Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function ArrowIcon() {
  return (
    <svg
      className="h-[1.2rem] w-[1.2rem] fill-none stroke-current [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2]"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  )
}

export function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5a4.7 4.7 0 0 1-2 3.1v2.5h3.2c1.9-1.8 3.1-4.4 3.1-7.4Z" />
      <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2 .9-3.5.9-2.7 0-5-1.8-5.8-4.3H2.9v2.6A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.2 13.7A6 6 0 0 1 5.9 12c0-.6.1-1.2.3-1.7V7.7H2.9a10 10 0 0 0 0 8.6l3.3-2.6Z" />
      <path fill="#EA4335" d="M12 6c1.6 0 3 .5 4.1 1.6l3.1-3.1C17 2.8 14.7 2 12 2a10 10 0 0 0-9.1 5.7l3.3 2.6C7 7.8 9.3 6 12 6Z" />
    </svg>
  )
}
