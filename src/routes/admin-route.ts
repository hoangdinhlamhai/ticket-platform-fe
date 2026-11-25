export type AdminRoute =
  | "dashboard"
  | "event-reviews"
  | "event-review-detail"
  | "event-detail"
  | "cases"
  | "case-detail"
  | "users"
  | "user-detail"
  | "orders"
  | "order-detail"
  | "tickets"
  | "resale"
  | "resale-listing-detail"
  | "refunds"
  | "payouts"
  | "payout-detail"
  | "settings"
  | "audit-logs"
  | "categories"
  | "events-all"
  | "payments"
  | "resale-transactions"
  | "resale-transaction-detail"
  | "resale-complaints"
  | "not-found";

export type AdminPath =
  | "/admin"
  | "/admin/events/review"
  | "/admin/cases"
  | "/admin/users"
  | `/admin/users/${string}`
  | "/admin/orders"
  | `/admin/orders/${string}`
  | "/admin/tickets"
  | "/admin/resale"
  | `/admin/resale/listings/${string}`
  | "/admin/refunds"
  | "/admin/payouts"
  | `/admin/payouts/${string}`
  | "/admin/settings"
  | "/admin/audit-logs"
  | "/admin/categories"
  | "/admin/events"
  | "/admin/payments"
  | "/admin/resale/transactions"
  | "/admin/resale/complaints"
  | `/admin/resale/transactions/${string}`
  | `/admin/events/${string}/review`
  | `/admin/events/${string}/details`
  | `/admin/cases/${string}`;

const staticRoutes: Readonly<Record<string, AdminRoute>> = {
  "/admin": "dashboard",
  "/admin/events/review": "event-reviews",
  "/admin/cases": "cases",
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
  "/admin/resale/complaints": "resale-complaints",
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

export function getAdminUserId(pathname: string) {
  return extractId(pathname, /^\/admin\/users\/([^/]+)$/);
}

export function getAdminResaleTransactionId(pathname: string) {
  return extractId(pathname, /^\/admin\/resale\/transactions\/([^/]+)$/);
}

export function getAdminResaleListingId(pathname: string) {
  return extractId(pathname, /^\/admin\/resale\/listings\/([^/]+)$/);
}

export function getAdminOrderId(pathname: string) {
  return extractId(pathname, /^\/admin\/orders\/([^/]+)$/);
}

export function getAdminRoute(pathname: string): AdminRoute {
  const path = normalizePath(pathname);
  if (path === "/admin/organizers") return "users";
  const staticRoute = staticRoutes[path];
  if (staticRoute) return staticRoute;
  if (/^\/admin\/events\/[^/]+\/review$/.test(path) && getAdminEventId(path))
    return "event-review-detail";
  if (/^\/admin\/events\/[^/]+\/details$/.test(path) && getAdminEventId(path))
    return "event-detail";
  if (getAdminCaseId(path)) return "case-detail";
  if (getAdminUserId(path)) return "user-detail";
  if (getAdminPayoutId(path)) return "payout-detail";
  if (getAdminOrderId(path)) return "order-detail";
  if (getAdminResaleTransactionId(path)) return "resale-transaction-detail";
  if (getAdminResaleListingId(path)) return "resale-listing-detail";
  return "not-found";
}
