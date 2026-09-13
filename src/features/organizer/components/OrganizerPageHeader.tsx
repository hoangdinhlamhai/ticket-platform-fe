import type { ReactNode } from 'react'

type OrganizerPageHeaderProps = {
  actions?: ReactNode
  children?: ReactNode
  eyebrow: string
  title: string
}

export function OrganizerPageHeader({ actions, children, eyebrow, title }: OrganizerPageHeaderProps) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        <p className="m-0 text-xs font-extrabold tracking-[0.11em] text-coral-dark">{eyebrow}</p>
        <h1 className="mt-2 mb-0 font-body text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.88] font-extrabold tracking-[-0.075em] text-ink">{title}</h1>
        {children && <div className="mt-4 max-w-3xl leading-[1.7] text-ink-soft">{children}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </header>
  )
}
