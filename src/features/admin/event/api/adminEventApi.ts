import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminEvent,
  AdminEventDetail,
  AdminEventReviewDecision,
} from "../types/adminEventTypes.ts";

export const adminEventApi = {
  async findAll(): Promise<AdminEvent[]> {
    const response = await axiosClient.get<{ events: AdminEvent[] }>(
      "/admin/events",
    );
    return response.data.events;
  },

  async findPending(): Promise<AdminEvent[]> {
    const response = await axiosClient.get<{ events: AdminEvent[] }>(
      "/admin/events/pending-review",
    );
    return response.data.events;
  },

  async findById(id: string): Promise<AdminEventDetail> {
    const response = await axiosClient.get<{ event: AdminEventDetail }>(
      `/admin/events/${encodeURIComponent(id)}`,
    );
    return response.data.event;
  },

  async review(
    id: string,
    decision: AdminEventReviewDecision,
    reason?: string,
  ): Promise<AdminEventDetail> {
    const response = await axiosClient.post<{ event: AdminEventDetail }>(
      `/admin/events/${encodeURIComponent(id)}/review`,
      { decision, reason },
    );
    return response.data.event;
  },
};
