import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import * as adminPayoutApi from "../api/adminPayoutApi.ts";
import { PayoutList } from "../components/PayoutList.tsx";
import type { AdminPayout } from "../types/admin-payout.ts";
import type { PayoutStatusFilter } from "../api/adminPayoutApi.ts";

type Props = { readonly navigate: (path: AdminPath) => void };

export function PayoutListPage({ navigate }: Props) {
  const [payouts, setPayouts] = useState<readonly AdminPayout[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<PayoutStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    let active = true;
    const loadPayouts = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await adminPayoutApi.findPending(status, page);
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

    void loadPayouts();
    return () => {
      active = false;
    };
  }, [status, page]);

  const statusLabel =
    status === "ALL"
      ? "t?ng c?ng"
      : status === "PENDING_APPROVAL"
        ? "ch? duy?t"
        : status === "PROCESSING"
          ? "?ang x? l?"
          : "?? duy?t";

  return (
    <section className="grid gap-5">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Giao dịch
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Quản lý payout</h1>
        <p className="mt-2 text-ink-soft">
          {total} payout {statusLabel}.
        </p>
      </header>
      <label
        className="grid max-w-xs gap-2 text-sm font-bold"
        htmlFor="payout-status-filter"
      >
        Trạng thái payout
        <select
          className="min-h-11 rounded-lg border border-line bg-surface px-3"
          id="payout-status-filter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as PayoutStatusFilter);
            setPage(1);
          }}
        >
          <option value="ALL">Tất cả payout</option>
          <option value="PENDING_APPROVAL">Chờ duyệt</option>
          <option value="PROCESSING">Đang xử lý</option>
          <option value="APPROVED">Đã duyệt</option>
        </select>
      </label>
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
        <>
          <PayoutList payouts={payouts} navigate={navigate} />
          {total > pageSize && (
            <nav
              aria-label="Phân trang payout"
              className="flex items-center justify-between"
            >
              <span className="text-sm text-ink-soft">
                Trang {page} / {Math.ceil(total / pageSize)}
              </span>
              <div className="flex gap-2">
                <button
                  className="min-h-10 rounded border border-line px-3 disabled:opacity-50"
                  disabled={page === 1}
                  onClick={() => setPage((current) => current - 1)}
                  type="button"
                >
                  Trước
                </button>
                <button
                  className="min-h-10 rounded border border-line px-3 disabled:opacity-50"
                  disabled={page >= Math.ceil(total / pageSize)}
                  onClick={() => setPage((current) => current + 1)}
                  type="button"
                >
                  Tiếp
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
