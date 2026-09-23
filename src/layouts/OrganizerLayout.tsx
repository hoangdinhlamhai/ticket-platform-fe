import { useRef, useState, type ReactNode } from 'react'
import type { OrganizerPath, OrganizerRoute } from '../routes/organizer-route'
import { OrganizerHeader } from './OrganizerHeader'
import { OrganizerMobileNavigation } from './OrganizerMobileNavigation'
import { OrganizerSidebar } from './OrganizerSidebar'

type OrganizerLayoutProps = {
  activeRoute: OrganizerRoute
  children: ReactNode
  notice: string
  onAcknowledgeNotice: () => void
  onExitToAttendee: () => void
  onNavigate: (path: OrganizerPath) => void
  organizationName: string
}

export function OrganizerLayout({ activeRoute, children, notice, onAcknowledgeNotice, onExitToAttendee, onNavigate, organizationName }: OrganizerLayoutProps) {
  const [isNavigationOpen, setNavigationOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="min-h-dvh overflow-x-clip bg-paper-deep text-ink">
      <a className="fixed top-3 left-3 z-[60] -translate-y-[150%] bg-pine px-4 py-[0.7rem] text-paper no-underline focus:translate-y-0" href="#main-content">Bỏ qua đến nội dung chính</a>
      <OrganizerHeader isNavigationOpen={isNavigationOpen} menuButtonRef={menuButtonRef} onMenuClick={() => setNavigationOpen(true)} onNavigate={onNavigate} organizationName={organizationName} />
      <div className="lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
        <aside className="hidden self-start lg:sticky lg:top-16 lg:block lg:h-[calc(100dvh-4rem)] lg:overflow-y-auto"><OrganizerSidebar activeRoute={activeRoute} onExitToAttendee={onExitToAttendee} onNavigate={onNavigate} /></aside>
        <main id="main-content" className="min-w-0 px-5 py-7 sm:px-6 lg:px-10 lg:py-9" tabIndex={-1}>
          <div className="mx-auto w-full max-w-[92rem]">
            {notice && <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-mint/60 bg-mint/15 px-4 py-3 text-sm font-bold text-ink" role="status" aria-live="polite" aria-atomic="true"><span>{notice}</span><button className="min-h-10 rounded-md border border-pine px-3 text-sm font-extrabold text-pine" type="button" onClick={onAcknowledgeNotice}>Đã hiểu</button></section>}
            {children}
          </div>
        </main>
      </div>
      <OrganizerMobileNavigation activeRoute={activeRoute} isOpen={isNavigationOpen} onClose={() => setNavigationOpen(false)} onExitToAttendee={onExitToAttendee} onNavigate={onNavigate} returnFocus={menuButtonRef} />
    </div>
  )
}
