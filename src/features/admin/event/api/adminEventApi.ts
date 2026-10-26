import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
  AdminEventSeatMapResponse,
} from "../types/admin-event.ts";

export const findAll = () =>
  axiosClient.get<AdminEventListResponse>("/admin/events");

export const findPending = () =>
  axiosClient.get<AdminEventListResponse>("/admin/events/pending-review");

export const findById = (id: string) =>
  axiosClient.get<AdminEventDetailResponse>(
    `/admin/events/${encodeURIComponent(id)}`,
  );

export const findSeatMap = (id: string) =>
  axiosClient.get<AdminEventSeatMapResponse>(
    `/admin/events/${encodeURIComponent(id)}/seat-map`,
  );

export { reviewEvent as review } from "../../api/adminApi.ts";
