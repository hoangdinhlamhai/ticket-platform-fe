import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import type { CustomerProfile } from "../../profile";
import { findMine, toOwnedTicket, type OwnedTicket } from "../../tickets";
import { ResaleListingForm } from "../components/ResaleListingForm";
import { ResaleListingPreview } from "../components/ResaleListingPreview";
import { createResaleListing as createPreview } from "../helpers/create-resale-listing";
import { createResaleListingRequest } from "../api/resaleApi";
import type { ResaleListing } from "../types/resale";

type Props = {
  ticketId: string;
  tickets: readonly OwnedTicket[];
  profile: CustomerProfile;
  onPublish: (listing: ResaleListing) => void;
  onNavigate: (path: AttendeePath) => void;
};

function getApiError(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (message) return message;
  }
  return "Không thể đăng listing lúc này. Vui lòng thử lại.";
}

export function CreateResaleListingPage({
  ticketId,
  tickets,
  profile,
  onPublish,
  onNavigate,
}: Props) {
  const [loadedTicket, setLoadedTicket] = useState<OwnedTicket | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [price, setPrice] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const ticket = tickets.find((item) => item.id === ticketId) ?? loadedTicket;

  useEffect(() => {
    if (tickets.some((item) => item.id === ticketId)) return;
    let active = true;
    const loadTicket = async () => {
      setIsLoadingTicket(true);
      try {
        const ticketResponse = await findMine();
        const record = ticketResponse.data.tickets.find(
          (item) => item.id === ticketId,
        );
        if (!active) return;
        setLoadedTicket(record ? toOwnedTicket(record, []) : null);
      } catch {
        if (active) setLoadError("Không thể tải thông tin vé.");
      } finally {
        if (active) setIsLoadingTicket(false);
      }
    };
    void loadTicket();
    return () => {
      active = false;
    };
  }, [ticketId, tickets]);

  const resalePrice = price || (ticket ? String(ticket.originalPrice) : "");

  const preview = useMemo(
    () =>
      ticket
        ? createPreview(ticket, Math.max(Number(resalePrice) || 1, 1), profile)
        : null,
    [profile, resalePrice, ticket],
  );

  const publish = async () => {
    if (!ticket || Number(resalePrice) > ticket.originalPrice) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const { data } = await createResaleListingRequest({
        ticketId: ticket.id,
        price: Number(resalePrice),
        termsAccepted: accepted,
      });
      onPublish(data.listing);
    } catch (error) {
      setSubmitError(getApiError(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTicket) {
    return (
      <section className="px-6 py-24 text-center" aria-live="polite">
        Đang tải thông tin vé…
      </section>
    );
  }

  if (loadError || !ticket || ticket.resaleStatus !== "eligible" || !preview) {
    const reason =
      loadError ||
      (ticket
        ? ticket.resaleStatus === "listed"
          ? "Vé này đã có listing đang hoạt động."
          : `Vé ở trạng thái ${ticket.ticketStatus} chưa đủ điều kiện đăng bán.`
        : "Không tìm thấy vé trong tài khoản của bạn.");
    return (
      <section className="px-6 py-24 text-center">
        <h1 className="font-body text-5xl font-extrabold">
          Chưa thể đăng bán vé này.
        </h1>
        <p className="mt-4 text-ink-soft">{reason}</p>
        <button
          className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
          type="button"
          onClick={() => onNavigate("/tickets")}
        >
          Quay lại vé của tôi
        </button>
      </section>
    );
  }

  return (
    <div className="py-[clamp(3rem,7vw,6rem)]">
      <div className="attendee-container">
        <header className="mb-8">
          <p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">
            ĐĂNG BÁN VÉ RESALE
          </p>
          <h1 className="mt-2 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">
            Đưa vé trở lại cộng đồng.
          </h1>
        </header>
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(18rem,0.72fr)] gap-8 max-[1100px]:block">
          <ResaleListingForm
            ticket={ticket}
            price={resalePrice}
            accepted={accepted}
            isSubmitting={isSubmitting}
            error={submitError}
            onPriceChange={setPrice}
            onAcceptedChange={setAccepted}
            onSubmit={() => void publish()}
          />
          <div className="max-[1100px]:mt-7">
            <ResaleListingPreview
              listing={{
                ...preview,
                price: Number(resalePrice) || preview.price,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
