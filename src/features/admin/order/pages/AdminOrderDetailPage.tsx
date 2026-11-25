import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { AdminBackButton } from "../../components/AdminCommon.tsx";
import { findOrder } from "../api/adminOrderApi.ts";
import { AdminOrderDetailSkeleton } from "../components/AdminOrderDetailSkeleton.tsx";
import {
  orderDate,
  orderMoney,
  orderStatus,
} from "../components/order-presentation.ts";
import type { AdminOrderRow } from "../types/admin-order.ts";

export function AdminOrderDetailPage({
  orderId,
  navigate,
}: {
  readonly orderId: string;
  readonly navigate: (path: AdminPath) => void;
}) {
  const [order, setOrder] = useState<AdminOrderRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const response = await findOrder(orderId);
        if (active) setOrder(response.data.order as unknown as AdminOrderRow);
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải chi tiết đơn hàng.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadOrder();
    return () => {
      active = false;
    };
  }, [orderId, retryKey]);

  if (loading) return <AdminOrderDetailSkeleton />;
  if (error || !order) {
    return (
      <section className="grid justify-items-start gap-4">
        <p
          className="rounded-xl border border-error/30 bg-error/10 p-4 text-error"
          role="alert"
        >
          {error || "Không tìm thấy đơn hàng."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="min-h-11 rounded-lg border border-blue px-4 font-bold text-blue-deep"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Thử tải lại
          </button>
          <AdminBackButton onClick={() => navigate("/admin/orders")} />
        </div>
      </section>
    );
  }

  const badge = orderStatus[order.status];
  return (
    <section className="grid gap-5">
      <AdminBackButton onClick={() => navigate("/admin/orders")} />
      <header className="grid gap-2">
        <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-ink-soft">
          Chi tiết đơn hàng
        </p>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="m-0 break-all font-mono text-xl font-extrabold text-pine">
            {order.id}
          </h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${badge?.style ?? "bg-paper-deep text-ink"}`}
          >
            {badge?.label ?? order.status}
          </span>
        </div>
        <p className="m-0 text-sm text-ink-soft">
          Tạo lúc {orderDate(order.createdAt)}
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="m-0 text-sm font-extrabold text-pine">
            Thông tin người mua
          </h2>
          <p className="mb-0 mt-3 font-bold">{order.user.fullName}</p>
          <p className="mb-0 mt-1 break-all text-sm text-ink-soft">
            {order.user.email}
          </p>
          <p className="mb-0 mt-1 break-all text-xs text-ink-soft">
            ID: {order.user.id}
          </p>
        </section>
        <section className="rounded-xl border border-line bg-surface p-4">
          <h2 className="m-0 text-sm font-extrabold text-pine">Sự kiện</h2>
          <p className="mb-0 mt-3 font-bold">{order.event.title}</p>
          <p className="mb-0 mt-1 break-all text-sm text-ink-soft">
            Mã sự kiện: {order.event.id}
          </p>
          <p className="mb-0 mt-1 text-xs text-ink-soft">
            Ngày diễn ra và địa điểm chưa được API cung cấp
          </p>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="m-0 text-sm font-extrabold text-pine">
            Tóm tắt đơn hàng
          </h2>
          <strong className="text-lg">{orderMoney(order.total)}</strong>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-ink-soft">Tạm tính</dt>
            <dd className="mb-0 mt-1 font-semibold">
              {order.subtotal == null
                ? "Chưa có dữ liệu"
                : orderMoney(order.subtotal)}
            </dd>
          </div>
          <div>
            <dt className="text-ink-soft">Phí nền tảng</dt>
            <dd className="mb-0 mt-1 font-semibold">API chưa cung cấp</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Hạn thanh toán</dt>
            <dd className="mb-0 mt-1 font-semibold">API chưa cung cấp</dd>
          </div>
          <div>
            <dt className="text-ink-soft">Ảnh sự kiện</dt>
            <dd className="mb-0 mt-1 font-semibold">API chưa cung cấp</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="m-0 text-sm font-extrabold text-pine">
          Vé trong đơn hàng ({order.tickets?.length ?? 0})
        </h2>
        {order.tickets?.length ? (
          <div className="mt-3 divide-y divide-line">
            {order.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="m-0 font-bold">
                    {ticket.ticketType}
                    {ticket.seat ? ` · ${ticket.seat}` : ""}
                  </p>
                  <p className="mb-0 mt-1 break-all font-mono text-xs text-ink-soft">
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

      <section className="rounded-xl border border-line bg-surface p-4">
        <h2 className="m-0 text-sm font-extrabold text-pine">
          Thanh toán liên quan
        </h2>
        {order.payments?.length ? (
          <div className="mt-3 grid gap-3">
            {order.payments.map((payment) => (
              <article
                key={payment.id}
                className="rounded-lg border border-line bg-paper p-3"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="break-all font-mono text-xs font-bold">
                    {payment.id}
                  </span>
                  <span className="rounded-full bg-paper-deep px-2 py-1 text-xs font-bold">
                    {payment.status}
                  </span>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs text-ink-soft">Nhà cung cấp</dt>
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
                    <dt className="text-xs text-ink-soft">Mã giao dịch</dt>
                    <dd className="mb-0 mt-1 break-all font-mono text-xs">
                      {payment.transactionId ?? "Chưa có dữ liệu"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ink-soft">Đã thanh toán lúc</dt>
                    <dd className="mb-0 mt-1">{orderDate(payment.paidAt)}</dd>
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
    </section>
  );
}
