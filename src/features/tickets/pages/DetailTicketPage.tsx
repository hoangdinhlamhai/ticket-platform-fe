import { useCallback, useEffect, useState, type MouseEvent } from "react";
import {
  shouldUseClientNavigation,
  type AttendeePath,
} from "../../../routes/attendee-route";
import { TicketCredentialCard } from "../components/detail-ticket/TicketCredentialCard";
import { TicketInformationCard } from "../components/detail-ticket/TicketInformationCard";
import { TicketJourneyTimeline } from "../components/detail-ticket/TicketJourneyTimeline";
import { TicketStatusHero } from "../components/detail-ticket/TicketStatusHero";
import { TicketStatusPage } from "./TicketStatusPage";
import type { OwnedTicket } from "../types/ticket";
import { findMine, findMineOrders, toOwnedTicket } from "../api/ticketApi";

type DetailTicketPageProps = {
  onNavigate: (path: AttendeePath) => void;
  ticketId: string;
};

export function DetailTicketPage({
  onNavigate,
  ticketId,
}: DetailTicketPageProps) {
  const [ticket, setTicket] = useState<OwnedTicket>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadTicket = async () => {
      setIsLoading(true);
      setTicket(undefined);
      try {
        const [ticketResponse, orderResponse] = await Promise.all([
          findMine(),
          findMineOrders(),
        ]);
        if (!active) return;
        const record = ticketResponse.data.tickets.find(
          (item) => item.id === ticketId,
        );
        setTicket(
          record ? toOwnedTicket(record, orderResponse.data.orders) : undefined,
        );
      } catch {
        if (active) setTicket(undefined);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadTicket();
    return () => {
      active = false;
    };
  }, [ticketId]);

  const goToTickets = useCallback(() => onNavigate("/tickets"), [onNavigate]);
  const viewEvent = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (!shouldUseClientNavigation(event) || !ticket) return;
      event.preventDefault();
      onNavigate(`/events/${ticket.eventId}`);
    },
    [onNavigate, ticket],
  );

  if (isLoading) {
    return (
      <section
        className="px-6 py-24 text-center text-ink-soft"
        aria-live="polite"
        aria-busy="true"
      >
        Đang tải chi tiết vé…
      </section>
    );
  }

  if (!ticket) return <TicketStatusPage onBack={goToTickets} />;

  return (
    <>
      <TicketStatusHero ticket={ticket} onBack={goToTickets} />
      <div className="py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="attendee-container grid grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)] items-start gap-8 max-[1100px]:block">
          <div>
            <TicketInformationCard ticket={ticket} />
            <TicketJourneyTimeline journey={ticket.journey} />
          </div>
          <div className="max-[1100px]:mt-10">
            <TicketCredentialCard ticket={ticket} />
            {ticket.eventId && (
              <a
                className="mt-4 flex min-h-11 items-center justify-center rounded-md border border-blue-deep/60 bg-paper px-4 text-sm font-extrabold text-blue-deep no-underline hover:bg-blue hover:text-paper"
                href={`/events/${ticket.eventId}`}
                onClick={viewEvent}
              >
                Xem chi tiết sự kiện
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
