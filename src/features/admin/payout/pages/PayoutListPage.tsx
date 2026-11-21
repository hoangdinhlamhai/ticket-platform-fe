import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import * as adminPayoutApi from "../api/adminPayoutApi.ts";
import { PayoutList } from "../components/PayoutList.tsx";
import type { AdminPayout } from "../types/admin-payout.ts";
import type { PayoutStatusFilter } from "../api/adminPayoutApi.ts";

type Props = { readonly navigate: (path: AdminPath) => void };
type PayoutSummary = {
  total: number;
  pending: number;
  processing: number;
  approved: number;
};

const emptySummary: PayoutSummary = {
  total: 0,
  pending: 0,
  processing: 0,
  approved: 0,
};

export function PayoutListPage({ navigate }: Props) {
  const [payouts, setPayouts] = useState<readonly AdminPayout[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<PayoutStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [retryKey, setRetryKey] = useState(0);
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let active = true;
    async function loadPayouts() {
      setLoading(true);
      setError("");
      try {
        const [list, all, pending, processing, approved] = await Promise.all([
          adminPayoutApi.findPending(status, page),
          adminPayoutApi.findPending("ALL", 1),
          adminPayoutApi.findPending("PENDING_APPROVAL", 1),
          adminPayoutApi.findPending("PROCESSING", 1),
          adminPayoutApi.findPending("APPROVED", 1),
        ]);
        if (!active) return;
        setPayouts(list.data.payouts);
        setTotal(list.data.total);
        setSummary({
          total: all.data.total,
          pending: pending.data.total,
          processing: processing.data.total,
          approved: approved.data.total,
        });
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
    }

    void loadPayouts();
    return () => {
      active = false;
    };
  }, [status, page, retryKey]);

  const cards = [
    {
      label: "Tổng payout",
      value: summary.total,
      icon: "▤",
      tone: "text-pine",
      sub: "Trên toàn hệ thống",
    },
    {
      label: "Chờ duyệt",
      value: summary.pending,
      icon: "◷",
      tone: "text-blue-deep",
      sub: "Cần quản trị viên xem xét",
    },
    {
      label: "Đang xử lý",
      value: summary.processing,
      icon: "↻",
      tone: "text-warning",
      sub: "Đang gửi lệnh chi",
    },
    {
      label: "Đã hoàn tất",
      value: summary.approved,
      icon: "✓",
      tone: "text-success",
      sub: "Đã xử lý thành công",
    },
  ];

  return (
    <section className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Giao dịch
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Quản lý payout</h1>
        <p className="mt-2 text-ink-soft">
          {total.toLocaleString("vi-VN")} payout trong danh sách hiện tại.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 text-sm font-semibold text-ink-soft">
                {card.label}
              </p>
              <span
                aria-hidden="true"
                className={`grid size-9 place-items-center rounded-lg bg-paper-deep text-lg font-bold ${card.tone}`}
              >
                {card.icon}
              </span>
            </div>
            <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
              {loading ? "—" : card.value.toLocaleString("vi-VN")}
            </p>
            <p className="mb-0 mt-1 text-xs text-ink-soft">{card.sub}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_16rem_auto]">
        <div className="hidden sm:block">
          <h2 className="m-0 text-base font-extrabold text-pine">
            Lọc payout
          </h2>
          <p className="mb-0 mt-1 text-xs text-ink-soft">
            Chọn trạng thái cần theo dõi
          </p>
        </div>
        <label
          className="text-xs font-bold text-ink-soft"
          htmlFor="payout-status-filter"
        >
          Trạng thái payout
          <select
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
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
        <button
          type="button"
          onClick={() => {
            setStatus("ALL");
            setPage(1);
          }}
          className="min-h-11 self-end rounded-lg border border-line px-3 text-sm font-bold text-ink-soft transition hover:border-pine hover:text-pine"
        >
          Đặt lại bộ lọc
        </button>
      </div>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
          role="alert"
        >
          <span>{error}</span>
          <button
            className="min-h-10 rounded-lg border border-error/30 px-4 font-bold transition hover:bg-error/10"
            onClick={() => setRetryKey((key) => key + 1)}
            type="button"
          >
            Thử tải lại
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <h2 className="m-0 text-base font-extrabold text-pine">
              Danh sách payout
            </h2>
            <p className="mb-0 mt-1 text-xs text-ink-soft">
              {total.toLocaleString("vi-VN")} kết quả · Trang {page} /{" "}
              {pageCount}
            </p>
          </div>
          <span className="text-xs text-ink-soft">
            Chọn payout để xem chi tiết
          </span>
        </div>
        {loading ? (
          <div
            className="grid min-h-56 place-items-center p-8 text-center text-sm text-ink-soft"
            role="status"
          >
            Đang tải payout…
          </div>
        ) : error ? null : (
          <PayoutList payouts={payouts} navigate={navigate} />
        )}
      </div>

      {!loading && !error && total > pageSize ? (
        <nav
          aria-label="Phân trang payout"
          className="flex items-center justify-between text-sm text-ink-soft"
        >
          <span>
            Trang {page} / {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Trước
            </button>
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold disabled:cursor-not-allowed disabled:opacity-50"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Tiếp
            </button>
          </div>
        </nav>
      ) : null}
    </section>
  );
}
