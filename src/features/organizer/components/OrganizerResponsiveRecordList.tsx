import type { ReactNode } from 'react'

type Props = { children: ReactNode; label: string }
export function OrganizerResponsiveRecordList({ children, label }: Props) {
  return <div className="grid gap-4 md:hidden" aria-label={label}>{children}</div>
}
