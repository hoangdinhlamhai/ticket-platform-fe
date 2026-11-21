import { useEffect, useMemo, useState } from 'react';
import { findOrder, findOrders } from '../api/adminOrderApi.ts';
import type { AdminOrderRow } from '../types/admin-order.ts';
import { orderDate, orderMoney, orderStatus } from '../components/order-presentation.ts';

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [eventId, setEventId] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<AdminOrderRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const [list, all, paid, pending, cancelled] = await Promise.all([
          findOrders({
            page,
            pageSize,
            status: status || undefined,
            q: /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(query.trim())
              ? query.trim()
              : undefined,
          }),
          findOrders({ page: 1, pageSize: 1 }),
          findOrders({ status: "PAID", page: 1, pageSize: 1 }),
          findOrders({
            status: "PENDING_PAYMENT",
            page: 1,
            pageSize: 1,
          }),
          findOrders({ status: "CANCELLED", page: 1, pageSize: 1 }),
        ]);
        if (!active) return;
        setOrders(list.data.orders as unknown as AdminOrderRow[]);
        setTotal(list.data.total);
        setStats({
          total: all.data.total,
          paid: paid.data.total,
          pending: pending.data.total,
          cancelled: cancelled.data.total,
        });
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách đơn hàng.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadOrders();
    return () => {
      active = false;
    };
  }, [page, pageSize, status, query, retryKey]);

  const openOrder = async (order: AdminOrderRow) => {
    setSelected(order);
    setDetailLoading(true);
    setDetailError("");
    try {
      const response = await findOrder(order.id);
      setSelected(response.data.order as unknown as AdminOrderRow);
    } catch (cause) {
      setDetailError(
        cause instanceof Error
          ? cause.message
          : "Không thể tải chi tiết đơn hàng.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const events = useMemo(
    () => [
      ...new Map(orders.map((order) => [order.event.id, order.event])).values(),
    ],
    [orders],
  );
  const visibleOrders = orders.filter((order) => {
    const created = new Date(order.createdAt).getTime();
    const term = query.trim().toLocaleLowerCase("vi-VN");
    const matchesBuyer =
      !term ||
      [order.user.fullName, order.user.email].some((value) =>
        value.toLocaleLowerCase("vi-VN").includes(term),
      );
    return (
      matchesBuyer &&
      (!eventId || order.event.id === eventId) &&
      (!from || created >= new Date(`${from}T00:00:00`).getTime()) &&
      (!to || created <= new Date(`${to}T23:59:59.999`).getTime())
    );
  });
  const cards = [
    {
      label: "Tổng đơn hàng",
      value: stats.total,
      icon: "▤",
      tone: "text-pine",
      sub: "Trên toàn hệ thống",
    },
    {
      label: "Đã thanh toán",
      value: stats.paid,
      icon: "✓",
      tone: "text-success",
      sub: "Đơn đã ghi nhận thanh toán",
    },
    {
      label: "Chờ thanh toán",
      value: stats.pending,
      icon: "◷",
      tone: "text-warning",
      sub: "Đang chờ hoàn tất",
    },
    {
      label: "Đã hủy",
      value: stats.cancelled,
      icon: "×",
      tone: "text-error",
      sub: "Đơn đã bị hủy",
    },
  ];
  const reset = () => {
    setQuery("");
    setStatus("");
    setFrom("");
    setTo("");
    setEventId("");
    setPage(1);
  };

  return (
    <section className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none">
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
            {loading ? (
              <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
                _
              </p>
            ) : (
              <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
                {card.value.toLocaleString("vi-VN")}
              </p>
            )}
            <p className="mb-0 mt-1 text-xs text-ink-soft">{card.sub}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-6">
        <label className="text-xs font-bold text-ink-soft sm:col-span-2">
          Tìm đơn hàng hoặc người mua
          <input
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
            type="search"
            value={query}
            placeholder="Mã đơn, tên hoặc email"
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Trạng thái
          <select
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm text-ink"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="PENDING_PAYMENT">Chờ thanh toán</option>
            <option value="CANCELLED">Đã hủy</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Sự kiện
          <select
            className="mt-1 min-h-11 w-full truncate rounded-lg border border-line bg-paper px-3 text-sm text-ink"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả sự kiện</option>
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Từ ngày
          <input
            type="date"
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-2 text-sm text-ink"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Đến ngày
          <input
            type="date"
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-2 text-sm text-ink"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="flex items-end">
          <button
            type="button"
            onClick={reset}
            className="min-h-11 w-full rounded-lg border border-line px-3 text-sm font-bold text-ink-soft transition hover:border-pine hover:text-pine"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      </div>
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
            className="min-h-10 rounded-lg border border-error/30 px-4 font-bold transition hover:bg-error/10"
          >
            Thử tải lại
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <h2 className="m-0 text-base font-extrabold text-pine">
              Danh sách đơn hàng
            </h2>
            <p className="mb-0 mt-1 text-xs text-ink-soft">
              {total.toLocaleString("vi-VN")} kết quả · Trang {page} /{" "}
              {Math.max(1, Math.ceil(total / pageSize))}
            </p>
          </div>
          <span className="text-xs text-ink-soft">
            Chọn đơn hàng để xem chi tiết
          </span>
        </div>
        {loading ? (
          <div
            className="grid min-h-56 place-items-center p-8 text-center text-sm text-ink-soft"
            role="status"
          >
            Đang tải giao dịch...
          </div>
        ) : !error && visibleOrders.length === 0 ? (
          <div className="grid min-h-56 place-items-center p-8 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-paper-deep text-xl text-ink-soft">
                ⌕
              </span>
              <h3 className="mb-0 mt-3 text-base font-extrabold text-pine">
                Không tìm thấy đơn hàng
              </h3>
              <p className="mb-0 mt-1 text-sm text-ink-soft">
                Thử thay đổi từ khóa hoặc bộ lọc.
              </p>
            </div>
          </div>
        ) : (
          !error && (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000pe] text-left text-sm">
                  <thead className="bg-paper/70 text-xs uppercase tracking-wide text-ink-soft">
                    <tr>
                      {[
                        "Mã đơn hàng",
                        "Người mua",
                        "Sự kiện",
                        "Vé",
                        "Tổng tiền",
                        "Trạng thái",
                        "Thời gian",
                        "",
                      ].map((label) => (
                        <th key={label} className="px-4 py-3 font-bold">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleOrders.map((order) => {
                      const badge = orderStatus[order.status] ?? {
                        label: order.status,
                        style: "bg-paper-deep text-ink-soft",
                        icon: "•",
                      };
                      const initials = order.user.fullName
                        .trim()
                        .split(/\s+/)
                        .slice(-2)
                        .map((part) => part[0])
                        .join("")
                        .toLocaleUpperCase("vi-VN");
                      return (
                        <tr
                          key={order.id}
                          tabIndex={0}
                          onClick={() => void openOrder(order)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") void openOrder(order);
                          }}
                          className="cursor-pointer border-t border-line/70 transition-colors hover:bg-paper/70 focus-visible:outline-2 focus-visible:outline-pine"
                        >
                          <td
                            className="max-w-40 truncate px-4 py-4 font-mono text-xs font-bold text-pine"
                            title={order.id}
                          >
                            {order.id}
                          </td>
                          <td className="max-w-56 px-4 py-4">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-pine/10 text-xs font-extrabold text-pine">
                                {initials}
                              </span>
                              <span className="min-w-0">
                                <span className="block truncate font-bold">
                                  {order.user.fullName}
                                </span>
                                <span className="block truncate text-xs text-ink-soft">
                                  {order.user.email}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td
                            className="max-w-48 truncate px-4 py-4 font-medium"
                            title={order.event.title}
                          >
                            {order.event.title}
                          </td>
                          <td className="px-4 py-4">{order.ticketCount}</td>
                          <td className="whitespace-nowrap px-4 py-4 font-bold">
                            {orderMoney(order.total)}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badge.style}`}
                            >
                              <span aria-hidden="true">{badge.icon}</span>
                              {badge.label}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                            {orderDate(order.createdAt)}
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              title="Xem chi tiết đơn hàng"
                              aria-label={`Xem đơn hàng ${order.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                void openOrder(order);
                              }}
                              className="grid size-9 place-items-center rounded-lg text-pine transition hover:bg-pine/10"
                            >
                              ↗
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="grid gap-3 p-3 lg:hidden">
                {visibleOrders.map((order) => {
                  const badge = orderStatus[order.status] ?? {
                    label: order.status,
                    style: "bg-paper-deep text-ink-soft",
                    icon: "•",
                  };
                  return (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => void openOrder(order)}
                      className="grid gap-3 rounded-xl border border-line p-4 text-left transition hover:border-pine/40 hover:bg-paper/60"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="m-0 truncate font-mono text-xs font-bold text-pine">
                            {order.id}
                          </p>
                          <p className="mb-0 mt-1 truncate font-bold">
                            {order.user.fullName}
                          </p>
                          <p className="mb-0 truncate text-xs text-ink-soft">
                            {order.user.email}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 border-t border-line pt-3 text-xs">
                        <span className="max-w-[60%] truncate text-ink-soft">
                          {order.event.title}
                        </span>
                        <strong>{orderMoney(order.total)}</strong>
                      </div>
                      <span className="text-xs text-ink-soft">
                        {order.ticketCount} vé · {orderDate(order.createdAt)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )
        )}
        <footer className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
          <span className="text-xs text-ink-soft">
            {visibleOrders.length} đơn trên trang này
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
              className="min-h-9 rounded-lg border border-line px-3 font-bold disabled:opacity-40"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page * pageSize >= total || loading}
              onClick={() => setPage((p) => p + 1)}
              className="min-h-9 rounded-lg border border-line px-3 font-bold disabled:opacity-40"
            >
              Tiếp
            </button>
          </div>
        </footer>
      </div>
      {selected && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-detail-heading"
            className="h-full w-full max-w-3el animate-[transaction-enter_.2s_ease-out] overflow-y-auto bg-paper p-5 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mb-5 rounded-lg border border-line px-3 py-2 text-sm font-bold text-pine transition hover:bg-surface"
            >
              ← Quay lại danh sách
            </button>
            {detailLoading ? <p role="status">Đang tải chi tiết...</p> : null}
            {detailError ? (
              <p role="alert" className="text-error">
                {detailError}
              </p>
            ) : null}
            {!detailLoading &&
            !detailError &&
            selected.payments &&
            selected.tickets ? (
              <>
                <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
                  Chi tiết đơn hàng
                </p>
                <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
                  <h2
                    id="order-detail-heading"
                    className="m-0 break-all font-mono text-xl font-extrabold text-pine"
                  >
                    {selected.id}
                  </h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${orderStatus[selected.status]?.style ?? "bg-paper-deep text-ink"}`}
                  >
                    {orderStatus[selected.status]?.label ?? selected.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  Tạo lúc {orderDate(selected.createdAt)}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    [
                      "Thông tin người mua",
                      selected.user.fullName,
                      selected.user.email,
                      `ID: ${selected.user.id}`,
                    ],
                    [
                      "Sự kiện",
                      selected.event.title,
                      `Mã sự kiện: ${selected.event.id}`,
                      "Ngày diễn ra và địa điểm chưa được API cung cấp",
                    ],
                  ].map(([title, primary, secondary, extra]) => (
                    <section
                      key={title}
                      className="rounded-xl border border-line bg-surface p-4"
                    >
                      <h3 className="m-0 text-sm font-extrabold text-pine">
                        {title}
                      </h3>
                      <p className="mb-0 mt-3 font-bold">{primary}</p>
                      <p className="mb-0 mt-1 break-all text-sm text-ink-soft">
                        {secondary}
                      </p>
                      <p className="mb-0 mt-1 break-all text-xs text-ink-soft">
                        {extra}
                      </p>
                    </section>
                  ))}
                </div>
                <section className="mt-4 rounded-xl border border-line bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="m-0 text-sm font-extrabold text-pine">
                      Tóm tắt đơn hàng
                    </h3>
                    <strong className="text-lg">
                      {orderMoney(selected.total)}
                    </strong>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-ink-soft">Tạm tính</dt>
                      <dd className="mb-0 mt-1 font-semibold">
                        {selected.subtotal == null
                          ? "Chưa có dữ liệu"
                          : orderMoney(selected.subtotal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-soft">Phí nền tảng</dt>
                      <dd className="mb-0 mt-1 font-semibold">
                        API chưa cung cấp
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-soft">Hạn thanh toán</dt>
                      <dd className="mb-0 mt-1 font-semibold">
                        API chưa cung cấp
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-soft">Ảnh sự kiện</dt>
                      <dd className="mb-0 mt-1 font-semibold">
                        API chưa cung cấp
                      </dd>
                    </div>
                  </dl>
                </section>
                <section className="mt-4 rounded-xl border border-line bg-surface p-4">
                  <h3 className="m-0 text-sm font-extrabold text-pine">
                    Vé trong đơn hàng{" "}
                    <span className="font-normal text-ink-soft">
                      ({selected.tickets?.length ?? 0})
                    </span>
                  </h3>
                  {selected.tickets?.length ? (
                    <div className="mt-3 divide-y divide-line">
                      {selected.tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex flex-wrap items-center justify-between gap-2 py-3"
                        >
                          <div>
                            <p className="m-0 font-bold">
                              {ticket.ticketType}
                              {ticket.seat ? ` · ${ticket.seat}` : ""}
                            </p>
                            <p className="mb-0 mt-1 font-mono text-xs text-ink-soft">
                              {ticket.ticketCode}
                            </p>
                          </div>
                          <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-bold">
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-0 mt-3 text-sm text-ink-soft">
                      Đơn chưa có vé được phát hành.
                    </p>
                  )}
                </section>
                <section className="mt-4 rounded-xl border border-line bg-surface p-4">
                  <h3 className="m-0 text-sm font-extrabold text-pine">
                    Thanh toán liên quan
                  </h3>
                  {selected.payments?.length ? (
                    <div className="mt-3 grid gap-3">
                      {selected.payments.map((payment) => (
                        <article
                          key={payment.id}
                          className="rounded-lg border border-line bg-paper p-3"
                        >
                          <div className="flex flex-wrap justify-between gap-2">
                            <span className="font-mono text-xs font-bold">
                              {payment.id}
                            </span>
                            <span className="rounded-full bg-paper-deep px-2 py-1 text-xs font-bold">
                              {payment.status}
                            </span>
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <dt className="text-xs text-ink-soft">
                                Provider
                              </dt>
                              <dd className="mb-0 mt-1 font-semibold">
                                {payment.provider}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-ink-soft">Số tiền</dt>
                              <dd className="mb-0 mt-1 font-semibold">
                                {orderMoney(payment.amount)}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-ink-soft">
                                Mã giao dịch
                              </dt>
                              <dd className="mb-0 mt-1 break-all font-mono text-xs">
                                {payment.transactionId ?? "Chưa có dữ liệu"}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs text-ink-soft">
                                Đã thanh toán lúc
                              </dt>
                              <dd className="mb-0 mt-1">
                                {orderDate(payment.paidAt)}
                              </dd>
                            </div>
                          </dl>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <p className="mb-0 mt-3 text-sm text-ink-soft">
                      Chưa có giao dịch thanh toán.
                    </p>
                  )}
                </section>
              </>
            ) : null}
          </aside>
        </div>
      )}
    </section>
  );
}
