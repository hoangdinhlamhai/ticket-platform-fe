const statusPresentation: Record<string, { label: string; style: string }> = {
  PAID: {
    label: "Đã thanh toán",
    style: "border-success/40 bg-mint text-success",
  },
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    style: "border-blue/40 bg-google-hover text-blue-deep",
  },
  PAYMENT_FAILED: {
    label: "Thanh toán thất bại",
    style: "border-error/35 bg-error-ring text-error",
  },
  FAILED: {
    label: "Thanh toán thất bại",
    style: "border-error/35 bg-error-ring text-error",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    style: "border-coral-dark/35 bg-paper-deep text-coral-dark",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const presentation = statusPresentation[status] ?? {
    label: status,
    style: "border-line bg-paper-deep text-ink-soft",
  };

  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-1 text-[0.68rem] font-extrabold tracking-[0.05em] ${presentation.style}`}
    >
      {presentation.label}
    </span>
  );
}
