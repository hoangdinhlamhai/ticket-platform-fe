import { useCallback, useEffect, useRef, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import type { CustomerProfile } from "../../profile";
import {
  createResaleCheckoutRequest,
  findResaleTransaction,
} from "../api/resaleApi";
import { getResaleListingById } from "../helpers/get-resale-listing-by-id";
import { useResaleCheckout } from "../hooks/use-resale-checkout";
import type {
  ResaleBuyer,
  ResaleCheckoutField,
  ResaleListing,
} from "../types/resale";
import { ResaleBuyerForm } from "../components/ResaleBuyerForm";
import { ResaleCheckoutSteps } from "../components/ResaleCheckoutSteps";
import { ResalePurchaseSummary } from "../components/ResalePurchaseSummary";
import { ResaleVietQrPanel } from "../components/ResaleVietQrPanel";

type ResaleCheckoutPageProps = {
  listingId: string;
  listings: readonly ResaleListing[];
  onNavigate: (path: AttendeePath) => void;
  profile: CustomerProfile;
};

type CheckoutContentProps = {
  initialBuyer: ResaleBuyer;
  listing: ResaleListing;
  onNavigate: (path: AttendeePath) => void;
};

function ResaleCheckoutContent({
  initialBuyer,
  listing,
  onNavigate,
}: CheckoutContentProps) {
  const [paymentLinkUrl, setPaymentLinkUrl] = useState("");
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState("PENDING_PAYMENT");
  const buyerRefs = useRef<(HTMLInputElement | null)[]>([]);
  const termsRef = useRef<HTMLInputElement>(null);

  const onCheckout = useCallback(
    async (buyer: ResaleBuyer) => {
      const paymentTab = window.open("about:blank", "_blank");
      if (paymentTab) paymentTab.opener = null;
      try {
        const { data } = await createResaleCheckoutRequest(
          listing.id,
          buyer.email,
        );
        setTransactionId(data.transactionId);
        setPaymentLinkUrl(data.paymentLinkUrl);
        if (paymentTab && !paymentTab.closed) {
          paymentTab.location.href = data.paymentLinkUrl;
        }
      } catch (error) {
        paymentTab?.close();
        throw error;
      }
    },
    [listing.id],
  );
  const checkout = useResaleCheckout({
    initialBuyer,
    listing,
    onCheckout,
  });

  useEffect(() => {
    if (!transactionId) return;
    let active = true;
    let timeoutId: number;
    const checkPaymentStatus = async () => {
      try {
        const { data } = await findResaleTransaction(transactionId);
        if (!active) return;
        const nextStatus = data.transaction.status;
        setPaymentStatus(nextStatus);
        if (nextStatus !== "PENDING_PAYMENT") {
          onNavigate(
            `/resale/${listing.id}/result?transactionId=${encodeURIComponent(transactionId)}`,
          );
          return;
        }
      } catch {
        // Continue polling while Xendit confirms the payment session.
      }
      if (active) timeoutId = window.setTimeout(checkPaymentStatus, 2500);
    };
    timeoutId = window.setTimeout(checkPaymentStatus, 2500);
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [listing.id, onNavigate, transactionId]);

  const focusField = (field: ResaleCheckoutField) => {
    const index = { fullName: 0, email: 1, phone: 2 }[
      field as keyof ResaleBuyer
    ];
    if (typeof index === "number") buyerRefs.current[index]?.focus();
    else termsRef.current?.focus();
  };
  const submit = async () => {
    const firstInvalidField = await checkout.submit();
    if (firstInvalidField) {
      window.requestAnimationFrame(() => focusField(firstInvalidField));
    }
  };

  return (
    <div className="py-[clamp(3rem,6vw,5.5rem)]">
      <div className="attendee-container">
        <ResaleCheckoutSteps current="payment" />
        <div className="mt-10 grid grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block">
          <div className="space-y-8">
            <ResaleBuyerForm
              ref={buyerRefs}
              buyer={checkout.draft}
              errors={checkout.errors}
              onChange={checkout.updateBuyerField}
            />
            <ResaleVietQrPanel
              ref={termsRef}
              acceptedTerms={checkout.draft.acceptedTerms}
              amount={listing.price}
              error={checkout.errors.acceptedTerms}
              onAcceptedTermsChange={checkout.setAcceptedTerms}
            />
          </div>
          <div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-8">
            <ResalePurchaseSummary listing={listing} />
            <button
              className="mt-4 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper hover:bg-coral-dark disabled:cursor-wait disabled:opacity-60"
              type="button"
              disabled={checkout.isProcessing || Boolean(transactionId)}
              onClick={() => void submit()}
            >
              {checkout.isProcessing
                ? "Đang tạo phiên thanh toán…"
                : transactionId
                  ? "Đang chờ Xendit xác nhận…"
                  : "Tiếp tục thanh toán"}
            </button>
            {paymentLinkUrl ? (
              <a
                className="mt-3 block text-center text-sm font-extrabold text-blue-deep underline"
                href={paymentLinkUrl}
                target="_blank"
                rel="noreferrer"
              >
                Mở lại trang thanh toán Xendit
              </a>
            ) : null}
            {checkout.submitError ? (
              <p
                className="mt-3 text-center text-sm font-bold text-error"
                role="alert"
              >
                {checkout.submitError}
              </p>
            ) : null}
            <p
              className="mt-3 mb-0 text-center text-xs leading-[1.5] text-ink-soft"
              aria-live="polite"
            >
              {transactionId
                ? `Trạng thái: ${paymentStatus}. Trang sẽ tự chuyển khi Xendit xác nhận.`
                : "Trang thanh toán Xendit sẽ mở ở tab mới. Vé chỉ được chuyển sau khi nhận webhook thanh toán thành công."}
            </p>
            <button
              className="mt-3 min-h-11 w-full text-sm font-extrabold text-blue-deep"
              type="button"
              disabled={checkout.isProcessing}
              onClick={() => onNavigate(`/resale/${listing.id}`)}
            >
              Quay lại xem vé
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ResaleCheckoutPage({
  listingId,
  listings,
  onNavigate,
  profile,
}: ResaleCheckoutPageProps) {
  const listing = getResaleListingById(listings, listingId);
  if (!listing || listing.availability !== "available") {
    return (
      <section className="px-6 py-[clamp(5rem,10vw,9rem)] text-center mobile:px-5">
        <h1 className="m-0 font-body text-[clamp(2.8rem,6vw,5rem)] leading-[0.84] font-extrabold tracking-[-0.095em]">
          Không thể mở checkout này.
        </h1>
        <p className="mx-auto mt-5 mb-0 max-w-[38rem] text-base leading-[1.6] text-ink-soft">
          Listing không tồn tại hoặc không còn khả dụng. Chưa có thanh toán nào
          được tạo.
        </p>
        <button
          className="mt-7 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
          type="button"
          onClick={() => onNavigate("/resale")}
        >
          Quay lại chợ resale
        </button>
      </section>
    );
  }

  return (
    <ResaleCheckoutContent
      key={listing.id}
      initialBuyer={{
        fullName: profile.fullName,
        email: profile.email,
        phone: profile.phone,
      }}
      listing={listing}
      onNavigate={onNavigate}
    />
  );
}
