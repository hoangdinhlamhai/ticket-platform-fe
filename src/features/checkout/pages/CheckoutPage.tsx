import { useEffect, useState } from "react";
import type {
  AttendeeOrderBuyer,
  PrimaryCheckoutSelection,
} from "../../orders";
import type { AttendeePath } from "../../../routes/attendee-route.ts";
import { createOrder, findMineById } from "../../orders/api/orderApi";
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
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

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

  useEffect(() => {
    if (!createdOrderId || !selection) return;

    let isActive = true;
    let timeoutId: number;

    const checkOrderStatus = async () => {
      try {
        const { data } = await findMineById(createdOrderId);
        if (!isActive) return;

        if (
          data.order.status === "PAID" ||
          data.order.status === "FAILED" ||
          data.order.status === "PAYMENT_FAILED" ||
          data.order.status === "EXPIRED"
        ) {
          onNavigate(
            `/events/${selection.eventId}/checkout/result?orderId=${encodeURIComponent(createdOrderId)}`,
          );
          return;
        }
      } catch {
        // Keep checking while the payment provider is processing the payment.
      }

      if (isActive) timeoutId = window.setTimeout(checkOrderStatus, 2500);
    };

    timeoutId = window.setTimeout(checkOrderStatus, 2500);
    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [createdOrderId, onNavigate, selection]);

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

    const paymentTab = window.open("about:blank", "_blank");
    if (paymentTab) paymentTab.opener = null;

    setProcessing(true);
    setError("");
    setPaymentLinkUrl("");
    setCreatedOrderId(null);
    try {
      const { data } = await createOrder({
        eventId: selection.eventId,
        ticketTypeId: selection.ticketTierId,
        quantity: selection.quantity,
        payerEmail: buyer.email.trim(),
      });
      setCreatedOrderId(data.orderId);
      setPaymentLinkUrl(data.paymentLinkUrl);
      if (paymentTab && !paymentTab.closed) {
        try {
          paymentTab.location.href = data.paymentLinkUrl;
        } catch {
          paymentTab.close();
        }
      }
    } catch {
      paymentTab?.close();
      setError("Không thể tạo phiên thanh toán. Vui lòng thử lại.");
    } finally {
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
              {processing
                ? "Đang tạo phiên thanh toán…"
                : "Tiếp tục thanh toán"}
            </button>
            {paymentLinkUrl && (
              <a
                className="mt-3 block text-center text-sm font-extrabold text-blue-deep underline"
                href={paymentLinkUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mở lại trang thanh toán Xendit
              </a>
            )}
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
                ? "Đang tạo đơn hàng. Trang thanh toán sẽ mở trong tab mới."
                : createdOrderId
                  ? "Đang chờ Xendit xác nhận thanh toán. Trang sẽ tự chuyển khi nhận được kết quả."
                  : "Trang thanh toán Xendit sẽ mở ở tab mới, bạn có thể quay lại trang này sau khi thanh toán."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
