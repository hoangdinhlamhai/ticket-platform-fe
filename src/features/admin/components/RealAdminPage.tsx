import { useEffect, useState } from "react";
import * as adminApi from "../api/adminApi.ts";

type Props = {
  readonly kind:
    | "dashboard"
    | "users"
    | "events"
    | "organizers"
    | "orders"
    | "payments"
    | "refunds"
    | "categories"
    | "resale"
    | "resale-transactions";
};

export function RealAdminPage({ kind }: Props) {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let result: unknown;
        switch (kind) {
          case "dashboard":
            result = (await adminApi.findMetrics()).data;
            break;
          case "users":
            result = (await adminApi.findUsers()).data;
            break;
          case "events":
            result = (await adminApi.findEvents()).data;
            break;
          case "organizers":
            result = (await adminApi.findOrganizers()).data;
            break;
          case "orders":
            result = (await adminApi.findOrders()).data;
            break;
          case "payments":
            result = (await adminApi.findPayments()).data;
            break;
          case "refunds":
            result = (await adminApi.findRefunds()).data;
            break;
          case "categories":
            result = (await adminApi.findCategories()).data;
            break;
          case "resale":
            result = (await adminApi.findListings()).data;
            break;
          case "resale-transactions":
            result = (await adminApi.findResaleTransactions()).data;
            break;
        }
        if (active) setData(result);
      } catch (cause: unknown) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải dữ liệu.",
          );
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, [kind]);

  const title = {
    dashboard: "Dashboard",
    users: "Người dùng",
    events: "Tất cả sự kiện",
    organizers: "Organizer",
    orders: "Orders",
    payments: "Payments",
    refunds: "Refunds",
    categories: "Danh mục",
    resale: "Ticket Resale · Listings",
    "resale-transactions": "Ticket Resale · Transactions",
  }[kind];

  return (
    <section className="grid gap-5">
      <div>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin
        </p>
        <h1 className="text-3xl font-extrabold">{title}</h1>
      </div>
      {error && (
        <p className="rounded border border-error bg-error/10 p-4 text-error">
          {error}
        </p>
      )}
      <pre className="max-h-[32rem] overflow-auto rounded-lg border border-line bg-surface p-5 text-sm">
        {data ? JSON.stringify(data, null, 2) : "Dữ liệu đang được tải..."}
      </pre>
    </section>
  );
}
