import { useCallback, useState } from "react";
import { validateResaleCheckout } from "../helpers/validate-resale-checkout";
import type {
  ResaleBuyer,
  ResaleCheckoutDraft,
  ResaleCheckoutErrors,
  ResaleCheckoutField,
  ResaleListing,
} from "../types/resale";

type UseResaleCheckoutOptions = {
  listing: ResaleListing;
  initialBuyer: ResaleBuyer;
  onCheckout: (buyer: ResaleBuyer) => Promise<void>;
};

function getApiMessage(error: unknown) {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return null;
  }
  const response = error.response;
  if (
    typeof response !== "object" ||
    response === null ||
    !("data" in response)
  ) {
    return null;
  }
  const data = response.data;
  if (typeof data !== "object" || data === null || !("message" in data)) {
    return null;
  }
  const message = data.message;
  return typeof message === "string" ? message : null;
}

export function useResaleCheckout({
  listing,
  initialBuyer,
  onCheckout,
}: UseResaleCheckoutOptions) {
  const [draft, setDraft] = useState<ResaleCheckoutDraft>({
    ...initialBuyer,
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<ResaleCheckoutErrors>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const transferContent = `TICKETLY ${listing.id
    .replace(/[^a-z0-9]/gi, "")
    .slice(-12)
    .toUpperCase()}`;

  const updateBuyerField = useCallback(
    (field: keyof ResaleBuyer, value: string) => {
      setDraft((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    },
    [],
  );

  const setAcceptedTerms = useCallback((acceptedTerms: boolean) => {
    setDraft((current) => ({ ...current, acceptedTerms }));
    setErrors((current) => ({ ...current, acceptedTerms: undefined }));
  }, []);

  const submit = useCallback(async (): Promise<ResaleCheckoutField | null> => {
    if (isProcessing) return null;
    const validation = validateResaleCheckout(draft);
    setErrors(validation.errors);
    if (validation.firstInvalidField) return validation.firstInvalidField;

    setSubmitError("");
    setIsProcessing(true);
    try {
      await onCheckout({
        fullName: draft.fullName.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
      });
    } catch (error: unknown) {
      setSubmitError(
        getApiMessage(error) ??
          "Không thể tạo phiên thanh toán. Listing có thể vừa được người khác mua.",
      );
    } finally {
      setIsProcessing(false);
    }
    return null;
  }, [draft, isProcessing, onCheckout]);

  return {
    draft,
    errors,
    isProcessing,
    setAcceptedTerms,
    submit,
    submitError,
    transferContent,
    updateBuyerField,
  };
}
