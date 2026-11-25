import { useEffect, useMemo, useState } from "react";
import { findPayment, findPayments } from "../api/adminPaymentApi.ts";
import type { AdminPayment } from "../types/admin-payment.ts";
import {
  formatPaymentDate as date,
  formatPaymentMoney as money,
  paymentStatusText as statusText,
  paymentStatusTone as statusTone,
} from "../components/payment-presentation.ts";
export function AdminPaymentsPage() {
  const [payments, setPayments] = useState<readonly AdminPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [counts, setCounts] = useState({
    success: 0,
    failed: 0,
    processing: 0,
  });
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminPayment | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 100;
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [list, paid, failed, pending] = await Promise.all([
          findPayments({
            status: status || undefined,
            page,
            pageSize,
          }),
          findPayments({ status: "PAID", page: 1, pageSize: 1 }),
          findPayments({ status: "FAILED", page: 1, pageSize: 1 }),
          findPayments({ status: "PENDING", page: 1, pageSize: 1 }),
        ]);
        if (!active) return;
        setPayments(list.data.payments as readonly AdminPayment[]);
        setTotal(list.data.total);
        setCounts({
          success: paid.data.total,
          failed: failed.data.total,
          processing: pending.data.total,
        });
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải giao dịch.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [page, status]);
  const openPayment = async (payment: AdminPayment) => {
    setSelected(payment);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await findPayment(payment.id);
      setSelected(response.data.payment as unknown as AdminPayment);
    } catch (cause) {
      setDetailError(
        cause instanceof Error
          ? cause.message
          : "Không thể tải chi tiết payment.",
      );
    } finally {
      setDetailLoading(false);
    }
  };
  const filtered = useMemo(
    () =>
      payments.filter((payment) => {
        const timestamp = new Date(
          payment.paidAt ?? payment.createdAt,
        ).getTime();
        const afterFrom =
          !from || timestamp >= new Date(`${from}T00:00:00`).getTime();
        const beforeTo =
          !to || timestamp <= new Date(`${to}T23:59:59.999`).getTime();
        const term = query.trim().toLocaleLowerCase();
        const matches =
          !term ||
          [
            payment.id,
            payment.transactionId,
            payment.order.id,
            payment.order.user.fullName,
            payment.order.user.email,
          ].some((value) => value?.toLocaleLowerCase().includes(term));
        return afterFrom && beforeTo && matches;
      }),
    [payments, from, to, query],
  );
  const summary = [
    ["Tổng giao dịch", total, "text-blue-deep"],
    ["Thành công", counts.success, "text-success"],
    ["Thất bại", counts.failed, "text-error"],
    ["Đang xử lý", counts.processing, "text-warning"],
  ] as const;
  return (
    <section className="grid gap-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map(([label, value, tone]) => (
          <article
            key={label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="m-0 text-sm font-semibold text-ink-soft">{label}</p>
            <p className={`mb-0 mt-2 text-2xl font-extrabold ${tone}`}>
              {loading ? "—" : value.toLocaleString("vi-VN")}
            </p>
          </article>
        ))}
      </div>
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">
          Tìm Payment, Order hoặc người dùng
          <input
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3 font-normal"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập mã hoặc tên, email"
          />
        </label>
        <label className="text-sm font-bold">
          Trạng thái
          <select
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PAID">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="PENDING">Đang xử lý</option>
          </select>
        </label>
        <label className="text-sm font-bold">
          Từ ngày
          <input
            aria-label="Từ ngày"
            type="date"
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </label>
        <label className="text-sm font-bold">
          Đến ngày
          <input
            aria-label="Đến ngày"
            type="date"
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded border border-error bg-error/10 p-4 text-error"
        >
          {error}
        </p>
      )}
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[1120px] text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              {[
                "Mã Payment",
                "Người thanh toán",
                "Sự kiện",
                "Số tiền",
                "Phương thức",
                "Trạng thái",
                "Thời gian",
                "Thao tác",
              ].map((label) => (
                <th key={label} className="px-4 py-3 font-semibold">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((payment) => {
              const order = payment.order;
              return (
                <tr
                  key={payment.id}
                  className="border-b border-line last:border-0"
                >
                  <td className="px-4 py-3 font-mono">{payment.id}</td>
                  <td className="px-4 py-3">
                    {order.user.fullName ?? "Chưa có dữ liệu"}
                    <span className="block text-xs text-ink-soft">
                      {order.user.email ?? ""}
                    </span>
                  </td>
                  <td className="max-w-52 truncate px-4 py-3">
                    {order.event.title ?? "Chưa có dữ liệu"}
                  </td>
                  <td className="px-4 py-3 font-bold">
                    {money(payment.amount)}
                  </td>
                  <td className="px-4 py-3">{payment.provider ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusTone[payment.status] ?? "bg-surface text-ink"}`}
                    >
                      {statusText[payment.status] ?? payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {date(payment.paidAt ?? payment.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="font-bold text-blue-deep underline"
                      type="button"
                      onClick={() => void openPayment(payment)}
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              );
            })}
            {!filtered.length && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-ink-soft"
                >
                  {loading
                    ? "Đang tải giao dịch…"
                    : "Không tìm thấy giao dịch phù hợp."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
        <span>
          {total.toLocaleString("vi-VN")} giao dịch · Trang {page} /{" "}
          {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <div className="flex gap-2">
          <button
            className="min-h-10 rounded border border-line px-3 disabled:opacity-40"
            disabled={page <= 1 || loading}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <button
            className="min-h-10 rounded border border-line px-3 disabled:opacity-40"
            disabled={page * pageSize >= total || loading}
            onClick={() => setPage(page + 1)}
          >
            Tiếp
          </button>
        </div>
      </footer>
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/40"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelected(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-detail-title"
            className="h-full w-full max-w-2xl overflow-y-auto bg-paper p-5 shadow-xl sm:p-8"
          >
            <button
              type="button"
              className="mb-5 font-bold text-blue-deep"
              onClick={() => setSelected(null)}
            >
              ← Đóng chi tiết
            </button>
            {detailLoading ? <p role="status">Đang tải chi tiết...</p> : null}
            {detailError ? (
              <p role="alert" className="text-error">{detailError}</p>
            ) : null}
            <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
              Payment · Chỉ đọc
            </p>
            <h2
              id="payment-detail-title"
              className="mt-1 break-all font-mono text-2xl font-extrabold"
            >
              {selected.id}
            </h2>
            <span
              className={`inline-block rounded-full px-3 py-1 text-sm font-bold ${statusTone[selected.status] ?? "bg-surface text-ink"}`}
            >
              {statusText[selected.status] ?? selected.status}
            </span>
            {(() => {
              const order = selected.order;
              const fields: [string, unknown][] = [
                ["Transaction ID từ Provider", selected.transactionId],
                ["Mã Order", selected.order.id],
                ["Người thanh toán", order?.user.fullName],
                ["Email", order?.user.email],
                ["Sự kiện", order?.event.title],
                ["Tổng thanh toán", money(selected.amount)],
                ["Phương thức / Provider", selected.provider],
                ["Thời gian tạo", date(selected.createdAt)],
                ["Thời gian thanh toán", date(selected.paidAt)],
                [
                  "Thông tin đối soát",
                  "API hiện chưa cung cấp dữ liệu đối soát.",
                ],
              ];
              return (
                <>
                  <section className="mt-6 rounded-lg border border-line bg-surface p-5">
                    <h3 className="mt-0 text-lg font-extrabold">
                      Thông tin thanh toán & đơn hàng
                    </h3>
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {fields.map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-sm text-ink-soft">{label}</dt>
                          <dd className="mb-0 mt-1 break-all font-semibold">
                            {value == null || value === ""
                              ? "Chưa có dữ liệu"
                              : String(value)}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                  <section className="mt-4 rounded-lg border border-line bg-surface p-5">
                    <h3 className="mt-0 text-lg font-extrabold">Vé đã mua</h3>
                    {!order ? (
                      <p className="mb-0 text-sm text-ink-soft">
                        Không tải được thông tin đơn hàng liên quan.
                      </p>
                    ) : order.tickets?.length ? (
                      <ul className="m-0 grid list-none gap-3 p-0">
                        {order.tickets?.map((ticket) => (
                          <li
                            key={ticket.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-3"
                          >
                            <div>
                              <p className="m-0 font-bold">
                                {ticket.ticketType}
                                {ticket.seat ? ` · ${ticket.seat}` : ""}
                              </p>
                              <p className="m-0 mt-1 font-mono text-sm text-ink-soft">
                                {ticket.ticketCode}
                              </p>
                            </div>
                            <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-bold">
                              {ticket.status}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-0 text-sm text-ink-soft">
                        Đơn hàng chưa có vé được phát hành.
                      </p>
                    )}
                  </section>
                </>
              );
            })()}
            <p className="mt-5 text-sm text-ink-soft">
              Giao dịch chỉ xem được; Admin không thể sửa số tiền hoặc xóa.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
