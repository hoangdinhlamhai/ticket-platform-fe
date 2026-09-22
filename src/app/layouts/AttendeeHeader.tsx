import { TicketIcon, TicketlyMark } from '../../components/icons/TicketlyIcons'
import { getProfileInitials } from '../../features/profile'
import { shouldUseClientNavigation, isOrderRoute, isResaleRoute, type AttendeePath, type AttendeeRoute } from '../routing/attendee-route'

type AttendeeHeaderProps = {
  activeRoute: AttendeeRoute
  onNavigate: (path: AttendeePath) => void
  onNavigateToOrganizer: () => void
  profileName: string
}

type NavigationLinkProps = {
  active: boolean
  children: string
  href: AttendeePath
  onNavigate: (path: AttendeePath) => void
}

function NavigationLink({ active, children, href, onNavigate }: NavigationLinkProps) {
  return (
    <a
      className={`min-h-11 px-3 py-3 ${active ? 'text-blue-deep underline underline-offset-4' : 'text-ink hover:text-blue-deep'}`}
      href={href}
      aria-current={active ? 'page' : undefined}
      onClick={(event) => {
        if (!shouldUseClientNavigation(event)) return
        event.preventDefault()
        onNavigate(href)
      }}
    >
      {children}
    </a>
  )
}

export function AttendeeHeader({ activeRoute, onNavigate, onNavigateToOrganizer, profileName }: AttendeeHeaderProps) {
  return (
    <header className="border-b border-line bg-paper">
      <div className="attendee-container flex min-h-[5.25rem] flex-wrap items-center justify-between gap-x-6 gap-y-3 py-3">
        <a
          className="flex min-h-11 items-center gap-2 text-pine no-underline"
          href="/"
          onClick={(event) => {
            if (!shouldUseClientNavigation(event)) return
            event.preventDefault()
            onNavigate('/')
          }}
        >
          <TicketlyMark className="h-9 w-9" />
          <span className="font-body text-[1.65rem] font-extrabold tracking-[-0.09em]">Ticketly</span>
        </a>

        <nav className="order-3 flex w-full items-center gap-1 border-t border-line pt-2 text-[0.82rem] font-bold mobile:order-3" aria-label="Điều hướng chính">
          <NavigationLink active={activeRoute === 'home'} href="/" onNavigate={onNavigate}>Khám phá</NavigationLink>
          <NavigationLink active={activeRoute === 'saved-events'} href="/saved-events" onNavigate={onNavigate}>Sự kiện đã lưu</NavigationLink>
          <NavigationLink active={activeRoute === 'tickets' || activeRoute === 'ticket-status'} href="/tickets" onNavigate={onNavigate}>Vé của tôi</NavigationLink>
          <NavigationLink active={isOrderRoute(activeRoute)} href="/orders" onNavigate={onNavigate}>Đơn hàng</NavigationLink>
          <NavigationLink active={isResaleRoute(activeRoute)} href="/resale" onNavigate={onNavigate}>Chợ resale</NavigationLink>
        </nav>

        <div className="order-2 flex items-center gap-2">
          <a
            className={`flex min-h-11 items-center gap-2 rounded-md border px-1 text-left no-underline ${activeRoute === 'profile' ? 'border-blue/40 bg-google-hover text-blue-deep' : 'border-transparent text-ink hover:border-line/70'}`}
            href="/profile"
            aria-current={activeRoute === 'profile' ? 'page' : undefined}
            onClick={(event) => {
              if (!shouldUseClientNavigation(event)) return
              event.preventDefault()
              onNavigate('/profile')
            }}
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-pine text-[0.72rem] font-extrabold tracking-[0.06em] text-paper" aria-hidden="true">{getProfileInitials(profileName)}</span>
            <span className="hidden text-[0.82rem] font-bold sm:block">{profileName}</span>
            <span className="sr-only">Mở hồ sơ khách hàng</span>
          </a>
          <a
            className="flex min-h-11 items-center rounded-md border border-blue/40 px-3 text-[0.8rem] font-extrabold text-blue-deep no-underline hover:bg-google-hover"
            href="/organizer/events/new"
            onClick={(event) => {
              if (!shouldUseClientNavigation(event)) return
              event.preventDefault()
              onNavigateToOrganizer()
            }}
          >
            Tạo sự kiện
          </a>
          <a
            className="flex min-h-11 items-center gap-2 rounded-md border border-coral-dark/50 bg-coral px-3 text-[0.8rem] font-extrabold text-paper no-underline hover:bg-coral-dark"
            href="/tickets"
            onClick={(event) => {
              if (!shouldUseClientNavigation(event)) return
              event.preventDefault()
              onNavigate('/tickets')
            }}
          >
            <TicketIcon className="h-[1.1rem] w-[1.1rem]" />
            <span>Vé của tôi</span>
          </a>
        </div>
      </div>
    </header>
  )
}
