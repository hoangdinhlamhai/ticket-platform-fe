import { refundStatusPresentation } from "../helpers/refund-status";
import type { RefundRequest } from "../types/refund";
import type { AttendeePath } from "../../../routes/attendee-route";

type Props = {
  request: RefundRequest;
  onNavigate: (path: AttendeePath) => void;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatMoney(value: number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

export function RefundRequestCard({ request, onNavigate }: Props) {
  const status = refundStatusPresentation[request.status];

  return (
    <article className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex min-h-8 items-center rounded-sm border px-2.5 text-xs font-extrabold ${status.className}`}
          >
            {status.label}
          </span>
          <h3 className="mt-3 mb-0 font-body text-2xl font-extrabold tracking-[-0.055em] text-pine sm:text-3xl">
            {request.order.event.title}
          </h3>
          <p className="mt-2 mb-0 text-sm text-ink-soft">
            Đơn hàng{" "}
            <span className="font-bold text-ink">{request.orderId}</span>
          </p>
        </div>
        <div className="min-w-32 text-left sm:text-right">
          <p className="m-0 text-xs font-bold tracking-[0.06em] text-ink-soft">
            SỐ TIỀN YÊU CẦU
          </p>
          <p className="mt-1 mb-0 text-xl font-extrabold text-blue-deep sm:text-2xl">
            {formatMoney(request.amount)}
          </p>
        </div>
      </div>

      <p className="mt-4 mb-0 max-w-3xl text-sm leading-6 text-ink-soft">
        {status.description}
      </p>

      <dl className="mt-5 grid gap-x-8 gap-y-4 border-t border-line pt-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <dt className="text-xs font-bold uppercase tracking-[0.06em] text-ink-soft">
            Lý do
          </dt>
          <dd className="mt-1 mb-0 text-sm font-semibold text-ink">
            {request.reason}
          </dd>
        </div>
        <div className="sm:text-right">
          <dt className="text-xs font-bold uppercase tracking-[0.06em] text-ink-soft">
            Gửi lúc
          </dt>
          <dd className="mt-1 mb-0 text-sm font-semibold text-ink">
            {formatDate(request.createdAt)}
          </dd>
        </div>
      </dl>

      {request.decisionReason || request.failureReason ? (
        <div
          className="mt-4 rounded-md border border-line bg-paper-deep p-4"
          aria-label="Thông tin xử lý"
        >
          <p className="m-0 text-xs font-extrabold uppercase tracking-[0.06em] text-ink-soft">
            Ghi chú xử lý
          </p>
          <p className="mt-1 mb-0 text-sm leading-6 text-ink">
            {request.failureReason ?? request.decisionReason}
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex justify-end border-t border-line pt-4">
        <button
          className="min-h-11 rounded-md border border-blue-deep/50 px-4 text-sm font-extrabold text-blue-deep hover:bg-google-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
          type="button"
          onClick={() => onNavigate(`/refunds/${request.id}`)}
        >
          Xem chi tiết yêu cầu
        </button>
      </div>
    </article>
  );
}
