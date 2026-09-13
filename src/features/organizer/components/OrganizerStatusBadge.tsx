type OrganizerStatusBadgeProps = {
  label: string
  tone?: 'blue' | 'coral' | 'mint' | 'neutral'
}

const toneClasses = {
  blue: 'border-blue/40 bg-google-hover text-blue-deep',
  coral: 'border-coral/45 bg-error-ring text-coral-dark',
  mint: 'border-success/40 bg-mint text-success',
  neutral: 'border-line bg-paper-deep text-ink-soft',
}

export function OrganizerStatusBadge({ label, tone = 'neutral' }: OrganizerStatusBadgeProps) {
  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold ${toneClasses[tone]}`}>{label}</span>
}
