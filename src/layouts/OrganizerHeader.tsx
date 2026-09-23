import type { RefObject } from 'react'
import { TicketlyMark } from '../components/icons/TicketlyIcons'
import { shouldUseClientNavigation } from '../routes/client-navigation'
import type { OrganizerPath } from '../routes/organizer-route'

type OrganizerHeaderProps = {
  isNavigationOpen: boolean
  menuButtonRef: RefObject<HTMLButtonElement | null>
  onMenuClick: () => void
  onNavigate: (path: OrganizerPath) => void
  organizationName: string
}

export function OrganizerHeader({ isNavigationOpen, menuButtonRef, onMenuClick, onNavigate, organizationName }: OrganizerHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper">
      <div className="flex min-h-16 items-center justify-between gap-4 px-5 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button ref={menuButtonRef} className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line bg-surface font-extrabold lg:hidden" type="button" aria-controls="organizer-mobile-navigation" aria-expanded={isNavigationOpen} aria-label="Mở điều hướng Organizer" onClick={onMenuClick}>☰</button>
          <a className="flex min-h-11 items-center gap-2 text-pine no-underline" href="/organizer" onClick={(event) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigate('/organizer') }}>
            <TicketlyMark className="h-8 w-8" />
            <span className="font-body text-xl font-extrabold tracking-[-0.06em]">Ticketly</span>
            <span className="rounded-sm bg-pine px-2 py-1 text-[0.65rem] font-extrabold tracking-[0.08em] text-paper">ORGANIZER</span>
          </a>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <span className="max-w-48 truncate text-sm font-bold text-ink">{organizationName}</span>
        </div>
      </div>
    </header>
  )
}
