import axiosClient from "../../../api/axiosClient.ts";
import type {
  EventApiResponse,
  EventCreatePayload,
  EventListResponse,
  EventReportResponse,
  EventUpdatePayload,
  EventTicketTypeResponse,
  TicketTypePayload,
  UploadResponse,
  EventPayoutInfo,
  EventCategory,
  EventLocation,
  PublicEventResponse,
  PublicEventListResponse,
  OrganizerReportRangeInput,
} from "../../../types/event.ts";

const create = (data: EventCreatePayload) =>
  axiosClient.post<EventApiResponse>("/events", data);
const update = (id: string, data: EventUpdatePayload) =>
  axiosClient.patch<EventApiResponse>(`/events/${id}`, data);
const findMine = () => axiosClient.get<EventListResponse>("/events/mine");
const findMineById = (id: string) =>
  axiosClient.get<EventApiResponse>(`/events/mine/${encodeURIComponent(id)}`);
const submitReview = (id: string) =>
  axiosClient.post<EventApiResponse>(`/events/${id}/submit-review`);
const setPayout = (id: string, data: EventPayoutInfo) =>
  axiosClient.post<{ payoutInfo: EventPayoutInfo }>(
    `/events/${id}/payout`,
    data,
  );
const reporting = (id: string, params?: OrganizerReportRangeInput) =>
  axiosClient.get<EventReportResponse>(`/events/${id}/reporting`, { params });
const findPublic = () => axiosClient.get<PublicEventListResponse>("/events");
const findPublicById = (id: string) =>
  axiosClient.get<PublicEventResponse>(`/events/${encodeURIComponent(id)}`);
const findPending = () =>
  axiosClient.get<EventListResponse>("/admin/events/pending-review");
const categories = () =>
  axiosClient.get<{ categories: EventCategory[] }>("/categories");
const locations = () =>
  axiosClient.get<{ provinces: EventLocation[] }>("/locations/provinces");
const wards = (provinceId: string) =>
  axiosClient.get<{ wards: EventLocation[] }>(
    `/locations/provinces/${encodeURIComponent(provinceId)}/wards`,
  );
const uploadImage = (file: File, onProgress?: (progress: number) => void) => {
  const body = new FormData();
  body.append("file", file);
  return axiosClient.post<UploadResponse>("/uploads/events", body, {
    onUploadProgress: (event) => {
      if (event.total && onProgress)
        onProgress((event.loaded / event.total) * 100);
    },
  });
};
const createTicketType = (data: TicketTypePayload) =>
  axiosClient.post<EventTicketTypeResponse>("/ticket-types", data);
const updateTicketType = (id: string, data: Partial<TicketTypePayload>) =>
  axiosClient.patch<EventTicketTypeResponse>(`/ticket-types/${id}`, data);

export {
  create,
  update,
  findMine,
  findMineById,
  submitReview,
  setPayout,
  reporting,
  findPublic,
  findPublicById,
  findPending,
  categories,
  locations,
  wards,
  uploadImage,
  createTicketType,
  updateTicketType,
};
