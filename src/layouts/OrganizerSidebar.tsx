import { shouldUseClientNavigation } from '../routes/client-navigation'
import type { OrganizerPath, OrganizerRoute } from '../routes/organizer-route'

type OrganizerSidebarProps = {
  activeRoute: OrganizerRoute
  onExitToAttendee?: () => void
  onNavigate: (path: OrganizerPath) => void
  onNavigation?: () => void
}

type NavigationItem = { currentRoutes: readonly OrganizerRoute[]; highlightRoutes: readonly OrganizerRoute[]; href: OrganizerPath; label: string }

const eventRoutes: readonly OrganizerRoute[] = ['events', 'event-create', 'event-overview', 'event-edit', 'event-tickets', 'event-orders', 'event-attendees', 'event-check-in', 'event-analytics']
const navigationGroups: readonly { label: string; items: readonly NavigationItem[] }[] = [
  { label: 'TỔNG QUAN', items: [{ href: '/organizer', label: 'Tổng quan', currentRoutes: ['dashboard'], highlightRoutes: ['dashboard'] }] },
  { label: 'QUẢN LÝ', items: [{ href: '/organizer/events', label: 'Sự kiện của tôi', currentRoutes: ['events'], highlightRoutes: eventRoutes }, { href: '/organizer/finance', label: 'Tài chính', currentRoutes: ['finance'], highlightRoutes: ['finance'] }] },
  { label: 'TỔ CHỨC', items: [{ href: '/organizer/settings', label: 'Cài đặt tổ chức', currentRoutes: ['settings'], highlightRoutes: ['settings'] }] },
]

export function OrganizerSidebar({ activeRoute, onExitToAttendee, onNavigate, onNavigation }: OrganizerSidebarProps) {
  return (
    <div className="flex h-full flex-col bg-pine px-4 py-5 text-paper">
      <a className="flex min-h-12 items-center justify-center rounded-md bg-coral px-4 text-sm font-extrabold text-paper no-underline hover:bg-coral-dark" href="/organizer/events/new" onClick={(event) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigation?.(); onNavigate('/organizer/events/new') }}>+ Tạo sự kiện</a>
      <nav className="mt-6 space-y-6" aria-label="Điều hướng Organizer">
        {navigationGroups.map((group) => <div key={group.label}><p className="mb-2 px-3 text-[0.65rem] font-extrabold tracking-[0.12em] text-mint/75">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const highlighted = item.highlightRoutes.includes(activeRoute); const current = item.currentRoutes.includes(activeRoute); return <a key={item.href} className={`flex min-h-11 items-center rounded-md border-l-4 px-3 text-sm font-bold no-underline ${highlighted ? 'border-mint bg-paper/10 text-paper' : 'border-transparent text-story-copy hover:bg-paper/5 hover:text-paper'}`} href={item.href} aria-current={current ? 'page' : undefined} onClick={(event) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigation?.(); onNavigate(item.href) }}>{item.label}</a> })}</div></div>)}
      </nav>
      <a className="mt-auto flex min-h-11 items-center justify-center rounded-md border border-paper/25 px-3 text-sm font-bold text-story-copy no-underline hover:bg-paper/10 hover:text-paper" href="/" onClick={(event) => { if (!onExitToAttendee || !shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigation?.(); onExitToAttendee() }}>Xem trang người tham dự</a>
    </div>
  )
}
