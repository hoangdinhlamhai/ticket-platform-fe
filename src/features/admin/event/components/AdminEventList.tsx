import { AdminEventCard } from "./AdminEventCard.tsx";
import type { AdminEventListItem } from "../types/admin-event.ts";

type Props = {
  readonly events: readonly AdminEventListItem[];
  readonly navigate: (path: string) => void;
};

export function AdminEventList({ events, navigate }: Props) {
  return <AdminEventCard events={events} navigate={navigate} reviewMode />;
}
