export { shouldUseClientNavigation } from './client-navigation.ts'

export type AttendeeRoute =
  | 'home' | 'saved-events' | 'profile' | 'tickets' | 'ticket-status' | 'orders' | 'order-detail'
  | 'event-detail' | 'primary-checkout' | 'primary-result'
  | 'resale' | 'resale-listing' | 'resale-checkout' | 'resale-result' | 'resale-sell' | 'my-resale-listings'
  | 'login' | 'register'

export type AttendeePath =
  | '/' | '/login' | '/register' | '/saved-events' | '/profile' | '/tickets' | '/orders' | '/resale' | '/resale/my-listings'
  | `/events/${string}` | `/events/${string}/checkout` | `/events/${string}/checkout/result`
  | `/tickets/${string}` | `/orders/${string}` | `/resale/sell/${string}`
  | `/resale/${string}` | `/resale/${string}/checkout` | `/resale/${string}/result`

type ResalePathMatch = { listingId: string; route: 'resale-listing' | 'resale-checkout' | 'resale-result' }

function normalizePath(pathname: string) { return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname }
function extract(pathname: string, pattern: RegExp) { return normalizePath(pathname).match(pattern)?.[1] ?? null }

function getResalePathMatch(pathname: string): ResalePathMatch | null {
  const match = normalizePath(pathname).match(/^\/resale\/([^/]+)(?:\/(checkout|result))?$/)
  if (!match || match[1] === 'my-listings' || match[1] === 'sell') return null
  const [, listingId, action] = match
  if (action === 'checkout') return { listingId, route: 'resale-checkout' }
  if (action === 'result') return { listingId, route: 'resale-result' }
  return { listingId, route: 'resale-listing' }
}

export function getPrimaryCheckoutEventId(pathname: string) {
  return extract(pathname, /^\/events\/([^/]+)\/checkout(?:\/result)?$/)
}
export function getAttendeeEventId(pathname: string) { return extract(pathname, /^\/events\/([^/]+)$/) }
export function getAttendeeTicketId(pathname: string) { return extract(pathname, /^\/tickets\/([^/]+)$/) }
export function getAttendeeOrderId(pathname: string) { return extract(pathname, /^\/orders\/([^/]+)$/) }
export function getResaleSellTicketId(pathname: string) { return extract(pathname, /^\/resale\/sell\/([^/]+)$/) }
export function getAttendeeResaleListingId(pathname: string) { return getResalePathMatch(pathname)?.listingId ?? null }

export function isResaleRoute(route: AttendeeRoute) {
  return ['resale', 'resale-listing', 'resale-checkout', 'resale-result', 'resale-sell', 'my-resale-listings'].includes(route)
}
export function isOrderRoute(route: AttendeeRoute) { return route === 'orders' || route === 'order-detail' }

export function getAttendeeRoute(pathname: string): AttendeeRoute {
  const path = normalizePath(pathname)
  if (path === '/login') return 'login'
  if (path === '/register') return 'register'
  if (/^\/events\/[^/]+\/checkout\/result$/.test(path)) return 'primary-result'
  if (/^\/events\/[^/]+\/checkout$/.test(path)) return 'primary-checkout'
  if (path === '/orders') return 'orders'
  if (getAttendeeOrderId(path)) return 'order-detail'
  if (path === '/resale/my-listings') return 'my-resale-listings'
  if (getResaleSellTicketId(path)) return 'resale-sell'
  const resaleMatch = getResalePathMatch(path)
  if (resaleMatch) return resaleMatch.route
  if (getAttendeeEventId(path)) return 'event-detail'
  if (getAttendeeTicketId(path)) return 'ticket-status'
  if (path === '/profile') return 'profile'
  if (path === '/saved-events') return 'saved-events'
  if (path === '/tickets') return 'tickets'
  if (path === '/resale') return 'resale'
  return 'home'
}
