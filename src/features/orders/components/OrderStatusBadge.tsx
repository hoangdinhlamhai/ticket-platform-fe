const statusPresentation: Record<string, { label: string; style: string }> = {
  PAID: {
    label: "Đã thanh toán",
    style: "border-success/40 bg-mint text-success",
  },
  PAYOUT_PROCESSING: {
    label: "\u0110ang ch\u1edd payout",
    style: "border-blue/40 bg-google-hover text-blue-deep",
  },
  PAYOUT_FAILED: {
    label: "Payout c\u1ea7n x\u1eed l\u00fd",
    style: "border-error/35 bg-error-ring text-error",
  },
  PAYMENT_REVIEW: {
    label: "Giao d\u1ecbch c\u1ea7n h\u1ed7 tr\u1ee3",
    style: "border-coral-dark/35 bg-paper-deep text-coral-dark",
  },
  COMPLETED: {
    label: "\u0110\u00e3 chuy\u1ec3n v\u00e9",
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

export function OrderStatusBadge({
  status,
  source,
}: {
  status: string;
  source?: "PRIMARY" | "RESALE";
}) {
  const presentation =
    source === "RESALE" && status === "PAID"
      ? {
          label:
            "\u0110\u00e3 thanh to\u00e1n \u00b7 \u0111ang x\u1eed l\u00fd payout",
          style: "border-blue/40 bg-google-hover text-blue-deep",
        }
      : (statusPresentation[status] ?? {
          label: status,
          style: "border-line bg-paper-deep text-ink-soft",
        });

  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-1 text-[0.68rem] font-extrabold tracking-[0.05em] ${presentation.style}`}
    >
      {presentation.label}
    </span>
  );
}
