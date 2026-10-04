import type { AdminEventListItem } from "../types/admin-event.ts";

type Props = {
  readonly events: readonly AdminEventListItem[];
  readonly navigate: (path: string) => void;
  readonly reviewMode?: boolean;
};

export function AdminEventList({ events, navigate, reviewMode = false }: Props) {
  return events.length ? (
    <div className="grid gap-3">
      {events.map((event) => (
        <button
          className="rounded-lg border border-line bg-surface p-4 text-left hover:border-blue"
          type="button"
          key={event.id}
          onClick={() =>
            navigate(
              `/admin/events/${encodeURIComponent(event.id)}/${reviewMode ? "review" : "details"}`,
            )
          }
        >
          <span className="flex flex-wrap items-center justify-between gap-2">
            <strong>{event.title}</strong>
            <span className="rounded-full bg-paper px-3 py-1 text-xs font-bold">
              {event.status}
            </span>
          </span>
          <span className="mt-2 block text-sm text-ink-soft">
            {event.venueName ?? event.location.address} · {event.category.name}
          </span>
          <span className="mt-1 block text-sm text-ink-soft">
            {new Date(event.startAt).toLocaleString("vi-VN")} · Organizer: {event.organizer.fullName}
          </span>
        </button>
      ))}
    </div>
  ) : (
    <p className="rounded border border-line bg-surface p-5">
      Không có sự kiện nào.
    </p>
  );
}
