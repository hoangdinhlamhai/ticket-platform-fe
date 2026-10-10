import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { findMineById } from "../api/orderApi";
import { OrderDetailTimeline } from "../components/OrderDetailTimeline";
import { OrderStatusBadge } from "../components/OrderStatusBadge";
import type { AttendeeOrderDetail } from "../types/order";
import { formatTicketPrice } from "../../events";

type Props = {
  orderId: string;
  onNavigate: (path: AttendeePath) => void;
};

export function OrderDetailPage({ orderId, onNavigate }: Props) {
  const [order, setOrder] = useState<AttendeeOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadOrder = async () => {
      setIsLoading(true);
      setHasError(false);
      setOrder(null);

      try {
        const { data } = await findMineById(orderId);
        if (isActive) setOrder(data.order);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadOrder();
    return () => {
      isActive = false;
    };
  }, [orderId, reloadKey]);

  if (isLoading) {
    return (
      <section className="px-6 py-24 text-center text-ink-soft">
        Đang tải chi tiết đơn hàng…
      </section>
    );
  }

  if (hasError || !order) {
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="font-body text-4xl font-extrabold">
          {hasError ? "Không tải được đơn hàng." : "Không tìm thấy đơn hàng."}
        </h1>
        {hasError && (
          <button
            className="mt-5 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper"
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Thử lại
          </button>
        )}
        <button
          className="mt-5 min-h-11 rounded-md border border-blue-deep/50 px-4 font-extrabold text-blue-deep"
          type="button"
          onClick={() => onNavigate("/orders")}
        >
          Quay lại đơn hàng
        </button>
      </section>
    );
  }

  return (
    <section className="px-6 py-[clamp(3.5rem,6vw,5.5rem)] mobile:px-5">
      <div className="mx-auto max-w-[68rem]">
        <button
          className="min-h-11 font-extrabold text-blue-deep"
          type="button"
          onClick={() => onNavigate("/orders")}
        >
          ← Tất cả đơn hàng
        </button>

        <header className="mt-6 rounded-lg bg-pine p-6 text-paper">
          <OrderStatusBadge status={order.status} />
          <p className="mt-4 text-xs font-extrabold tracking-[0.1em] text-mint">
            MÃ ĐƠN · {order.id}
          </p>
          <h1 className="mt-3 font-body text-[clamp(2.7rem,6vw,5rem)] leading-[0.9] font-extrabold tracking-[-0.095em]">
            {order.event.title}
          </h1>
          {order.event.venueName && (
            <p className="mb-0 mt-3 text-paper/80">{order.event.venueName}</p>
          )}
        </header>

        <section className="mt-7 rounded-lg border border-line bg-surface p-6">
          <h2 className="m-0 text-2xl font-extrabold">Chi tiết thanh toán</h2>
          <dl className="mt-5 grid grid-cols-2 gap-5 mobile:grid-cols-1">
            <div>
              <dt className="text-sm text-ink-soft">Thời gian tạo</dt>
              <dd className="m-0 mt-1 font-bold">
                {new Date(order.createdAt).toLocaleString("vi-VN")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Trạng thái thanh toán</dt>
              <dd className="m-0 mt-1 font-bold">
                {order.payment?.status ?? "Chưa có thông tin"}
              </dd>
            </div>
            {order.payment?.paidAt && (
              <div>
                <dt className="text-sm text-ink-soft">Thời gian thanh toán</dt>
                <dd className="m-0 mt-1 font-bold">
                  {new Date(order.payment.paidAt).toLocaleString("vi-VN")}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            {order.items.map((item, index) => (
              <div
                key={`${item.ticketType.id}-${index}`}
                className="flex justify-between gap-4 py-2"
              >
                <span>
                  {item.ticketType.name} × {item.quantity}
                </span>
                <strong>
                  {formatTicketPrice(Number(item.unitPrice) * item.quantity)}
                </strong>
              </div>
            ))}
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-xl">
              <span>Tổng thanh toán</span>
              <strong className="text-blue-deep">
                {formatTicketPrice(order.total)}
              </strong>
            </div>
          </div>
        </section>

        <OrderDetailTimeline
          orderStatus={order.status}
          ticketCount={order.tickets.length}
        />

        {order.tickets.length > 0 && (
          <section className="mt-7 rounded-lg border border-line bg-surface p-6">
            <h2 className="m-0 text-2xl font-extrabold">Vé đã phát hành</h2>
            <ul className="mt-4 space-y-3 p-0">
              {order.tickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line p-4"
                >
                  <span className="font-extrabold">{ticket.ticketCode}</span>
                  <span className="text-sm text-ink-soft">{ticket.status}</span>
                  <button
                    className="min-h-10 rounded-md border border-blue-deep/50 px-3 text-sm font-extrabold text-blue-deep"
                    type="button"
                    onClick={() => onNavigate(`/tickets/${ticket.id}`)}
                  >
                    Mở vé
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
