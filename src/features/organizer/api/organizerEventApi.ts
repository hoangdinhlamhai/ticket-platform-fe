import axiosClient from "../../../api/axiosClient.ts";
import type {
  EventApiResponse,
  EventUpdatePayload,
} from "../../../types/event.ts";
import type { SeatMapWritePayload } from "../../seat-map/helpers/seat-map-payload.ts";
import type { SeatMapResponse } from "../../seat-map/types/seat-map.ts";

export const findMineById = (eventId: string) =>
  axiosClient.get<EventApiResponse>(
    `/events/mine/${encodeURIComponent(eventId)}`,
  );

export const findOwnedSeatMap = (eventId: string) =>
  axiosClient.get<SeatMapResponse>(
    `/organizer/events/${encodeURIComponent(eventId)}/seat-map`,
  );

export const updateEvent = (eventId: string, data: EventUpdatePayload) =>
  axiosClient.patch<EventApiResponse>(
    `/events/${encodeURIComponent(eventId)}`,
    data,
  );

export const deleteTicketType = (ticketTypeId: string) =>
  axiosClient.delete(`/ticket-types/${encodeURIComponent(ticketTypeId)}`);

export const updateSeatMap = (eventId: string, data: SeatMapWritePayload) =>
  axiosClient.patch<SeatMapResponse>(
    `/organizer/events/${encodeURIComponent(eventId)}/seat-map`,
    data,
  );
