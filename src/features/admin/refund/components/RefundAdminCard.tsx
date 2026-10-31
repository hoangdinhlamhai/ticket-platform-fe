import type { AdminRefund } from "../types/admin-refund.ts";

type Props = {
  refund: AdminRefund;
  onOpen: (id: string) => void;
};

const statusPresentation: Record<
  AdminRefund["status"],
  { label: string; className: string }
> = {
  PENDING: {
    label: "Chờ duyệt",
    className: "border-blue/40 bg-google-hover text-blue-deep",
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "border-coral-dark/40 bg-coral/20 text-coral-dark",
  },
  SUCCEEDED: {
    label: "Đã hoàn tiền",
    className: "border-success/40 bg-mint text-success",
  },
  FAILED: {
    label: "Thất bại · cần xử lý",
    className: "border-error/35 bg-error-ring text-error",
  },
  REJECTED: {
    label: "Đã từ chối",
    className: "border-line bg-paper-deep text-ink-soft",
  },
};

function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RefundAdminCard({ refund, onOpen }: Props) {
  const status = statusPresentation[refund.status];

  return (
    <article className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex min-h-8 items-center rounded-sm border px-2.5 text-xs font-extrabold ${status.className}`}
          >
            {status.label}
          </span>
          <h2 className="mt-3 mb-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-pine">
            {refund.order.event.title}
          </h2>
          <p className="mt-2 mb-0 break-all text-sm text-ink-soft">
            Refund {refund.id} <span aria-hidden="true">·</span> Order{" "}
            {refund.orderId}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <p className="m-0 text-xs font-bold tracking-[0.06em] text-ink-soft">
            SỐ TIỀN
          </p>
          <p className="mt-1 mb-0 text-xl font-extrabold text-blue-deep">
            {formatMoney(refund.amount)}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 sm:grid-cols-2">
        <p className="m-0 text-sm leading-6">
          <span className="text-ink-soft">Khách hàng: </span>
          <strong>{refund.order.user.fullName}</strong>
          <span className="block break-all text-xs text-ink-soft">
            {refund.order.user.email}
          </span>
        </p>
        <p className="m-0 text-sm leading-6">
          <span className="text-ink-soft">Gửi lúc: </span>
          <strong>{formatDate(refund.createdAt)}</strong>
        </p>
        <p className="m-0 text-sm leading-6 text-ink-soft sm:col-span-2">
          <span className="font-bold text-ink">Lý do: </span>
          {refund.reason}
        </p>
      </div>

      <div className="mt-4 flex justify-end border-t border-line pt-4">
        <button
          className="min-h-11 rounded-md border border-blue-deep/40 px-4 text-sm font-extrabold text-blue-deep hover:bg-google-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
          type="button"
          onClick={() => onOpen(refund.id)}
        >
          Xem chi tiết và xử lý
        </button>
      </div>
    </article>
  );
}
