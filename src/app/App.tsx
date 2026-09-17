import { useCallback, useEffect, useRef, useState } from 'react'
import { AuthPage, useAttendeeAuth } from '../features/auth'
import { PrimaryCheckoutPage, PrimaryOrderResultPage, type PrimaryCheckoutSubmission } from '../features/checkout'
import { EventDetailPage, EventDiscoveryPage, SavedEventsPage } from '../features/events'
import { AdminApplication } from './AdminApplication.tsx'
import { OrganizerApplication } from './OrganizerApplication.tsx'
import { useAdminWorkspace } from '../features/admin/hooks/use-admin-workspace.ts'
import { useOrganizerWorkspace } from '../features/organizer/hooks/use-organizer-workspace.ts'
import { createAttendeeOrder, MOCK_ATTENDEE_ORDERS, OrderDetailPage, OrderHistoryPage, type AttendeeOrder, type PrimaryCheckoutSelection } from '../features/orders'
import { CustomerProfilePage, MOCK_CUSTOMER_PROFILE, type CustomerProfile } from '../features/profile'
import { CreateResaleListingPage, MOCK_RESALE_LISTINGS, MyResaleListingsPage, ResaleCheckoutPage, ResaleListingPage, ResaleMarketplacePage, ResaleResultPage, updateResaleListingStatus, type ResaleCheckoutCompletion, type ResaleListing } from '../features/resale'
import { issuePrimaryTickets, issueResaleTicket, MOCK_OWNED_TICKETS, OwnedTicketsPage, TicketStatusPage, updateOwnedTicketResaleStatus, type OwnedTicket } from '../features/tickets'
import { AttendeeLayout } from './layouts/AttendeeLayout'
import { getAttendeeEventId, getAttendeeOrderId, getAttendeeResaleListingId, getAttendeeRoute, getAttendeeTicketId, getPrimaryCheckoutEventId, getResaleSellTicketId, type AttendeePath, type AttendeeRoute } from './routing/attendee-route'
import { isAdminPath, type AdminPath } from './routing/admin-route'
import { isOrganizerPath, type OrganizerPath } from './routing/organizer-route'

type State = { profile: CustomerProfile; tickets: readonly OwnedTicket[]; orders: readonly AttendeeOrder[]; listings: readonly ResaleListing[]; selection: PrimaryCheckoutSelection | null; primaryOrder: AttendeeOrder | null; completedListingIds: ReadonlySet<string> }
type Actions = { navigate: (path: AttendeePath) => void; notice: (value: string) => void; saveProfile: (value: CustomerProfile) => void; startCheckout: (value: PrimaryCheckoutSelection) => void; completePrimary: (value: PrimaryCheckoutSubmission) => void; completeResale: (value: ResaleCheckoutCompletion) => void; sellTicket: (ticket: OwnedTicket) => void; publishListing: (listing: ResaleListing) => void; withdrawListing: (id: string) => void }
type OrganizerNavigationGuard = (destination: string) => boolean

const historyIndexKey = '__ticketlyNavigationIndex'

function createSessionId(prefix: 'ORD' | 'RS') { return `${prefix}-${crypto.randomUUID().slice(0, 8).toUpperCase()}` }

function getHistoryIndex(state: unknown) {
  if (typeof state !== 'object' || state === null) return null
  const value = (state as Record<string, unknown>)[historyIndexKey]
  return typeof value === 'number' && Number.isInteger(value) ? value : null
}

function withHistoryIndex(index: number) {
  const currentState = window.history.state
  return {
    ...(typeof currentState === 'object' && currentState !== null ? currentState : {}),
    [historyIndexKey]: index,
  }
}

function AttendeePage({ route, pathname, state, actions }: { route: AttendeeRoute; pathname: string; state: State; actions: Actions }) {
  const eventId = getAttendeeEventId(pathname) ?? ''
  if (route === 'saved-events') return <SavedEventsPage onNavigate={actions.navigate} onNoticeChange={actions.notice} />
  if (route === 'event-detail') return <EventDetailPage key={pathname} eventId={eventId} onNavigate={actions.navigate} onStartCheckout={actions.startCheckout} />
  if (route === 'primary-checkout') return <PrimaryCheckoutPage key={pathname} selection={state.selection} profile={state.profile} onComplete={actions.completePrimary} onNavigate={actions.navigate} />
  if (route === 'primary-result') return <PrimaryOrderResultPage eventId={getPrimaryCheckoutEventId(pathname) ?? ''} order={state.primaryOrder} onNavigate={actions.navigate} />
  if (route === 'orders') return <OrderHistoryPage orders={state.orders} onNavigate={actions.navigate} />
  if (route === 'order-detail') return <OrderDetailPage orderId={getAttendeeOrderId(pathname) ?? ''} orders={state.orders} onNavigate={actions.navigate} />
  if (route === 'ticket-status') return <TicketStatusPage ticketId={getAttendeeTicketId(pathname) ?? ''} tickets={state.tickets} onNavigate={actions.navigate} />
  if (route === 'tickets') return <OwnedTicketsPage tickets={state.tickets} onNavigate={actions.navigate} onSellTicket={actions.sellTicket} />
  if (route === 'profile') return <CustomerProfilePage profile={state.profile} tickets={state.tickets} onNavigate={actions.navigate} onNoticeChange={actions.notice} onSaveProfile={actions.saveProfile} />
  if (route === 'resale-sell') return <CreateResaleListingPage ticketId={getResaleSellTicketId(pathname) ?? ''} tickets={state.tickets} profile={state.profile} onPublish={actions.publishListing} onNavigate={actions.navigate} />
  if (route === 'my-resale-listings') return <MyResaleListingsPage listings={state.listings} onNavigate={actions.navigate} onWithdraw={actions.withdrawListing} />
  const listingId = getAttendeeResaleListingId(pathname) ?? ''
  if (route === 'resale-checkout') return <ResaleCheckoutPage completedListingIds={state.completedListingIds} listingId={listingId} listings={state.listings} onComplete={actions.completeResale} onNavigate={actions.navigate} profile={state.profile} />
  if (route === 'resale-result') return <ResaleResultPage listingId={listingId} listings={state.listings} onNavigate={actions.navigate} order={state.orders.find((order) => order.source === 'resale' && order.resaleListingId === listingId) ?? null} />
  if (route === 'resale-listing') return <ResaleListingPage completedListingIds={state.completedListingIds} listingId={listingId} listings={state.listings} onNavigate={actions.navigate} />
  if (route === 'resale') return <ResaleMarketplacePage completedListingIds={state.completedListingIds} listings={state.listings} onNavigate={actions.navigate} />
  return <EventDiscoveryPage onNavigate={actions.navigate} onNoticeChange={actions.notice} />
}

function App() {
  return <AttendeeApplication />
}

function AttendeeApplication() {
  const adminWorkspace = useAdminWorkspace()
  const organizerWorkspace = useOrganizerWorkspace()
  const { clearLastOperation: clearAdminLastOperation } = adminWorkspace
  const { clearLastOperation: clearOrganizerLastOperation } = organizerWorkspace
  const [pathname, setPathname] = useState(() => window.location.pathname)
  const attendeeAuth = useAttendeeAuth(!isAdminPath(pathname) && !isOrganizerPath(pathname))
  const [route, setRoute] = useState(() => getAttendeeRoute(window.location.pathname))
  const [notice, setNotice] = useState('')
  const [profile, setProfile] = useState<CustomerProfile>({ ...MOCK_CUSTOMER_PROFILE })
  const [orders, setOrders] = useState<AttendeeOrder[]>(() => [...MOCK_ATTENDEE_ORDERS])
  const [tickets, setTickets] = useState<OwnedTicket[]>(() => [...MOCK_OWNED_TICKETS])
  const [listings, setListings] = useState<ResaleListing[]>(() => [...MOCK_RESALE_LISTINGS])
  const [selection, setSelection] = useState<PrimaryCheckoutSelection | null>(null)
  const [primaryOrderId, setPrimaryOrderId] = useState<string | null>(null)
  const [completedListingIds, setCompletedListingIds] = useState<Set<string>>(() => new Set())
  const completingListingIds = useRef(new Set<string>())
  const acceptedPathRef = useRef(pathname)
  const historyIndexRef = useRef(0)
  const restoringHistoryIndexRef = useRef<number | null>(null)
  const organizerNavigationGuardRef = useRef<OrganizerNavigationGuard | null>(null)

  const acceptNavigation = useCallback((nextPath: string) => {
    acceptedPathRef.current = nextPath
    setPathname(nextPath)
    setRoute(getAttendeeRoute(nextPath))
    setNotice('')
    clearAdminLastOperation()
    clearOrganizerLastOperation()
    window.scrollTo(0, 0)
    window.requestAnimationFrame(() => document.getElementById('main-content')?.focus())
  }, [clearAdminLastOperation, clearOrganizerLastOperation])

  const navigateToPath = useCallback((nextPath: string) => {
    if (acceptedPathRef.current === nextPath) return
    const nextIndex = historyIndexRef.current + 1
    window.history.pushState(withHistoryIndex(nextIndex), '', nextPath)
    historyIndexRef.current = nextIndex
    acceptNavigation(nextPath)
  }, [acceptNavigation])

  const navigate = useCallback((path: AttendeePath) => navigateToPath(path), [navigateToPath])
  const navigateAdmin = useCallback((path: AdminPath) => navigateToPath(path), [navigateToPath])
  const navigateOrganizer = useCallback((path: OrganizerPath) => navigateToPath(path), [navigateToPath])
  const registerOrganizerNavigationGuard = useCallback((guard: OrganizerNavigationGuard | null) => {
    organizerNavigationGuardRef.current = guard
  }, [])

  useEffect(() => {
    const initialIndex = getHistoryIndex(window.history.state)
    if (initialIndex === null) {
      window.history.replaceState(withHistoryIndex(0), '', window.location.href)
      historyIndexRef.current = 0
    } else {
      historyIndexRef.current = initialIndex
    }

    const pop = (event: PopStateEvent) => {
      const nextPath = window.location.pathname
      const currentPath = acceptedPathRef.current
      const nextIndex = getHistoryIndex(event.state)
      if (restoringHistoryIndexRef.current !== null && restoringHistoryIndexRef.current === nextIndex) {
        historyIndexRef.current = nextIndex
        restoringHistoryIndexRef.current = null
        return
      }
      if (nextPath === currentPath) {
        if (nextIndex !== null) historyIndexRef.current = nextIndex
        return
      }

      const shouldAllow = !isOrganizerPath(currentPath)
        || !organizerNavigationGuardRef.current
        || organizerNavigationGuardRef.current(nextPath)
      if (!shouldAllow) {
        if (nextIndex !== null && nextIndex !== historyIndexRef.current) {
          restoringHistoryIndexRef.current = historyIndexRef.current
          window.history.go(historyIndexRef.current - nextIndex)
        } else {
          window.history.replaceState(withHistoryIndex(historyIndexRef.current), '', currentPath)
        }
        return
      }

      if (nextIndex === null) {
        historyIndexRef.current = 0
        window.history.replaceState(withHistoryIndex(0), '', window.location.href)
      } else {
        historyIndexRef.current = nextIndex
      }
      acceptNavigation(nextPath)
    }

    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [acceptNavigation])

  const startCheckout = useCallback((value: PrimaryCheckoutSelection) => { setSelection(value); navigate(`/events/${value.eventId}/checkout`) }, [navigate])
  const completePrimary = useCallback((submission: PrimaryCheckoutSubmission) => { const id = createSessionId('ORD'); const issued = submission.outcome === 'completed' ? issuePrimaryTickets({ orderId: id, selection: submission.selection, buyerName: submission.buyer.fullName }) : []; const order = createAttendeeOrder({ id, source: 'primary', status: submission.outcome, eventId: submission.selection.eventId, eventTitle: submission.selection.eventTitle, buyer: submission.buyer, items: [{ label: submission.selection.ticketTierName, quantity: submission.selection.quantity, unitPrice: submission.selection.unitPrice }], issuedTicketIds: issued.map((ticket) => ticket.id) }); setOrders((current) => [order, ...current]); if (issued.length) setTickets((current) => [...issued, ...current]); setPrimaryOrderId(id); navigate(`/events/${submission.selection.eventId}/checkout/result`) }, [navigate])
  const completeResale = useCallback((completion: ResaleCheckoutCompletion) => {
    if (completedListingIds.has(completion.listingId) || completingListingIds.current.has(completion.listingId)) { navigate(`/resale/${completion.listingId}`); return }
    const source = listings.find((listing) => listing.id === completion.listingId)
    if (!source || source.availability !== 'available' || (source.listingStatus && source.listingStatus !== 'active')) { navigate('/resale'); return }
    completingListingIds.current.add(completion.listingId)
    const id = createSessionId('RS')
    const issued = issueResaleTicket({ orderId: id, listing: source, buyerName: completion.buyer.fullName })
    const order = createAttendeeOrder({ id, source: 'resale', status: 'completed', eventId: source.eventId ?? source.id, eventTitle: source.eventTitle, buyer: completion.buyer, items: [{ label: `${source.ticketType} · ${source.quantity} vé`, quantity: 1, unitPrice: completion.amount }], issuedTicketIds: [issued.id], resaleListingId: completion.listingId })
    setOrders((current) => [order, ...current])
    setListings((current) => updateResaleListingStatus(current, completion.listingId, 'sold'))
    setTickets((current) => {
      const updated = source.sourceTicketId ? updateOwnedTicketResaleStatus(current, source.sourceTicketId, 'sold', 'revoked') : [...current]
      return [issued, ...updated]
    })
    setCompletedListingIds((current) => new Set(current).add(completion.listingId))
    navigate(`/resale/${completion.listingId}/result`)
  }, [completedListingIds, listings, navigate])
  const publishListing = useCallback((listing: ResaleListing) => { setListings((current) => [listing, ...current]); if (listing.sourceTicketId) setTickets((current) => updateOwnedTicketResaleStatus(current, listing.sourceTicketId!, 'listed')); navigate(`/resale/${listing.id}`) }, [navigate])
  const withdrawListing = useCallback((id: string) => { const listing = listings.find((item) => item.id === id); setListings((current) => updateResaleListingStatus(current, id, 'withdrawn')); if (listing?.sourceTicketId) setTickets((current) => updateOwnedTicketResaleStatus(current, listing.sourceTicketId!, 'eligible')); }, [listings])

  if (isAdminPath(pathname)) {
    return <AdminApplication pathname={pathname} workspace={adminWorkspace} onPathnameChange={navigateAdmin} onExitToAttendee={() => navigate('/')} />
  }

  if (isOrganizerPath(pathname)) {
    return <OrganizerApplication pathname={pathname} workspace={organizerWorkspace} onPathnameChange={navigateOrganizer} onExitToAttendee={() => navigate('/')} registerNavigationGuard={registerOrganizerNavigationGuard} />
  }

  const state: State = { profile, tickets, orders, listings, selection, primaryOrder: orders.find((order) => order.id === primaryOrderId) ?? null, completedListingIds }
  const actions: Actions = { navigate, notice: setNotice, saveProfile: setProfile, startCheckout, completePrimary, completeResale, sellTicket: (ticket) => navigate(`/resale/sell/${ticket.id}`), publishListing, withdrawListing }
  if (route === 'login' || route === 'register') {
    return <AuthPage
      key={route}
      mode={route}
      onAuthenticated={() => navigate('/')}
      onLogin={attendeeAuth.login}
      onNavigateMode={(mode) => navigate(`/${mode}`)}
      onRegister={attendeeAuth.register}
    />
  }
  return <AttendeeLayout activeRoute={route} notice={notice} onNavigate={navigate} authStatus={attendeeAuth.status} authenticatedUser={attendeeAuth.user} authError={attendeeAuth.error?.message ?? ''} canRetryAuth={attendeeAuth.canRetry} onLogout={async () => { await attendeeAuth.logout(); navigate('/') }} onRetryAuth={attendeeAuth.refresh} profileName={profile.fullName}><AttendeePage route={route} pathname={pathname} state={state} actions={actions} /></AttendeeLayout>
}

export default App
