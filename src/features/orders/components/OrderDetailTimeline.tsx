type Props = {
  orderStatus: string;
  ticketCount: number;
};

export function OrderDetailTimeline({ orderStatus, ticketCount }: Props) {
  const isPaid = orderStatus === "PAID";
  const isFailed = orderStatus === "FAILED" || orderStatus === "PAYMENT_FAILED";
  const isExpired = orderStatus === "EXPIRED";
  const paymentStep = isPaid
    ? "Đã thanh toán"
    : isFailed
      ? "Thanh toán thất bại"
      : isExpired
        ? "Phiên thanh toán hết hạn"
        : "Đang chờ thanh toán";
  const ticketStep = ticketCount
    ? `Đã phát hành ${ticketCount} vé`
    : "Chưa phát hành vé";
  const steps = ["Đơn hàng đã được tạo", paymentStep, ticketStep];

  return (
    <section className="mt-7 rounded-lg bg-paper-deep p-5">
      <h2 className="m-0 text-xl font-extrabold">Tiến trình đơn hàng</h2>
      <ol className="mt-4 grid grid-cols-3 gap-3 p-0 mobile:grid-cols-1">
        {steps.map((step, index) => (
          <li
            key={step}
            className="border-l-4 border-blue pl-3 text-sm font-bold"
          >
            <span className="block text-xs text-blue-deep">0{index + 1}</span>
            {step}
          </li>
        ))}
      </ol>
    </section>
  );
}
