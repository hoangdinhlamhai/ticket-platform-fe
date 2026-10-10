import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { findMineById } from "../../orders/api/orderApi";
import type { AttendeeOrderDetail } from "../../orders/types/order";
import type { AttendeeOrder } from "../../orders";
import { formatTicketPrice } from "../../events";
import { PrimaryCheckoutSteps } from "../components/PrimaryCheckoutSteps";

type Props = {
  eventId: string;
  orderId: string | null;
  order: AttendeeOrder | null;
  onNavigate: (path: AttendeePath) => void;
};

const demoCopy = {
  completed: [
    "THANH TOÁN DEMO THÀNH CÔNG",
    "Vé đã sẵn sàng trong ví của bạn.",
    "Order demo đã hoàn tất.",
  ],
  failed: [
    "THANH TOÁN DEMO THẤT BẠI",
    "Giao dịch chưa thể hoàn tất.",
    "Không có vé nào được phát hành. Bạn có thể quay lại checkout và thử lại.",
  ],
  expired: [
    "PHIÊN THANH TOÁN ĐÃ HẾT HẠN",
    "Lựa chọn đã được trả về sự kiện.",
    "Hãy quay lại sự kiện để chọn vé khác.",
  ],
} as const;

export function PrimaryOrderResultPage({
  eventId,
  orderId,
  order,
  onNavigate,
}: Props) {
  const [serverOrder, setServerOrder] = useState<AttendeeOrderDetail | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    let isActive = true;

    const loadOrder = async () => {
      try {
        const { data } = await findMineById(orderId);
        if (isActive) setServerOrder(data.order);
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
  }, [orderId]);

  if (orderId) {
    if (isLoading) {
      return (
        <section className="px-6 py-24 text-center text-ink-soft">
          Đang tải kết quả thanh toán…
        </section>
      );
    }

    if (hasError || !serverOrder || serverOrder.event.id !== eventId) {
      return (
        <section className="px-6 py-24 text-center">
          <h1 className="font-body text-4xl font-extrabold">
            Không tải được kết quả thanh toán.
          </h1>
          <button
            className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
            type="button"
            onClick={() => onNavigate("/orders")}
          >
            Xem đơn hàng
          </button>
        </section>
      );
    }

    const isPaid = serverOrder.status === "PAID";
    const title = isPaid
      ? "Thanh toán thành công!"
      : "Thanh toán chưa hoàn tất.";
    const detail = isPaid
      ? serverOrder.tickets.length
        ? `Đã phát hành ${serverOrder.tickets.length} vé cho đơn hàng của bạn.`
        : "Đơn hàng đã được xác nhận thanh toán. Vé sẽ xuất hiện trong tài khoản khi được phát hành."
      : "Đơn hàng chưa được thanh toán. Bạn có thể xem trạng thái hoặc quay lại chọn vé.";

    return (
      <div className="px-6 py-[clamp(3.5rem,7vw,6rem)] mobile:px-5">
        <div className="mx-auto max-w-[68rem]">
          <PrimaryCheckoutSteps current="complete" />
          <header className="mt-10 text-center">
            <p
              className={`text-xs font-extrabold tracking-[0.12em] ${isPaid ? "text-success" : "text-coral-dark"}`}
            >
              {isPaid ? "ĐÃ XÁC NHẬN THANH TOÁN" : "TRẠNG THÁI ĐƠN HÀNG"}
            </p>
            <h1 className="mx-auto mt-4 max-w-[56rem] font-body text-[clamp(3rem,7vw,6rem)] leading-[0.84] font-extrabold tracking-[-0.1em]">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-[42rem] leading-[1.7] text-ink-soft">
              {detail}
            </p>
          </header>

          <section className="mx-auto mt-9 max-w-[48rem] rounded-lg border border-line bg-surface p-6">
            <dl className="grid grid-cols-2 gap-5 mobile:grid-cols-1">
              <div>
                <dt className="text-sm text-ink-soft">Mã đơn</dt>
                <dd className="m-0 mt-1 break-all font-extrabold">
                  {serverOrder.id}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Sự kiện</dt>
                <dd className="m-0 mt-1 font-extrabold">
                  {serverOrder.event.title}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Trạng thái</dt>
                <dd className="m-0 mt-1 font-extrabold">
                  {serverOrder.status}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Tổng thanh toán</dt>
                <dd className="m-0 mt-1 font-extrabold text-blue-deep">
                  {formatTicketPrice(serverOrder.total)}
                </dd>
              </div>
            </dl>
          </section>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {serverOrder.tickets.map((ticket, index) => (
              <button
                key={ticket.id}
                className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                type="button"
                onClick={() => onNavigate(`/tickets/${ticket.id}`)}
              >
                Mở vé {index + 1}
              </button>
            ))}
            <button
              className="min-h-12 rounded-md border border-blue-deep/50 px-5 font-extrabold text-blue-deep"
              type="button"
              onClick={() => onNavigate(`/orders/${serverOrder.id}`)}
            >
              Xem chi tiết đơn hàng
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!order || order.eventId !== eventId || order.source !== "primary") {
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="font-body text-5xl font-extrabold">
          Chưa có kết quả thanh toán.
        </h1>
        <p className="mt-4 text-ink-soft">
          Không tìm thấy đơn hàng cho phiên này.
        </p>
        <button
          className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
          type="button"
          onClick={() => onNavigate(`/events/${eventId}`)}
        >
          Quay lại sự kiện
        </button>
      </section>
    );
  }

  const [eyebrow, title, detail] = demoCopy[order.status];
  const firstTicket = order.issuedTicketIds[0];

  return (
    <div className="px-6 py-[clamp(3.5rem,7vw,6rem)] mobile:px-5">
      <div className="mx-auto max-w-[68rem]">
        <PrimaryCheckoutSteps current="complete" />
        <header className="mt-10 text-center">
          <p className="text-xs font-extrabold tracking-[0.12em] text-success">
            {eyebrow}
          </p>
          <h1 className="mx-auto mt-4 max-w-[56rem] font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-[42rem] leading-[1.7] text-ink-soft">
            {detail}
          </p>
        </header>
        <section className="mx-auto mt-9 max-w-[48rem] rounded-lg border border-line bg-surface p-6">
          <dl className="grid grid-cols-2 gap-5 mobile:grid-cols-1">
            <div>
              <dt className="text-sm text-ink-soft">Mã đơn</dt>
              <dd className="m-0 mt-1 font-extrabold">{order.id}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Trạng thái</dt>
              <dd className="m-0 mt-1 font-extrabold">{order.status}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Sự kiện</dt>
              <dd className="m-0 mt-1 font-extrabold">{order.eventTitle}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Tổng tiền</dt>
              <dd className="m-0 mt-1 font-extrabold text-blue-deep">
                {formatTicketPrice(order.total)}
              </dd>
            </div>
          </dl>
        </section>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {firstTicket && (
            <button
              className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
              type="button"
              onClick={() => onNavigate(`/tickets/${firstTicket}`)}
            >
              Mở e-ticket
            </button>
          )}
          <button
            className="min-h-12 rounded-md border border-blue-deep/50 px-5 font-extrabold text-blue-deep"
            type="button"
            onClick={() => onNavigate("/orders")}
          >
            Xem đơn hàng
          </button>
        </div>
      </div>
    </div>
  );
}
