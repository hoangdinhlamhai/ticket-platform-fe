import type { ReactNode } from 'react'

type OrganizerEmptyStateProps = {
  action?: ReactNode
  description: string
  title: string
}

export function OrganizerEmptyState({ action, description, title }: OrganizerEmptyStateProps) {
  return (
    <section className="rounded-lg border border-dashed border-line bg-surface p-8 text-center">
      <h2 className="m-0 text-2xl font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl leading-[1.7] text-ink-soft">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  )
}
