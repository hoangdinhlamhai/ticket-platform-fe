import axios from "axios";
import { useEffect, useState } from "react";
import { findMine as findOrders } from "../../orders/api/orderApi";
import type { AttendeeOrderRecord } from "../../orders/types/order";
import { createRefundRequest, findMyRefundRequests } from "../api/refundApi";
import {
  RefundRequestForm,
  type RefundEligibleOrder,
} from "../components/RefundRequestForm";
import { RefundRequestList } from "../components/RefundRequestList";
import type { RefundRequest } from "../types/refund";

function getRequestErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (message) return message;
  }
  return "Chưa gửi được yêu cầu. Vui lòng thử lại.";
}

function getEligibleOrders(
  orders: readonly AttendeeOrderRecord[],
  requests: readonly RefundRequest[],
): RefundEligibleOrder[] {
  const existingRequestOrderIds = new Set(
    requests.map((request) => request.orderId),
  );

  return orders
    .filter(
      (order) =>
        order.status === "PAID" &&
        order.payment?.status === "PAID" &&
        order.payment.provider === "XENDIT" &&
        !existingRequestOrderIds.has(order.id),
    )
    .map((order) => ({
      id: order.id,
      eventTitle: order.event.title,
      amount: Number(order.total),
    }));
}

export function RefundHistoryPage() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [orders, setOrders] = useState<AttendeeOrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadError, setHasLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isActive = true;

    const loadRefundData = async () => {
      setIsLoading(true);
      setHasLoadError(false);

      try {
        const [refundResponse, orderResponse] = await Promise.all([
          findMyRefundRequests(),
          findOrders(),
        ]);
        if (!isActive) return;
        setRequests(refundResponse.data.refunds);
        setOrders(orderResponse.data.orders);
      } catch {
        if (isActive) setHasLoadError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadRefundData();
    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const eligibleOrders = getEligibleOrders(orders, requests);

  const handleCreateRequest = async (
    order: RefundEligibleOrder,
    reason: string,
  ) => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const { data } = await createRefundRequest(order.id, { reason });
      setRequests((current) => [data.refund, ...current]);
      setIsFormOpen(false);
      setNotice("Yêu cầu đã được gửi. Bạn có thể theo dõi tiến trình tại đây.");
    } catch (error) {
      setSubmitError(getRequestErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="overflow-hidden bg-pine py-[clamp(2.5rem,5vw,4.5rem)] text-paper">
        <div className="attendee-container grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end">
          <header>
            <p className="m-0 text-xs font-extrabold tracking-[0.13em] text-mint">
              HỖ TRỢ THANH TOÁN
            </p>
            <h1 className="mt-4 mb-0 max-w-4xl font-body text-[clamp(3.25rem,7vw,6.5rem)] leading-[0.84] font-extrabold tracking-[-0.1em]">
              Hoàn tiền, rõ từng bước.
            </h1>
            <p className="mt-6 mb-0 max-w-2xl text-base leading-7 text-paper/75">
              Gửi yêu cầu cho đơn đã thanh toán và theo dõi tiến trình xử lý
              ngay tại đây.
            </p>
          </header>

          <aside className="rounded-lg border border-paper/15 bg-paper/5 p-5 sm:p-6">
            <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-poster-yellow">
              QUY TRÌNH
            </p>
            <ol className="mt-4 mb-0 space-y-4 p-0">
              <li className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-sm font-extrabold text-pine">
                  1
                </span>
                <span className="pt-1 text-sm leading-6 text-paper/85">
                  Chọn đơn hàng và cho biết lý do.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper/15 text-sm font-extrabold text-paper">
                  2
                </span>
                <span className="pt-1 text-sm leading-6 text-paper/85">
                  Đội ngũ Ticketly xem xét yêu cầu.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-paper/15 text-sm font-extrabold text-paper">
                  3
                </span>
                <span className="pt-1 text-sm leading-6 text-paper/85">
                  Tiền được hoàn về phương thức thanh toán ban đầu.
                </span>
              </li>
            </ol>
          </aside>
        </div>
      </section>

      <section className="bg-paper-deep py-8 sm:py-10">
        <div className="attendee-container grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,22rem)] lg:gap-10">
          <div className="order-2 min-w-0 lg:order-1">
            {notice ? (
              <p
                className="mb-5 rounded-md border border-success/30 bg-mint px-4 py-3 text-sm font-semibold text-success"
                role="status"
              >
                {notice}
              </p>
            ) : null}

            {isLoading ? (
              <p className="rounded-lg border border-line bg-surface p-8 text-center text-ink-soft">
                Đang tải yêu cầu hoàn tiền…
              </p>
            ) : hasLoadError ? (
              <div className="rounded-lg border border-line bg-surface p-8 text-center">
                <p className="m-0 text-ink-soft">
                  Không tải được yêu cầu hoàn tiền.
                </p>
                <button
                  className="mt-3 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
                  type="button"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <RefundRequestList requests={requests} />
            )}
          </div>

          <aside className="order-1 lg:sticky lg:top-6 lg:order-2">
            {isFormOpen ? (
              <RefundRequestForm
                orders={eligibleOrders}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onCancel={() => {
                  setIsFormOpen(false);
                  setSubmitError("");
                }}
                onSubmit={handleCreateRequest}
              />
            ) : (
              <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
                <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
                  CẦN BẮT ĐẦU?
                </p>
                <h2 className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em] text-pine">
                  Tạo yêu cầu mới
                </h2>
                <p className="mt-3 mb-0 text-sm leading-6 text-ink-soft">
                  Chọn một đơn đã thanh toán. Yêu cầu áp dụng cho toàn bộ đơn
                  hàng.
                </p>
                <button
                  className="mt-5 min-h-12 w-full rounded-md bg-coral px-5 text-sm font-extrabold text-paper transition-colors hover:bg-coral-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-dark"
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setSubmitError("");
                    setIsFormOpen(true);
                  }}
                  disabled={isLoading || hasLoadError || !eligibleOrders.length}
                >
                  Tạo yêu cầu hoàn tiền
                </button>
                {!isLoading && !hasLoadError && !eligibleOrders.length ? (
                  <p className="mt-3 mb-0 text-sm leading-6 text-ink-soft">
                    Hiện không có đơn Xendit đã thanh toán nào đủ điều kiện gửi
                    yêu cầu mới.
                  </p>
                ) : null}
                <div className="mt-5 border-t border-line pt-4">
                  <p className="m-0 text-sm font-extrabold text-ink">
                    Tiền sẽ về đâu?
                  </p>
                  <p className="mt-1 mb-0 text-sm leading-6 text-ink-soft">
                    Xendit hoàn tiền về đúng phương thức đã dùng khi thanh toán.
                    Thời gian hiển thị tùy thuộc vào ngân hàng hoặc ví.
                  </p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}
