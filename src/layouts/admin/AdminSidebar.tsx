import type { AdminPath, AdminRoute } from "../../routes/admin-route.ts";

const navigation: readonly {
  readonly group: string;
  readonly items: readonly {
    readonly label: string;
    readonly path: AdminPath;
    readonly routes: readonly AdminRoute[];
  }[];
}[] = [
  {
    group: "TỔNG QUAN",
    items: [{ label: "Dashboard", path: "/admin", routes: ["dashboard"] }],
  },
  {
    group: "QUẢN TRỊ",
    items: [
      { label: "Người dùng", path: "/admin/users", routes: ["users"] },
      { label: "Danh mục", path: "/admin/categories", routes: ["categories"] },
      { label: "Organizer", path: "/admin/organizers", routes: ["organizers"] },
    ],
  },
  {
    group: "SỰ KIỆN",
    items: [
      {
        label: "Tất cả sự kiện",
        path: "/admin/events",
        routes: ["events-all"],
      },
      {
        label: "Đang chờ duyệt",
        path: "/admin/events/review",
        routes: ["event-reviews", "event-review-detail"],
      },
    ],
  },
  {
    group: "GIAO DỊCH",
    items: [
      { label: "Orders", path: "/admin/orders", routes: ["orders"] },
      { label: "Payments", path: "/admin/payments", routes: ["payments"] },
      { label: "Refunds", path: "/admin/refunds", routes: ["refunds"] },
      {
        label: "Payouts",
        path: "/admin/payouts",
        routes: ["payouts", "payout-detail"],
      },
    ],
  },
  {
    group: "TICKET RESALE",
    items: [
      { label: "Listings", path: "/admin/resale", routes: ["resale"] },
      {
        label: "Transactions",
        path: "/admin/resale/transactions",
        routes: ["resale-transactions"],
      },
    ],
  },
];

export function AdminSidebar({
  activeRoute,
  onNavigate,
}: {
  readonly activeRoute: AdminRoute;
  readonly onNavigate: (path: AdminPath) => void;
}) {
  return (
    <nav aria-label="Điều hướng Admin" className="sticky top-20 grid gap-6 p-5">
      {navigation.map((group) => (
        <section key={group.group}>
          <h2 className="m-0 text-xs font-extrabold tracking-[.12em] text-ink-soft">
            {group.group}
          </h2>
          <ul className="m-0 mt-2 grid list-none gap-1 p-0">
            {group.items.map((item) => (
              <li key={item.path}>
                <button
                  aria-current={
                    item.routes.includes(activeRoute) ? "page" : undefined
                  }
                  className={`min-h-11 w-full rounded px-3 text-left text-sm font-bold ${item.routes.includes(activeRoute) ? "bg-pine text-paper" : "hover:bg-paper-deep"}`}
                  type="button"
                  onClick={() => onNavigate(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </nav>
  );
}
