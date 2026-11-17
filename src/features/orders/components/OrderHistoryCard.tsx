import { useState, type MouseEvent } from "react";
import {
  shouldUseClientNavigation,
  type AttendeePath,
} from "../../../routes/attendee-route";
import { formatTicketPrice } from "../../events";
import { createResaleRefundRequest } from "../../resale/api/resaleApi";
import { resalePayoutFailureReasons } from "../../resale/helpers/resale-payout-domain";
import type { AttendeeOrderRecord } from "../types/order";
import { OrderStatusBadge } from "./OrderStatusBadge";

type Props = {
  order: AttendeeOrderRecord;
  onNavigate: (path: AttendeePath) => void;
};

export function OrderHistoryCard({ order, onNavigate }: Props) {
  const [refundStatus, setRefundStatus] = useState(order.refundStatus ?? null);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState("");
  const href: AttendeePath =
    order.source === "RESALE" && order.listingId
      ? `/resale/${order.listingId}/result?transactionId=${encodeURIComponent(order.id)}`
      : `/orders/${order.id}`;
  const open = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(event)) return;
    event.preventDefault();
    onNavigate(href);
  };
  const payoutFailed =
    order.source === "RESALE" &&
    (order.status === "PAYOUT_FAILED" ||
      ["FAILED", "REVERSED", "REJECTED"].includes(order.payoutStatus ?? ""));
  const payoutFailureMessage = order.payoutFailureCode
    ? (resalePayoutFailureReasons[order.payoutFailureCode] ??
      "Payout chưa thành công. Vui lòng liên hệ bộ phận hỗ trợ.")
    : "Xendit chưa hoàn tất payout thành công.";

  const submitRefundRequest = async () => {
    if (order.source !== "RESALE") return;
    setRefundSubmitting(true);
    setRefundError("");
    try {
      await createResaleRefundRequest(order.id, "");
      setRefundStatus("PENDING");
    } catch {
      setRefundError(
        "Không gửi được yêu cầu hoàn tiền. Giao dịch có thể vừa thay đổi; vui lòng tải lại trang.",
      );
    } finally {
      setRefundSubmitting(false);
    }
  };

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <OrderStatusBadge status={order.status} />
          {order.source === "RESALE" ? (
            <span className="ml-2 inline-flex rounded-sm border border-coral-dark/35 bg-paper-deep px-2 py-1 text-[0.68rem] font-extrabold tracking-[0.05em] text-coral-dark">
              VE RESALE
            </span>
          ) : null}
          <p className="mt-3 mb-0 text-xs font-extrabold tracking-[0.08em] text-blue-deep">
            MÃ ĐƠN · {order.id}
          </p>
          <h2 className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em]">
            {order.event.title}
          </h2>
          <p className="mt-2 mb-0 text-sm text-ink-soft">
            {order.items
              .map((item) => `${item.ticketType.name} × ${item.quantity}`)
              .join(" · ")}
          </p>
        </div>
        <strong className="text-xl text-blue-deep">
          {formatTicketPrice(order.total)}
        </strong>
      </div>

      {payoutFailed ? (
        <div className="mt-4 rounded-md border border-error/30 bg-error/5 p-4">
          <p className="m-0 text-sm font-bold text-error">
            Payout chưa thành công
          </p>
          <p className="mt-1 mb-0 text-sm text-ink-soft">
            {payoutFailureMessage}
          </p>
          {refundStatus ? (
            <p
              className="mt-3 mb-0 text-sm font-semibold text-info"
              role="status"
            >
              {refundStatus === "PENDING"
                ? "Yêu cầu hoàn tiền đang chờ Admin duyệt."
                : refundStatus === "PROCESSING"
                  ? "Yêu cầu hoàn tiền đang được Xendit xử lý."
                  : refundStatus === "SUCCEEDED"
                    ? "Xendit đã xác nhận hoàn tiền thành công."
                    : refundStatus === "REJECTED"
                      ? "Yêu cầu hoàn tiền đã bị từ chối."
                      : "Yêu cầu hoàn tiền chưa hoàn tất; Admin đang kiểm tra."}
            </p>
          ) : order.canRequestRefund ? (
            <div className="mt-3">
              {refundError ? (
                <p className="mb-2 text-sm text-error" role="alert">
                  {refundError}
                </p>
              ) : null}
              <button
                className="min-h-10 rounded-md bg-coral px-4 text-sm font-extrabold text-paper disabled:opacity-50"
                type="button"
                disabled={refundSubmitting}
                onClick={() => void submitRefundRequest()}
              >
                {refundSubmitting ? "Đang gửi…" : "Yêu cầu hoàn tiền"}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-sm text-ink-soft">
          {new Date(order.createdAt).toLocaleString("vi-VN")}
        </span>
        <a
          className="inline-flex min-h-11 items-center rounded-md border border-blue-deep/50 px-4 text-sm font-extrabold text-blue-deep no-underline hover:bg-blue hover:text-paper"
          href={href}
          onClick={open}
        >
          Xem chi tiết
        </a>
      </div>
    </article>
  );
}
