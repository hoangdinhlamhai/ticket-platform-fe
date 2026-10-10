export type AdminRoute =
  | "dashboard"
  | "event-reviews"
  | "event-review-detail"
  | "event-detail"
  | "cases"
  | "case-detail"
  | "organizers"
  | "users"
  | "orders"
  | "tickets"
  | "resale"
  | "refunds"
  | "payouts"
  | "payout-detail"
  | "settings"
  | "audit-logs"
  | "categories"
  | "events-all"
  | "payments"
  | "resale-transactions"
  | "not-found";

export type AdminPath =
  | "/admin"
  | "/admin/events/review"
  | "/admin/cases"
  | "/admin/organizers"
  | "/admin/users"
  | "/admin/orders"
  | "/admin/tickets"
  | "/admin/resale"
  | "/admin/refunds"
  | "/admin/payouts"
  | `/admin/payouts/${string}`
  | "/admin/settings"
  | "/admin/audit-logs"
  | "/admin/categories"
  | "/admin/events"
  | "/admin/payments"
  | "/admin/resale/transactions"
  | `/admin/events/${string}/review`
  | `/admin/events/${string}/details`
  | `/admin/cases/${string}`;

const staticRoutes: Readonly<Record<string, AdminRoute>> = {
  "/admin": "dashboard",
  "/admin/events/review": "event-reviews",
  "/admin/cases": "cases",
  "/admin/organizers": "organizers",
  "/admin/users": "users",
  "/admin/orders": "orders",
  "/admin/tickets": "tickets",
  "/admin/resale": "resale",
  "/admin/refunds": "refunds",
  "/admin/payouts": "payouts",
  "/admin/settings": "settings",
  "/admin/audit-logs": "audit-logs",
  "/admin/categories": "categories",
  "/admin/events": "events-all",
  "/admin/payments": "payments",
  "/admin/resale/transactions": "resale-transactions",
};

function normalizePath(pathname: string) {
  const path = pathname.split(/[?#]/, 1)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function decodeSegment(rawValue: string) {
  try {
    const value = decodeURIComponent(rawValue);
    return value && !/[/#?]/.test(value) ? value : null;
  } catch {
    return null;
  }
}

function extractId(pathname: string, pattern: RegExp) {
  const match = normalizePath(pathname).match(pattern);
  return match ? decodeSegment(match[1]) : null;
}

export function isAdminPath(pathname: string) {
  const path = normalizePath(pathname);
  return path === "/admin" || path.startsWith("/admin/");
}

export function getAdminEventId(pathname: string) {
  return extractId(pathname, /^\/admin\/events\/([^/]+)\/(?:review|details)$/);
}

export function getAdminCaseId(pathname: string) {
  return extractId(pathname, /^\/admin\/cases\/([^/]+)$/);
}

export function getAdminPayoutId(pathname: string) {
  return extractId(pathname, /^\/admin\/payouts\/([^/]+)$/);
}

export function getAdminRoute(pathname: string): AdminRoute {
  const path = normalizePath(pathname);
  const staticRoute = staticRoutes[path];
  if (staticRoute) return staticRoute;
  if (/^\/admin\/events\/[^/]+\/review$/.test(path) && getAdminEventId(path))
    return "event-review-detail";
  if (/^\/admin\/events\/[^/]+\/details$/.test(path) && getAdminEventId(path))
    return "event-detail";
  if (getAdminCaseId(path)) return "case-detail";
  if (getAdminPayoutId(path)) return "payout-detail";
  return "not-found";
}
