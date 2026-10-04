import axiosClient from "../../../../api/axiosClient.ts";
import type { EventReviewDecision } from "../../../../types/event.ts";
import type {
  AdminEventDetailResponse,
  AdminEventListResponse,
} from "../types/admin-event.ts";

export const findAll = () =>
  axiosClient.get<AdminEventListResponse>("/admin/events");

export const findPending = () =>
  axiosClient.get<AdminEventListResponse>("/admin/events/pending-review");

export const findById = (id: string) =>
  axiosClient.get<AdminEventDetailResponse>(
    `/admin/events/${encodeURIComponent(id)}`,
  );

export const review = (
  id: string,
  decision: EventReviewDecision,
  reason?: string,
) =>
  axiosClient.post<AdminEventDetailResponse>(
    `/admin/events/${encodeURIComponent(id)}/review`,
    { decision, reason },
  );
