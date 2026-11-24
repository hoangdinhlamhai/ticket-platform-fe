import type { AdminPath } from "../../../../routes/admin-route.ts";

const tabs: readonly { label: string; path: AdminPath; id: string }[] = [
  { id: "listings", label: "Tin đăng resale", path: "/admin/resale" },
  {
    id: "transactions",
    label: "Giao dịch resale",
    path: "/admin/resale/transactions",
  },
  {
    id: "complaints",
    label: "Khiếu nại",
    path: "/admin/resale/complaints",
  },
];

export function ResaleSectionTabs({
  activeTab,
  navigate,
}: {
  readonly activeTab: (typeof tabs)[number]["id"];
  readonly navigate: (path: AdminPath) => void;
}) {
  return (
    <nav
      aria-label="Các mục quản lý resale"
      className="flex gap-2 overflow-x-auto border-b border-line"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          aria-current={activeTab === tab.id ? "page" : undefined}
          className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-bold transition ${activeTab === tab.id ? "border-pine text-pine" : "border-transparent text-ink-soft hover:text-pine"}`}
          onClick={() => navigate(tab.path)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
