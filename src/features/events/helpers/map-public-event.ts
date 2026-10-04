import type { PublicEvent } from "../../../types/event.ts";
import { formatTicketPrice } from "./formatTicketPrice.ts";
import type { EventCardData, EventPosterTone } from "../types/event.ts";

const posterTones: readonly EventPosterTone[] = [
  "yellow",
  "mint",
  "blue",
  "coral",
];
export const SAVED_EVENT_STORAGE_KEY = "ticketly:saved-event-ids";

export function getSavedEventIds(): string[] {
  try {
    const saved = window.localStorage.getItem(SAVED_EVENT_STORAGE_KEY);
    const value: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export function mapPublicEventToCard(
  event: PublicEvent,
  index = 0,
): EventCardData {
  const ticketTypes = Array.isArray(event.ticketTypes) ? event.ticketTypes : [];
  const lowestPrice = ticketTypes.length
    ? Math.min(...ticketTypes.map((ticket) => ticket.price))
    : null;
  return {
    id: event.id,
    title: event.title,
    category: event.category.name,
    date: new Date(event.startAt).toLocaleDateString("vi-VN"),
    venue: event.venueName ?? event.location.address,
    city: event.location.province.name,
    priceFrom:
      lowestPrice === null
        ? "Chưa mở bán"
        : `Từ ${formatTicketPrice(lowestPrice)}`,
    posterLabel: event.category.name.toLocaleUpperCase("vi-VN"),
    posterTone: posterTones[index % posterTones.length],
  };
}
