import { forwardRef } from "react";
import { formatResalePrice } from "../helpers/format-resale-price";

type ResaleVietQrPanelProps = {
  acceptedTerms: boolean;
  amount: number;
  error?: string;
  onAcceptedTermsChange: (accepted: boolean) => void;
};

export const ResaleVietQrPanel = forwardRef<
  HTMLInputElement,
  ResaleVietQrPanelProps
>(function ResaleVietQrPanel(
  { acceptedTerms, amount, error, onAcceptedTermsChange },
  ref,
) {
  return (
    <section
      className="rounded-lg border border-line bg-paper-deep p-5"
      aria-labelledby="resale-payment-title"
    >
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
        THANH TOÁN AN TOÀN
      </p>
      <h2
        id="resale-payment-title"
        className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.06em]"
      >
        Thanh toán qua Xendit
      </h2>
      <div className="mt-5 rounded-md border border-line bg-surface p-4">
        <p className="m-0 text-sm text-ink-soft">
          Bạn sẽ được chuyển đến trang thanh toán do Xendit lưu trữ. Ticketly
          chỉ xác nhận giao dịch và chuyển vé sau khi nhận thông báo thanh toán
          thành công.
        </p>
        <p className="mt-4 mb-0 flex justify-between gap-4 border-t border-line pt-4 text-sm">
          <span className="text-ink-soft">Số tiền cần thanh toán</span>
          <strong className="text-lg tabular-nums text-blue-deep">
            {formatResalePrice(amount)}
          </strong>
        </p>
      </div>
      <label
        className={`mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-surface p-3 text-sm leading-[1.5] ${error ? "border-error ring-3 ring-error-ring" : "border-line"}`}
      >
        <input
          ref={ref}
          className="mt-1 h-5 w-5 shrink-0 accent-blue"
          type="checkbox"
          checked={acceptedTerms}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "acceptedTerms-error" : undefined}
          onChange={(event) => onAcceptedTermsChange(event.target.checked)}
        />
        <span>
          Tôi đồng ý với điều khoản mua vé resale và xác nhận thông tin listing
          trước khi thanh toán.
        </span>
      </label>
      {error ? (
        <p
          id="acceptedTerms-error"
          className="mt-2 mb-0 text-sm font-bold text-error"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </section>
  );
});
