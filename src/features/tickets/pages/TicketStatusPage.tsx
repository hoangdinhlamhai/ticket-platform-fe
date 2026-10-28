import { TicketNotFoundState } from "../components/detail-ticket/TicketNotFoundState";

type TicketStatusPageProps = {
  onBack: () => void;
};

export function TicketStatusPage({ onBack }: TicketStatusPageProps) {
  return <TicketNotFoundState onBack={onBack} />;
}
