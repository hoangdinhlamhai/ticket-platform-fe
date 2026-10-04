import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent,
} from "react";
import type { AttendeePath } from "../../../routes/attendee-route.ts";
import { shouldUseClientNavigation } from "../../../routes/attendee-route.ts";
import * as eventApi from "../api/eventApi.ts";
import {
  getSavedEventIds,
  mapPublicEventToCard,
  SAVED_EVENT_STORAGE_KEY,
} from "../helpers/map-public-event.ts";
import {
  countActiveEventFilters,
  createDefaultEventDiscoveryFilters,
  getActiveEventFilterChips,
  removeEventDiscoveryFilter,
  updateEventDiscoveryFilter,
  type EventFilterChip,
} from "../helpers/event-discovery-filter-state.ts";
import { EventDiscoveryGrid } from "../components/event-discovery/EventDiscoveryGrid.tsx";
import { EventSearchHero } from "../components/EventSearchHero.tsx";
import type { EventCardData } from "../types/event.ts";

type Props = {
  onNavigate: (path: AttendeePath) => void;
  onNoticeChange: (notice: string) => void;
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("vi-VN");

export function EventDiscoveryPage({ onNavigate, onNoticeChange }: Props) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [favoriteEventIds, setFavoriteEventIds] =
    useState<string[]>(getSavedEventIds);
  const [advancedFilters, setAdvancedFilters] = useState(
    createDefaultEventDiscoveryFilters,
  );
  const [isFilterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await eventApi.findPublic();
        if (active) setEvents(data.events.map(mapPublicEventToCard));
      } catch (cause: unknown) {
        if (active)
          setLoadError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách sự kiện.",
          );
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [loadAttempt]);

  const categories = useMemo(
    () => ["Tất cả", ...new Set(events.map((event) => event.category))],
    [events],
  );
  const activeFilterChips = useMemo(
    () => getActiveEventFilterChips(advancedFilters),
    [advancedFilters],
  );
  const activeFilterCount = useMemo(
    () => countActiveEventFilters(advancedFilters),
    [advancedFilters],
  );
  const filteredEvents = useMemo(() => {
    const search = normalize(query);
    return events.filter(
      (event) =>
        (selectedCategory === "Tất cả" ||
          event.category === selectedCategory) &&
        (!search ||
          normalize(
            `${event.title} ${event.category} ${event.city} ${event.venue}`,
          ).includes(search)),
    );
  }, [events, query, selectedCategory]);

  const loadEvents = useCallback(() => {
    setIsLoading(true);
    setLoadError("");
    setLoadAttempt((attempt) => attempt + 1);
  }, []);
  const handleQueryChange = useCallback(
    (change: ChangeEvent<HTMLInputElement>) => {
      setQuery(change.target.value);
      onNoticeChange("");
    },
    [onNoticeChange],
  );
  const selectCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      onNoticeChange("");
    },
    [onNoticeChange],
  );
  const selectRecentSearch = useCallback(
    (value: string) => {
      setQuery(value);
      onNoticeChange("");
    },
    [onNoticeChange],
  );
  const setAdvancedFilter = useCallback(
    <K extends keyof typeof advancedFilters>(
      field: K,
      value: (typeof advancedFilters)[K],
    ) => {
      setAdvancedFilters((current) =>
        updateEventDiscoveryFilter(current, field, value),
      );
    },
    [],
  );
  const removeAdvancedFilter = useCallback((id: EventFilterChip["id"]) => {
    setAdvancedFilters((current) => removeEventDiscoveryFilter(current, id));
  }, []);
  const resetAdvancedFilters = useCallback(
    () => setAdvancedFilters(createDefaultEventDiscoveryFilters()),
    [],
  );
  const resetDiscovery = useCallback(() => {
    setQuery("");
    setSelectedCategory("Tất cả");
    setAdvancedFilters(createDefaultEventDiscoveryFilters());
  }, []);
  const toggleFavorite = useCallback(
    (event: EventCardData, isFavorite: boolean) => {
      setFavoriteEventIds((current) =>
        isFavorite
          ? current.filter((id) => id !== event.id)
          : [...current, event.id],
      );
      try {
        const next = isFavorite
          ? favoriteEventIds.filter((id) => id !== event.id)
          : [...favoriteEventIds, event.id];
        window.localStorage.setItem(
          SAVED_EVENT_STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Favorites remain available for the current page session.
      }
      onNoticeChange(
        isFavorite
          ? `Đã bỏ lưu “${event.title}”.`
          : `Đã lưu “${event.title}” vào danh sách quan tâm.`,
      );
    },
    [favoriteEventIds, onNoticeChange],
  );
  const viewEvent = useCallback(
    (event: EventCardData, clickEvent: MouseEvent<HTMLAnchorElement>) => {
      if (!shouldUseClientNavigation(clickEvent)) return;
      clickEvent.preventDefault();
      onNavigate(`/events/${event.id}`);
    },
    [onNavigate],
  );

  return (
    <>
      <EventSearchHero
        categories={categories}
        eventCount={filteredEvents.length}
        onCategorySelect={selectCategory}
        onQueryChange={handleQueryChange}
        onRecentSearchSelect={selectRecentSearch}
        query={query}
        selectedCategory={selectedCategory}
      />
      {isLoading ? (
        <p className="attendee-container py-12 text-center" role="status">
          Đang tải sự kiện...
        </p>
      ) : loadError ? (
        <div className="attendee-container py-12 text-center" role="alert">
          <p>{loadError}</p>
          <button
            type="button"
            className="mt-4 rounded-md bg-blue px-5 py-3 font-bold text-paper"
            onClick={loadEvents}
          >
            Thử lại
          </button>
        </div>
      ) : (
        <EventDiscoveryGrid
          activeFilterChips={activeFilterChips}
          activeFilterCount={activeFilterCount}
          advancedFilters={advancedFilters}
          events={filteredEvents}
          favoriteEventIds={favoriteEventIds}
          isFilterDrawerOpen={isFilterDrawerOpen}
          onAdvancedFilterChange={setAdvancedFilter}
          onCloseFilterDrawer={() => setFilterDrawerOpen(false)}
          onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
          onRemoveAdvancedFilter={removeAdvancedFilter}
          onResetAdvancedFilters={resetAdvancedFilters}
          onResetDiscovery={resetDiscovery}
          onSuggestionSelect={selectRecentSearch}
          onToggleFavorite={toggleFavorite}
          onViewEvent={viewEvent}
        />
      )}
    </>
  );
}
