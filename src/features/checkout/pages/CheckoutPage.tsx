import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route.ts";
import type {
  AttendeeOrderBuyer,
  DemoPaymentOutcome,
  PrimaryCheckoutSelection,
} from "../../orders";
import { getMe } from "../api/checkoutApi";
import { DemoPaymentOutcomeSelector } from "../components/DemoPaymentOutcomeSelector";
import { PrimaryBuyerForm } from "../components/InfomationBuyerForm";
import { PrimaryCheckoutSteps } from "../components/PrimaryCheckoutSteps";
import { PrimaryPurchaseSummary } from "../components/PrimaryPurchaseSummary";
import { PrimaryVietQrPanel } from "../components/PrimaryVietQrPanel";
import type { PrimaryCheckoutSubmission } from "../types/primary-checkout";

type Props = {
  selection: PrimaryCheckoutSelection | null;
  onComplete: (submission: PrimaryCheckoutSubmission) => void;
  onNavigate: (path: AttendeePath) => void;
};

export function PrimaryCheckoutPage({
  selection,
  onComplete,
  onNavigate,
}: Props) {
  const [buyer, setBuyer] = useState<AttendeeOrderBuyer>({
    fullName: "",
    email: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [outcome, setOutcome] = useState<DemoPaymentOutcome>("completed");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    let active = true;
    const loadBuyer = async () => {
      try {
        const { user } = await getMe();
        if (active) {
          setBuyer({
            fullName: user.fullName,
            email: user.email,
          });
        }
      } catch {
        // Keep the checkout form usable when the profile request fails.
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
          Hãy quay lại sự kiện và chọn hạng vé trước khi checkout.
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
  const submit = () => {
    if (
      processing ||
      !acceptedTerms ||
      !buyer.fullName.trim() ||
      !buyer.email.trim()
    )
      return;
    setProcessing(true);
    window.setTimeout(
      () =>
        onComplete({
          selection,
          buyer: {
            fullName: buyer.fullName.trim(),
            email: buyer.email.trim(),
          },
          outcome,
          transferContent: `TICKETLY ${selection.eventId
            .replace(/[^a-z0-9]/gi, "")
            .slice(-10)
            .toUpperCase()}`,
        }),
      500,
    );
  };

  return (
    <div className="py-[clamp(3rem,6vw,5.5rem)]">
      <div className="attendee-container">
        <PrimaryCheckoutSteps current="payment" />
        <div className="mt-9 grid grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block">
          <div className="space-y-7">
            <PrimaryBuyerForm buyer={buyer} onChange={updateBuyer} />
            <PrimaryVietQrPanel
              acceptedTerms={acceptedTerms}
              amount={selection.unitPrice * selection.quantity}
              transferContent={`TICKETLY ${selection.eventId.toUpperCase().slice(-10)}`}
              onAcceptedTermsChange={setAcceptedTerms}
            />
            <DemoPaymentOutcomeSelector value={outcome} onChange={setOutcome} />
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
              onClick={submit}
            >
              {processing
                ? "Đang tạo kết quả demo…"
                : "Xác nhận thanh toán demo"}
            </button>
            <p
              className="mt-3 text-center text-xs text-ink-soft"
              aria-live="polite"
            >
              {processing
                ? "Đang tạo order trong bộ nhớ phiên."
                : "Không có tiền hoặc giữ chỗ thật."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
