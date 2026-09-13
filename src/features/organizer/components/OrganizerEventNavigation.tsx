import { shouldUseClientNavigation } from '../../../app/routing/client-navigation'
import type { OrganizerPath, OrganizerRoute } from '../../../app/routing/organizer-route'

type OrganizerEventNavigationProps = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
}

const destinations = [
  { key: 'event-overview', label: 'Tổng quan', suffix: '' },
  { key: 'event-edit', label: 'Thông tin', suffix: '/edit' },
  { key: 'event-tickets', label: 'Vé & tồn kho', suffix: '/tickets' },
  { key: 'event-orders', label: 'Đơn hàng', suffix: '/orders' },
  { key: 'event-attendees', label: 'Người tham dự', suffix: '/attendees' },
  { key: 'event-check-in', label: 'Check-in', suffix: '/check-in' },
  { key: 'event-analytics', label: 'Báo cáo', suffix: '/analytics' },
] as const

export function OrganizerEventNavigation({ activeRoute, eventId, onNavigate }: OrganizerEventNavigationProps) {
  return (
    <nav className="overflow-x-auto border-b border-line" aria-label="Quản lý sự kiện">
      <div className="flex min-w-max gap-1">
        {destinations.map((destination) => {
          const href = `/organizer/events/${eventId}${destination.suffix}` as OrganizerPath
          const active = activeRoute === destination.key
          return (
            <a
              key={destination.key}
              className={`min-h-11 border-b-2 px-3 py-3 text-sm font-bold no-underline ${active ? 'border-blue text-blue-deep' : 'border-transparent text-ink-soft hover:text-blue-deep'}`}
              href={href}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => {
                if (!shouldUseClientNavigation(event)) return
                event.preventDefault()
                onNavigate(href)
              }}
            >
              {destination.label}
            </a>
          )
        })}
      </div>
    </nav>
  )
}
