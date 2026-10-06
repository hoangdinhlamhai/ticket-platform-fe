import { useCallback, useEffect, useState, type MouseEvent } from "react";
import type { AttendeePath } from "../../../routes/attendee-route.ts";
import { shouldUseClientNavigation } from "../../../routes/attendee-route.ts";
import * as eventApi from "../api/eventApi.ts";
import { mapPublicEventToCard } from "../helpers/map-public-event.ts";
import { SavedEventsGrid } from "../components/saved/SavedEventsGrid.tsx";
import { SavedEventsHero } from "../components/saved/SavedEventsHero.tsx";
import type { EventCardData } from "../types/event.ts";

type Props = {
  onNavigate: (path: AttendeePath) => void;
  onNoticeChange: (notice: string) => void;
};

export function SavedEventsPage({ onNavigate, onNoticeChange }: Props) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await eventApi.findSaved();
        if (active)
          setEvents(data.events.map(mapPublicEventToCard));
      } catch (cause: unknown) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách sự kiện đã lưu.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const viewEvent = useCallback(
    (event: EventCardData, clickEvent: MouseEvent<HTMLAnchorElement>) => {
      if (!shouldUseClientNavigation(clickEvent)) return;
      clickEvent.preventDefault();
      onNavigate(`/events/${event.id}`);
    },
    [onNavigate],
  );

  const removeSavedEvent = useCallback(
    async (event: EventCardData) => {
      try {
        await eventApi.removeSave(event.id);
        setEvents((current) =>
          current.filter((savedEvent) => savedEvent.id !== event.id),
        );
        onNoticeChange(`Đã bỏ lưu “${event.title}”.`);
      } catch (cause: unknown) {
        onNoticeChange(
          cause instanceof Error ? cause.message : "Không thể bỏ lưu sự kiện.",
        );
      }
    },
    [onNoticeChange],
  );

  return (
    <>
      <SavedEventsHero />
      {loading ? (
        <p className="attendee-container py-12 text-center" role="status">
          Đang tải sự kiện đã lưu...
        </p>
      ) : error ? (
        <p
          className="attendee-container py-12 text-center text-error"
          role="alert"
        >
          {error}
        </p>
      ) : events.length ? (
        <SavedEventsGrid
          events={events}
          onToggleFavorite={removeSavedEvent}
          onViewEvent={viewEvent}
        />
      ) : (
        <p className="attendee-container py-12 text-center">
          Bạn chưa lưu sự kiện nào.
        </p>
      )}
    </>
  );
}
