import type { AdminRefundStatus } from "../types/admin-refund.ts";

export const refundStatusPresentation: Record<
  AdminRefundStatus,
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
