import type { OwnedTicket } from "../../tickets";

type Props = {
  ticket: OwnedTicket;
  price: string;
  accepted: boolean;
  isSubmitting?: boolean;
  error?: string;
  onPriceChange: (value: string) => void;
  onAcceptedChange: (value: boolean) => void;
  onSubmit: () => void;
};

export function ResaleListingForm({
  ticket,
  price,
  accepted,
  isSubmitting = false,
  error,
  onPriceChange,
  onAcceptedChange,
  onSubmit,
}: Props) {
  const amount = Number(price);
  const valid =
    Number.isSafeInteger(amount) &&
    amount > 0 &&
    amount <= ticket.originalPrice &&
    accepted &&
    !isSubmitting;

  return (
    <form
      className="rounded-lg border border-line bg-surface p-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) onSubmit();
      }}
    >
      <p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">
        ĐĂNG BÁN NGAY
      </p>
      <h2 className="mt-2 font-body text-4xl font-extrabold tracking-[-0.08em]">
        Đặt giá cho vé của bạn.
      </h2>
      <label className="mt-6 block text-sm font-bold">
        Giá bán trọn gói
        <input
          className="mt-2 min-h-12 w-full rounded-md border border-line bg-paper px-4 text-lg"
          inputMode="numeric"
          min="1"
          max={ticket.originalPrice}
          step="1"
          type="number"
          value={price}
          onChange={(event) => onPriceChange(event.target.value)}
        />
      </label>
      <p className="mt-2 text-sm text-ink-soft">
        Giá vé gốc: {ticket.originalPrice.toLocaleString("vi-VN")}₫ · Giá bán
        không vượt giá vé gốc.
      </p>
      <div className="mt-5 rounded-md bg-paper-deep p-4">
        <p className="m-0 text-sm text-ink-soft">Số tiền nhận dự kiến</p>
        <strong className="mt-1 block text-2xl text-blue-deep">
          {amount > 0 ? `${amount.toLocaleString("vi-VN")}₫` : "0₫"}
        </strong>
        <p className="mt-1 text-xs text-ink-soft">
          Không tính phí trên giao diện hiện tại.
        </p>
      </div>
      {error && (
        <p
          className="mt-4 rounded-md border border-coral/40 bg-paper-deep p-3 text-sm text-coral-dark"
          role="alert"
        >
          {error}
        </p>
      )}
      <label className="mt-5 flex min-h-12 gap-3 rounded-md border border-line p-3 text-sm">
        <input
          className="mt-1 h-5 w-5 accent-blue"
          type="checkbox"
          checked={accepted}
          onChange={(event) => onAcceptedChange(event.target.checked)}
        />
        <span>
          Tôi đồng ý với điều khoản đăng bán và xác nhận thông tin vé chính xác.
        </span>
      </label>
      <button
        className="mt-5 min-h-12 w-full rounded-md bg-coral px-5 font-extrabold text-paper disabled:opacity-40"
        type="submit"
        disabled={!valid}
      >
        {isSubmitting ? "Đang đăng bán…" : "Đăng bán vé"}
      </button>
      <p className="mt-3 text-xs text-ink-soft">
        Vé nguồn: {ticket.referenceCode}
      </p>
    </form>
  );
}
