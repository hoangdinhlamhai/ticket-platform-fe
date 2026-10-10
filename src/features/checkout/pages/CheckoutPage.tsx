import { useEffect, useState } from "react";
import type {
  AttendeeOrderBuyer,
  PrimaryCheckoutSelection,
} from "../../orders";
import type { AttendeePath } from "../../../routes/attendee-route.ts";
import { createOrder } from "../../orders/api/orderApi";
import { getMe } from "../api/checkoutApi";
import { PrimaryBuyerForm } from "../components/InfomationBuyerForm";
import { PrimaryCheckoutSteps } from "../components/PrimaryCheckoutSteps";
import { PrimaryPurchaseSummary } from "../components/PrimaryPurchaseSummary";
import type { PrimaryCheckoutSubmission } from "../types/primary-checkout";

type Props = {
  selection: PrimaryCheckoutSelection | null;
  onComplete: (submission: PrimaryCheckoutSubmission) => void;
  onNavigate: (path: AttendeePath) => void;
};

export function PrimaryCheckoutPage({ selection, onNavigate }: Props) {
  const [buyer, setBuyer] = useState<AttendeeOrderBuyer>({
    fullName: "",
    email: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadBuyer = async () => {
      try {
        const { data } = await getMe();
        if (active)
          setBuyer({ fullName: data.user.fullName, email: data.user.email });
      } catch {
        // Giữ form sử dụng được nếu không tải được hồ sơ người dùng.
      }
    };
    void loadBuyer();
    return () => {
      active = false;
    };
  }, []);

  if (!selection)
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="font-body text-5xl font-extrabold">
          Chưa có lựa chọn vé.
        </h1>
        <p className="mt-4 text-ink-soft">
          Hãy quay lại sự kiện và chọn hạng vé trước khi thanh toán.
        </p>
        <button
          className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
          onClick={() => onNavigate("/")}
          type="button"
        >
          Khám phá sự kiện
        </button>
      </section>
    );

  const updateBuyer = (field: keyof AttendeeOrderBuyer, value: string) =>
    setBuyer((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (
      processing ||
      !acceptedTerms ||
      !buyer.fullName.trim() ||
      !buyer.email.trim()
    )
      return;
    setProcessing(true);
    setError("");
    try {
      const { data } = await createOrder({
        eventId: selection.eventId,
        ticketTypeId: selection.ticketTierId,
        quantity: selection.quantity,
        payerEmail: buyer.email.trim(),
      });
      window.location.assign(data.paymentLinkUrl);
    } catch {
      setError("Không thể tạo phiên thanh toán. Vui lòng thử lại.");
      setProcessing(false);
    }
  };

  return (
    <div className="py-[clamp(3rem,6vw,5.5rem)]">
      <div className="attendee-container">
        <PrimaryCheckoutSteps current="payment" />
        <div className="mt-9 grid grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block">
          <div className="space-y-7">
            <PrimaryBuyerForm buyer={buyer} onChange={updateBuyer} />
            <label className="flex min-h-12 gap-3 rounded-md border border-line bg-paper p-3 text-sm">
              <input
                className="mt-1 h-5 w-5 accent-blue"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
              />
              <span>
                Tôi đồng ý với điều khoản mua vé và tiếp tục thanh toán.
              </span>
            </label>
          </div>
          <div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-8">
            <PrimaryPurchaseSummary selection={selection} />
            <button
              className="mt-4 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper disabled:opacity-60"
              type="button"
              disabled={
                processing ||
                !acceptedTerms ||
                !buyer.fullName.trim() ||
                !buyer.email.trim()
              }
              onClick={() => void submit()}
            >
              {processing ? "Đang chuyển đến Xendit…" : "Tiếp tục thanh toán"}
            </button>
            {error && (
              <p
                className="mt-3 text-center text-sm font-bold text-error"
                role="alert"
              >
                {error}
              </p>
            )}
            <p
              className="mt-3 text-center text-xs text-ink-soft"
              aria-live="polite"
            >
              {processing
                ? "Đang tạo đơn hàng và phiên thanh toán."
                : "Bạn sẽ được chuyển đến trang thanh toán bảo mật của Xendit."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
