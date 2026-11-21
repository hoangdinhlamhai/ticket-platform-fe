const orderFormat = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")} ₫`;

export { orderFormat as orderMoney };

export const orderDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Chưa có dữ liệu";

export const orderStatus: Record<
  string,
  { label: string; style: string; icon: string }
> = {
  PAID: { label: "Đã thanh toán", style: "bg-success/10 text-success", icon: "✓" },
  COMPLETED: { label: "Hoàn tất", style: "bg-success/10 text-success", icon: "✓" },
  PENDING_PAYMENT: { label: "Chờ thanh toán", style: "bg-warning/15 text-warning", icon: "◷" },
  CANCELLED: { label: "Đã hủy", style: "bg-error/10 text-error", icon: "×" },
  EXPIRED: { label: "Hết hạn", style: "bg-paper-deep text-ink-soft", icon: "◷" },
  FAILED: { label: "Thất bại", style: "bg-error/10 text-error", icon: "!" },
  REFUNDED: { label: "Đã hoàn tiền", style: "bg-info/10 text-info", icon: "↶" },
};
