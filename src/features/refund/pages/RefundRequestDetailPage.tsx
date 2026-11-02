import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { findMyRefundRequestById } from "../api/refundApi";
import { refundStatusPresentation } from "../helpers/refund-status";
import type { RefundRequest } from "../types/refund";

type Props = {
  refundId: string;
  onNavigate: (path: AttendeePath) => void;
};

function formatMoney(value: number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDate(value: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RefundRequestDetailPage({ refundId, onNavigate }: Props) {
  const [refund, setRefund] = useState<RefundRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadRefund = async () => {
      setIsLoading(true);
      setHasError(false);
      setRefund(null);
      try {
        const { data } = await findMyRefundRequestById(refundId);
        if (active) setRefund(data.refund);
      } catch {
        if (active) setHasError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadRefund();
    return () => {
      active = false;
    };
  }, [refundId, reloadKey]);

  if (isLoading) {
    return (
      <section
        className="attendee-container py-20 text-center text-ink-soft"
        role="status"
      >
        Đang tải chi tiết yêu cầu hoàn tiền…
      </section>
    );
  }

  if (hasError || !refund) {
    return (
      <section className="attendee-container py-20 text-center">
        <h1 className="font-body text-3xl font-extrabold text-pine">
          {hasError
            ? "Không tải được yêu cầu hoàn tiền."
            : "Không tìm thấy yêu cầu hoàn tiền."}
        </h1>
        {hasError ? (
          <button
            className="mt-3 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper"
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
          >
            Thử lại
          </button>
        ) : null}
        <button
          className="mt-3 min-h-11 rounded-md border border-blue-deep/50 px-4 font-extrabold text-blue-deep"
          type="button"
          onClick={() => onNavigate("/refunds")}
        >
          Quay lại yêu cầu hoàn tiền
        </button>
      </section>
    );
  }

  const status = refundStatusPresentation[refund.status];

  return (
    <section className="attendee-container py-8 sm:py-10">
      <button
        className="min-h-11 font-bold text-blue-deep underline underline-offset-4"
        type="button"
        onClick={() => onNavigate("/refunds")}
      >
        ← Tất cả yêu cầu hoàn tiền
      </button>

      <article className="mt-5 rounded-lg border border-line bg-surface p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-5">
          <div>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-coral-dark">
              Chi tiết yêu cầu hoàn tiền
            </p>
            <h1 className="mt-2 mb-0 break-all font-body text-2xl font-extrabold tracking-[-0.05em] text-pine sm:text-3xl">
              {refund.id}
            </h1>
          </div>
          <span
            className={`inline-flex min-h-9 items-center rounded-sm border px-3 text-sm font-extrabold ${status.className}`}
          >
            {status.label}
          </span>
        </header>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <h2 className="m-0 text-sm font-extrabold text-ink">
              Sự kiện và đơn hàng
            </h2>
            <p className="mt-2 mb-0 text-lg font-bold text-pine">
              {refund.order.event.title}
            </p>
            <p className="mt-1 mb-0 break-all text-sm text-ink-soft">
              Mã đơn: {refund.orderId}
            </p>
            <p className="mt-1 mb-0 text-sm text-ink-soft">
              Trạng thái đơn: {refund.order.status}
            </p>
            <button
              className="mt-4 min-h-11 rounded-md bg-pine px-4 text-sm font-extrabold text-paper hover:bg-pine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              type="button"
              onClick={() =>
                onNavigate(`/orders/${encodeURIComponent(refund.orderId)}`)
              }
            >
              Xem đơn hàng
            </button>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm text-ink-soft">Số tiền yêu cầu</dt>
              <dd className="m-0 mt-1 text-xl font-extrabold text-blue-deep">
                {formatMoney(refund.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Thời gian gửi</dt>
              <dd className="m-0 mt-1 font-semibold text-ink">
                {formatDate(refund.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Thời gian quyết định</dt>
              <dd className="m-0 mt-1 font-semibold text-ink">
                {formatDate(refund.decidedAt)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-md bg-paper-deep p-4">
          <h2 className="m-0 text-sm font-extrabold">Lý do bạn yêu cầu</h2>
          <p className="mt-2 mb-0 whitespace-pre-wrap text-sm leading-6 text-ink">
            {refund.reason}
          </p>
        </div>

        <p className="mt-4 mb-0 text-sm leading-6 text-ink-soft">
          {status.description}
        </p>

        {refund.failureReason || refund.decisionReason ? (
          <div className="mt-4 rounded-md border border-line p-4">
            <h2 className="m-0 text-sm font-extrabold">Thông tin xử lý</h2>
            <p className="mt-2 mb-0 whitespace-pre-wrap text-sm leading-6 text-ink-soft">
              {refund.failureReason ?? refund.decisionReason}
            </p>
          </div>
        ) : null}
      </article>
    </section>
  );
}
