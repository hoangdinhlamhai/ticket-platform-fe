import type { RefundRequestStatus } from "../types/refund";

export const refundStatusPresentation: Record<
  RefundRequestStatus,
  { label: string; className: string; description: string }
> = {
  PENDING: {
    label: "Chờ xét duyệt",
    className: "border-blue/40 bg-google-hover text-blue-deep",
    description: "Yêu cầu đã được ghi nhận và đang chờ đội ngũ hỗ trợ xem xét.",
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "border-coral-dark/40 bg-coral/20 text-coral-dark",
    description:
      "Xendit đang xử lý khoản tiền hoàn về phương thức thanh toán gốc.",
  },
  SUCCEEDED: {
    label: "Đã hoàn tiền",
    className: "border-success/40 bg-mint text-success",
    description:
      "Yêu cầu hoàn tiền đã thành công. Thời gian tiền về tùy ngân hàng hoặc ví.",
  },
  FAILED: {
    label: "Cần được hỗ trợ thêm",
    className: "border-error/35 bg-error-ring text-error",
    description: "Yêu cầu chưa hoàn tất. Hãy liên hệ hỗ trợ để được kiểm tra.",
  },
  REJECTED: {
    label: "Không được chấp thuận",
    className: "border-line bg-paper-deep text-ink-soft",
    description: "Yêu cầu không đáp ứng điều kiện hoàn tiền của đơn hàng.",
  },
};
