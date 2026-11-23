import type { AdminPath } from "../../../../routes/admin-route.ts";
import { AdminOrdersPage } from "../../order/pages/AdminOrdersPage.tsx";
import { AdminPaymentsPage } from "../../payment/pages/AdminPaymentsPage.tsx";
import { RefundAdminPage } from "../../refund/pages/RefundAdminPage.tsx";

type Tab = "orders" | "payments" | "refunds";
const tabs: { id: Tab; label: string; path: AdminPath }[] = [
  { id: "orders", label: "Orders", path: "/admin/orders" },
  { id: "payments", label: "Payments", path: "/admin/payments" },
  { id: "refunds", label: "Refunds", path: "/admin/refunds" },
];

export function AdminTransactionsPage({
  route,
  navigate,
}: {
  route: Tab;
  navigate: (path: AdminPath) => void;
}) {
  const tab = route;

  return (
    <main className="grid min-w-0 gap-5">
      <header className="rounded-2xl border border-line bg-gradient-to-br from-surface to-paper-deep p-5 shadow-sm sm:p-7">
        <p className="m-0 text-xs font-extrabold uppercase tracking-[.16em] text-ink-soft">
          Vận hành · Admin
        </p>
        <h1 className="mb-0 mt-2 font-body text-3xl font-extrabold tracking-tight text-pine sm:text-4xl">
          Giao dịch
        </h1>
        <p className="mb-0 mt-2 max-w-2xl text-sm text-ink-soft">
          Tra cứu đơn hàng, thanh toán và yêu cầu hoàn tiền trên cùng một không
          gian quản lý.
        </p>
      </header>
      <nav
        aria-label="Phân hệ giao dịch"
        className="sticky top-0 z-10 -mx-1 flex overflow-x-auto rounded-xl border border-line bg-surface/95 p-1 shadow-sm backdrop-blur sm:mx-0 sm:w-fit"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={tab === item.id ? "page" : undefined}
            onClick={() => navigate(item.path)}
            className={`relative min-h-11 min-w-28 rounded-lg px-5 text-sm font-bold transition-all duration-200 ${tab === item.id ? "bg-pine text-paper shadow-sm" : "text-ink-soft hover:bg-paper-deep hover:text-ink"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div
        key={tab}
        className="min-w-0 animate-[transaction-enter_.22s_ease-out] motion-reduce:animate-none"
      >
        {tab === "orders" ? (
          <AdminOrdersPage />
        ) : tab === "payments" ? (
          <AdminPaymentsPage />
        ) : (
          <RefundAdminPage />
        )}
      </div>
      <style>{`@keyframes transaction-enter{from{opacity:.45;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </main>
  );
}
