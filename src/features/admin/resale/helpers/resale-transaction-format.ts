import { resalePayoutFailureReasons } from "../../../resale/helpers/resale-payout-domain.ts";

export const statuses = [
  "PENDING_PAYMENT",
  "PAID",
  "COMPLETED",
  "EXPIRED",
  "PAYMENT_FAILED",
];
export const statusText: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  COMPLETED: "Hoàn tất",
  EXPIRED: "Hết hạn",
  PAYMENT_FAILED: "Thanh toán thất bại",
};
export const statusStyle: Record<string, string> = {
  COMPLETED: "bg-success/10 text-success",
  PAYMENT_FAILED: "bg-error/10 text-error",
  EXPIRED: "bg-surface text-ink-soft",
  PENDING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-info/10 text-info",
};
export const money = (value: unknown) =>
  `${Number(value ?? 0).toLocaleString("vi-VN")} ₫`;
export const date = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(String(value)))
    : "—";

export const paymentLabels: Record<string, string> = {
  id: "Mã thanh toán",
  status: "Trạng thái",
  amount: "Số tiền",
  currency: "Loại tiền",
  sessionId: "Mã phiên thanh toán",
  providerPaymentId: "Mã thanh toán từ nhà cung cấp",
  paymentRequestId: "Mã yêu cầu thanh toán",
  expiresAt: "Hết hạn lúc",
  paidAt: "Thanh toán lúc",
  createdAt: "Tạo lúc",
  updatedAt: "Cập nhật lúc",
};
export const payoutLabels: Record<string, string> = {
  id: "Mã chi trả",
  status: "Trạng thái",
  amount: "Số tiền",
  currency: "Loại tiền",
  providerPayoutId: "Mã chi trả từ nhà cung cấp",
  referenceId: "Mã tham chiếu",
  bankAccountId: "Mã tài khoản ngân hàng",
  failureCode: "Mã lỗi payout",
  paidAt: "Chi trả lúc",
  createdAt: "Tạo lúc",
  updatedAt: "Cập nhật lúc",
};
export const renderPaymentValue = (key: string, value: unknown) =>
  key.endsWith("At") ? date(value) : value;
export const renderPayoutValue = (key: string, value: unknown) => {
  if (key.endsWith("At")) return date(value);
  if (key === "failureReason" && typeof value === "string") {
    const reasonCode = value.trim().toUpperCase();
    return resalePayoutFailureReasons[reasonCode] ?? value;
  }
  return value;
};
