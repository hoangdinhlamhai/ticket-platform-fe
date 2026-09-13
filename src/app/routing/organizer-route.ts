export type OrganizerRoute =
  | 'dashboard'
  | 'events'
  | 'event-create'
  | 'event-overview'
  | 'event-edit'
  | 'event-tickets'
  | 'event-orders'
  | 'event-attendees'
  | 'event-check-in'
  | 'event-analytics'
  | 'finance'
  | 'settings'
  | 'not-found'

export type OrganizerPath =
  | '/organizer'
  | '/organizer/events'
  | '/organizer/events/new'
  | '/organizer/finance'
  | '/organizer/settings'
  | `/organizer/events/${string}`
  | `/organizer/events/${string}/edit`
  | `/organizer/events/${string}/tickets`
  | `/organizer/events/${string}/orders`
  | `/organizer/events/${string}/attendees`
  | `/organizer/events/${string}/check-in`
  | `/organizer/events/${string}/analytics`

type EventRouteMatch = {
  eventId: string
  route: Extract<OrganizerRoute, `event-${string}`>
}

const eventActionRoutes = {
  edit: 'event-edit',
  tickets: 'event-tickets',
  orders: 'event-orders',
  attendees: 'event-attendees',
  'check-in': 'event-check-in',
  analytics: 'event-analytics',
} as const

function normalizePath(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0] || '/'
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function decodeSegment(value: string) {
  try {
    const decoded = decodeURIComponent(value)
    return /[/#?]/.test(decoded) ? null : decoded
  } catch {
    return null
  }
}

function getEventRouteMatch(pathname: string): EventRouteMatch | null {
  const match = normalizePath(pathname).match(/^\/organizer\/events\/([^/]+)(?:\/(edit|tickets|orders|attendees|check-in|analytics))?$/)
  if (!match) return null

  const [, rawEventId, action] = match
  const eventId = decodeSegment(rawEventId)
  if (!eventId || eventId === 'new') return null

  return {
    eventId,
    route: action ? eventActionRoutes[action as keyof typeof eventActionRoutes] : 'event-overview',
  }
}

export function isOrganizerPath(pathname: string) {
  const path = normalizePath(pathname)
  return path === '/organizer' || path.startsWith('/organizer/')
}

export function getOrganizerEventId(pathname: string) {
  return getEventRouteMatch(pathname)?.eventId ?? null
}

export function isOrganizerEventRoute(route: OrganizerRoute) {
  return route === 'event-overview'
    || route === 'event-edit'
    || route === 'event-tickets'
    || route === 'event-orders'
    || route === 'event-attendees'
    || route === 'event-check-in'
    || route === 'event-analytics'
}

export function getOrganizerRoute(pathname: string): OrganizerRoute {
  const path = normalizePath(pathname)
  if (path === '/organizer') return 'dashboard'
  if (path === '/organizer/events') return 'events'
  if (path === '/organizer/events/new') return 'event-create'
  if (path === '/organizer/finance') return 'finance'
  if (path === '/organizer/settings') return 'settings'
  return getEventRouteMatch(path)?.route ?? 'not-found'
}
