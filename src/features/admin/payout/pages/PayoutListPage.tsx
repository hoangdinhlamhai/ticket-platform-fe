import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import * as adminPayoutApi from "../api/adminPayoutApi.ts";
import { PayoutList } from "../components/PayoutList.tsx";
import type { AdminPayout } from "../types/admin-payout.ts";

type Props = { readonly navigate: (path: AdminPath) => void };

export function PayoutListPage({ navigate }: Props) {
  const [payouts, setPayouts] = useState<readonly AdminPayout[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadPendingPayouts = async () => {
      try {
        const { data } = await adminPayoutApi.findPending();
        if (active) {
          setPayouts(data.payouts);
          setTotal(data.total);
        }
      } catch (cause: unknown) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách payout.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPendingPayouts();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="grid gap-5">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Giao dịch
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Payout chờ duyệt</h1>
        <p className="mt-2 text-ink-soft">{total} payout đang chờ xử lý.</p>
      </header>
      {error && (
        <p
          className="rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {error}
        </p>
      )}
      {loading ? (
        <p
          className="rounded-lg border border-line bg-surface p-5"
          role="status"
        >
          Đang tải payout…
        </p>
      ) : (
        <PayoutList payouts={payouts} navigate={navigate} />
      )}
    </section>
  );
}
