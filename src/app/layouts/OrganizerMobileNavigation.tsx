import { useEffect, useRef, type RefObject } from 'react'
import type { OrganizerPath, OrganizerRoute } from '../routing/organizer-route'
import { OrganizerSidebar } from './OrganizerSidebar'

type OrganizerMobileNavigationProps = {
  activeRoute: OrganizerRoute
  isOpen: boolean
  onClose: () => void
  onExitToAttendee?: () => void
  onNavigate: (path: OrganizerPath) => void
  returnFocus: RefObject<HTMLButtonElement | null>
}

export function OrganizerMobileNavigation({ activeRoute, isOpen, onClose, onExitToAttendee, onNavigate, returnFocus }: OrganizerMobileNavigationProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const navigatingRef = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) return
      navigatingRef.current = true
      onClose()
      window.requestAnimationFrame(() => document.getElementById('main-content')?.focus())
    }
    desktopQuery.addEventListener('change', closeAtDesktop)
    return () => desktopQuery.removeEventListener('change', closeAtDesktop)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) return
    const trigger = returnFocus.current
    closeButtonRef.current?.focus()
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => {
      window.removeEventListener('keydown', handleKeydown)
      if (!navigatingRef.current) trigger?.focus()
      navigatingRef.current = false
    }
  }, [isOpen, onClose, returnFocus])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button className="absolute inset-0 h-full w-full cursor-default bg-pine/60" type="button" aria-label="Đóng điều hướng Organizer" onClick={onClose} />
      <section id="organizer-mobile-navigation" ref={panelRef} className="absolute top-0 bottom-0 left-0 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto overscroll-contain bg-pine shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="organizer-mobile-navigation-title">
        <header className="flex items-center justify-between gap-3 border-b border-paper/15 px-5 py-4 text-paper">
          <h2 id="organizer-mobile-navigation-title" className="m-0 text-lg font-extrabold">Điều hướng Organizer</h2>
          <button ref={closeButtonRef} className="min-h-11 rounded-md border border-paper/25 px-4 text-sm font-extrabold" type="button" onClick={onClose}>Đóng</button>
        </header>
        <div className="min-h-[calc(100dvh-77px)]"><OrganizerSidebar activeRoute={activeRoute} onExitToAttendee={onExitToAttendee} onNavigation={() => { navigatingRef.current = true; onClose() }} onNavigate={onNavigate} /></div>
      </section>
    </div>
  )
}
