import { useCallback, useEffect, useState, type MouseEvent } from "react";
import {
  shouldUseClientNavigation,
  type AttendeePath,
} from "../../../routes/attendee-route";
import { OwnedListTicketSummary } from "../components/OwnedListTicketSummary";
import type { OwnedTicket } from "../types/ticket";
import { findMine, findMineOrders, toOwnedTicket } from "../api/ticketApi";

type OwnedTicketsPageProps = {
  onNavigate: (path: AttendeePath) => void;
  onSellTicket: (ticket: OwnedTicket) => void;
};

export function OwnedTicketsPage({
  onNavigate,
  onSellTicket,
}: OwnedTicketsPageProps) {
  const [tickets, setTickets] = useState<OwnedTicket[]>([]);
  useEffect(() => {
    let active = true;
    const loadTickets = async () => {
      try {
        const [ticketResponse, orderResponse] = await Promise.all([
          findMine(),
          findMineOrders(),
        ]);
        if (!active) return;
        setTickets(
          ticketResponse.data.tickets.map((ticket) =>
            toOwnedTicket(ticket, orderResponse.data.orders),
          ),
        );
      } catch {
        if (active) setTickets([]);
      }
    };
    void loadTickets();
    return () => {
      active = false;
    };
  }, []);
  const viewTicket = useCallback(
    (ticket: OwnedTicket, event: MouseEvent<HTMLAnchorElement>) => {
      if (!shouldUseClientNavigation(event)) return;
      event.preventDefault();
      onNavigate(`/tickets/${ticket.id}`);
    },
    [onNavigate],
  );

  return (
    <OwnedListTicketSummary
      tickets={tickets}
      onSell={onSellTicket}
      onTicketAction={viewTicket}
    />
  );
}
