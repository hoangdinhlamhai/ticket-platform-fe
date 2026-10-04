import { AdminEventList } from "./AdminEventList.tsx";
import type { AdminEventListItem } from "../types/admin-event.ts";

type Props = {
  readonly events: readonly AdminEventListItem[];
  readonly navigate: (path: string) => void;
};

export function AdminEventReviews({ events, navigate }: Props) {
  return <AdminEventList events={events} navigate={navigate} reviewMode />;
}
