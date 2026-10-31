import { useState, type FormEvent } from "react";

export type RefundEligibleOrder = {
  id: string;
  eventTitle: string;
  amount: number;
};

type Props = {
  orders: readonly RefundEligibleOrder[];
  isSubmitting: boolean;
  submitError: string;
  onCancel: () => void;
  onSubmit: (order: RefundEligibleOrder, reason: string) => Promise<void>;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function RefundRequestForm({
  orders,
  isSubmitting,
  submitError,
  onCancel,
  onSubmit,
}: Props) {
  const [orderId, setOrderId] = useState(orders[0]?.id ?? "");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const selectedOrder = orders.find((order) => order.id === orderId);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedOrder) {
      setError("Hiện chưa có đơn hàng phù hợp để gửi yêu cầu.");
      return;
    }
    if (!reason.trim()) {
      setError("Hãy cho chúng tôi biết lý do bạn cần hoàn tiền.");
      return;
    }
    setError("");
    void onSubmit(selectedOrder, reason.trim());
  };

  return (
    <form
      className="rounded-lg border border-pine/20 bg-surface p-5 sm:p-6"
      onSubmit={handleSubmit}
      aria-labelledby="refund-form-title"
      noValidate
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
            GỬI YÊU CẦU
          </p>
          <h2
            id="refund-form-title"
            className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em] text-pine"
          >
            Bạn cần hỗ trợ?
          </h2>
        </div>
        <button
          className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line text-xl font-bold text-ink-soft hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
          type="button"
          aria-label="Đóng biểu mẫu"
          onClick={onCancel}
        >
          ×
        </button>
      </div>

      {orders.length ? (
        <>
          <label
            className="mt-5 block text-sm font-bold text-ink"
            htmlFor="refund-order"
          >
            Đơn hàng cần hoàn tiền
          </label>
          <select
            id="refund-order"
            className="mt-2 min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
            value={orderId}
            disabled={isSubmitting}
            onChange={(event) => setOrderId(event.target.value)}
          >
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.eventTitle} · {order.id}
              </option>
            ))}
          </select>

          <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-paper-deep px-4 py-3">
            <span className="text-sm text-ink-soft">Số tiền yêu cầu</span>
            <strong className="text-sm text-blue-deep">
              {selectedOrder ? formatMoney(selectedOrder.amount) : "—"}
            </strong>
          </div>

          <label
            className="mt-5 block text-sm font-bold text-ink"
            htmlFor="refund-reason"
          >
            Lý do hoàn tiền
          </label>
          <textarea
            id="refund-reason"
            className="mt-2 min-h-28 w-full resize-y rounded-md border border-line bg-paper px-3 py-3 text-base leading-6 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
            maxLength={1000}
            placeholder="Mô tả ngắn gọn vấn đề bạn gặp phải"
            value={reason}
            aria-invalid={Boolean(error || submitError)}
            aria-describedby={
              error || submitError ? "refund-form-error" : "refund-form-hint"
            }
            disabled={isSubmitting}
            onChange={(event) => setReason(event.target.value)}
          />
          {error || submitError ? (
            <p
              id="refund-form-error"
              className="mt-2 mb-0 text-sm font-semibold text-error"
              role="alert"
            >
              {error || submitError}
            </p>
          ) : (
            <p
              id="refund-form-hint"
              className="mt-2 mb-0 text-xs leading-5 text-ink-soft"
            >
              Trong phiên bản này, yêu cầu áp dụng cho toàn bộ số tiền của đơn
              hàng.
            </p>
          )}

          <button
            className="mt-5 min-h-12 w-full rounded-md bg-coral px-5 text-sm font-extrabold text-paper transition-colors hover:bg-coral-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral-dark"
            type="submit"
            disabled={isSubmitting || !orders.length}
          >
            {isSubmitting ? "Đang gửi yêu cầu…" : "Gửi yêu cầu hoàn tiền"}
          </button>
        </>
      ) : (
        <div className="mt-5 rounded-md border border-dashed border-line bg-paper-deep p-4">
          <p className="m-0 text-sm leading-6 text-ink-soft">
            Chưa có đơn hàng đã thanh toán phù hợp để tạo yêu cầu.
          </p>
        </div>
      )}
    </form>
  );
}
