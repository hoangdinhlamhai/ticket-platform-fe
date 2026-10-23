import axiosClient from "../../../api/axiosClient.ts";
import type { SeatMapResponse } from "../types/seat-map.ts";
import type { SeatMapWritePayload } from "../helpers/seat-map-payload.ts";

export const findPublic = (eventId: string) =>
  axiosClient.get<SeatMapResponse>(
    `/events/${encodeURIComponent(eventId)}/seat-map`,
  );

export type PublicSeatStatus = "AVAILABLE" | "RESERVED" | "SOLD";
export type PublicSeatStatusResponse = {
  eventId: string;
  seatStatuses: { seatId: string; status: PublicSeatStatus }[];
};

export const findPublicSeatStatuses = (eventId: string) =>
  axiosClient.get<PublicSeatStatusResponse>(
    `/events/${encodeURIComponent(eventId)}/seat-status`,
  );

export const create = (eventId: string, data: SeatMapWritePayload) =>
  axiosClient.post<SeatMapResponse>(
    `/organizer/events/${encodeURIComponent(eventId)}/seat-map`,
    data,
  );

export const remove = (eventId: string) =>
  axiosClient.delete<{ seatMap: { id: string; eventId: string } }>(
    `/organizer/events/${encodeURIComponent(eventId)}/seat-map`,
  );
