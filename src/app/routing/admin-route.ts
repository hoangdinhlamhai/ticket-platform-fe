export type AdminRoute =
  | 'dashboard'
  | 'event-reviews'
  | 'event-review-detail'
  | 'cases'
  | 'case-detail'
  | 'organizers'
  | 'users'
  | 'orders'
  | 'tickets'
  | 'resale'
  | 'refunds'
  | 'payouts'
  | 'settings'
  | 'audit-logs'
  | 'not-found'

export type AdminPath =
  | '/admin'
  | '/admin/events/review'
  | '/admin/cases'
  | '/admin/organizers'
  | '/admin/users'
  | '/admin/orders'
  | '/admin/tickets'
  | '/admin/resale'
  | '/admin/refunds'
  | '/admin/payouts'
  | '/admin/settings'
  | '/admin/audit-logs'
  | `/admin/events/${string}/review`
  | `/admin/cases/${string}`

const staticRoutes: Readonly<Record<string, AdminRoute>> = {
  '/admin': 'dashboard',
  '/admin/events/review': 'event-reviews',
  '/admin/cases': 'cases',
  '/admin/organizers': 'organizers',
  '/admin/users': 'users',
  '/admin/orders': 'orders',
  '/admin/tickets': 'tickets',
  '/admin/resale': 'resale',
  '/admin/refunds': 'refunds',
  '/admin/payouts': 'payouts',
  '/admin/settings': 'settings',
  '/admin/audit-logs': 'audit-logs',
}

function normalizePath(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0] || '/'
  return path.length > 1 ? path.replace(/\/+$/, '') : path
}

function decodeSegment(rawValue: string) {
  try {
    const value = decodeURIComponent(rawValue)
    return value && !/[/#?]/.test(value) ? value : null
  } catch {
    return null
  }
}

function extractId(pathname: string, pattern: RegExp) {
  const match = normalizePath(pathname).match(pattern)
  return match ? decodeSegment(match[1]) : null
}

export function isAdminPath(pathname: string) {
  const path = normalizePath(pathname)
  return path === '/admin' || path.startsWith('/admin/')
}

export function getAdminEventId(pathname: string) {
  return extractId(pathname, /^\/admin\/events\/([^/]+)\/review$/)
}

export function getAdminCaseId(pathname: string) {
  return extractId(pathname, /^\/admin\/cases\/([^/]+)$/)
}

export function getAdminRoute(pathname: string): AdminRoute {
  const path = normalizePath(pathname)
  const staticRoute = staticRoutes[path]
  if (staticRoute) return staticRoute
  if (getAdminEventId(path)) return 'event-review-detail'
  if (getAdminCaseId(path)) return 'case-detail'
  return 'not-found'
}
