import type { ResaleTransaction } from "../../api/adminApi.ts";
import { BadgeCheck, Clock3, ListOrdered, LoaderCircle } from "lucide-react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { useResaleStats } from "../hooks/use-resale-stats.ts";
import { ResaleSectionTabs } from "./ResaleSectionTabs.tsx";
import { ResaleStatsCards } from "./ResaleStatsCards.tsx";
import {
  date,
  money,
  statusStyle,
  statusText,
  statuses,
} from "../helpers/resale-transaction-format.ts";

type Props = {
  rows: readonly ResaleTransaction[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  q: string;
  setQ: (q: string) => void;
  status: string;
  setStatus: (status: string) => void;
  from: string;
  setFrom: (from: string) => void;
  to: string;
  setTo: (to: string) => void;
  loading: boolean;
  error: string;
  open: (id: string) => void;
  navigate: (path: AdminPath) => void;
};

export function ResaleTransactionList({
  rows,
  total,
  page,
  setPage,
  pageSize,
  q,
  setQ,
  status,
  setStatus,
  from,
  setFrom,
  to,
  setTo,
  loading,
  error,
  open,
  navigate,
}: Props) {
  const summary = useResaleStats("transactions");
  const cards = [
    {
      label: "Tổng giao dịch",
      value: summary.stats?.total ?? null,
      icon: <ListOrdered size={18} aria-hidden="true" />,
      tone: "text-pine",
      sub: "Trên toàn hệ thống",
    },
    {
      label: "Chờ thanh toán",
      value: summary.stats?.pendingPayment ?? null,
      icon: <Clock3 size={18} aria-hidden="true" />,
      tone: "text-blue-deep",
      sub: "Người mua chưa hoàn tất",
    },
    {
      label: "Đang xử lý",
      value: summary.stats?.processing ?? null,
      icon: <LoaderCircle size={18} aria-hidden="true" />,
      tone: "text-warning",
      sub: "Đã thanh toán, chờ hoàn tất",
    },
    {
      label: "Thành công",
      value: summary.stats?.completed ?? null,
      icon: <BadgeCheck size={18} aria-hidden="true" />,
      tone: "text-success",
      sub: "Giao dịch hoàn tất",
    },
  ];
  return (
    <section className="grid gap-5">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Resale
        </p>
        <h1 className="text-3xl font-extrabold">Giao dịch resale</h1>
      </header>
      <ResaleSectionTabs activeTab="transactions" navigate={navigate} />
      <ResaleStatsCards cards={cards} loading={summary.loading} />
      {summary.error ? (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          <span>{summary.error}</span>
          <button
            type="button"
            onClick={summary.retry}
            className="min-h-10 rounded-lg border border-error/30 px-4 font-bold"
          >
            Thử tải lại thống kê
          </button>
        </div>
      ) : null}
      {error && (
        <p
          role="alert"
          className="rounded border border-error bg-error/10 p-4 text-error"
        >
          {error}
        </p>
      )}
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          aria-label="Tìm mã giao dịch"
          className="rounded border border-line bg-surface px-3 py-2"
          placeholder="Tìm mã giao dịch"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Lọc trạng thái"
          className="rounded border border-line bg-surface px-3 py-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusText[s]}
            </option>
          ))}
        </select>
        <label className="text-sm text-ink-soft">
          Từ ngày
          <input
            aria-label="Từ ngày"
            type="date"
            className="mt-1 block w-full rounded border border-line bg-surface px-3 py-2"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm text-ink-soft">
          Đến ngày
          <input
            aria-label="Đến ngày"
            type="date"
            className="mt-1 block w-full rounded border border-line bg-surface px-3 py-2"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              {[
                "Mã giao dịch",
                "Sự kiện",
                "Vé",
                "Người bán",
                "Người mua",
                "Giá bán",
                "Trạng thái",
                "Tạo lúc",
                "",
              ].map((x) => (
                <th key={x} className="px-4 py-3">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">
                  <span
                    className="block max-w-44 overflow-hidden text-ellipsis whitespace-nowrap"
                    title={row.maGiaoDich ?? row.transactionCode ?? row.id}
                  >
                    {row.maGiaoDich ?? row.transactionCode ?? row.id}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {row.event?.title ??
                    row.event?.tieuDe ??
                    row.eventTitle ??
                    row.suKien?.tieuDe ??
                    row.listing?.event?.title ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {row.ticket
                    ? `${row.ticket.type}${row.ticket.seat ? ` · ${row.ticket.seat}` : ""}`
                    : (row.listing?.ticket?.ticketCode ?? "—")}
                </td>
                <td className="px-4 py-3">
                  {row.seller?.hoTen ??
                    row.seller?.fullName ??
                    row.listing?.seller?.fullName ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {row.buyer?.hoTen ?? row.buyer?.fullName ?? "—"}
                </td>
                <td className="px-4 py-3">{money(row.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 font-bold ${statusStyle[row.status] ?? "bg-surface text-ink"}`}
                  >
                    {statusText[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3">{date(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    className="font-bold text-primary"
                    onClick={() => open(row.id)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-ink-soft">
                  {loading ? "Đang tải…" : "Không có giao dịch."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">
          {total} giao dịch · Trang {page} /{" "}
          {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded border border-line px-3 py-2 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <button
            className="rounded border border-line px-3 py-2 disabled:opacity-40"
            disabled={page * pageSize >= total}
            onClick={() => setPage(page + 1)}
          >
            Tiếp
          </button>
        </div>
      </footer>
    </section>
  );
}
