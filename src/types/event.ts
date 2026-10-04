export type EventApi = typeof import("../features/events/api/eventApi.ts");
export type EventReviewDecision = "APPROVED" | "REJECTED";
export type EventVisibility = "PUBLIC" | "LINK_ONLY";
export type EventStatus = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED";
export type EventCategory = { id: string; name: string };
export type EventLocation = { id: string; name: string };
export type EventAddress = {
  address: string;
  provinceId: string;
  wardId?: string | null;
  province: { name: string };
  ward?: { name: string } | null;
};
export type EventPayoutInfo = {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branch: string;
  businessType: string;
  invoiceName?: string | null;
  invoiceAddress?: string | null;
  taxCode?: string | null;
};
export type TicketTypePayload = {
  eventId: string;
  name: string;
  price: number;
  quantity: number;
  description?: string | null;
  image?: string | null;
  maxPerOrder: number;
  minPerOrder: number;
  saleStartAt: string;
  saleEndAt: string;
};
export type EventTicketType = Omit<
  TicketTypePayload,
  "eventId" | "saleStartAt" | "saleEndAt"
> & {
  id: string;
  saleStartAt: string | null;
  saleEndAt: string | null;
};
export type EventCreatePayload = {
  title: string;
  slug?: string;
  startAt: string;
  endAt: string;
  venueName?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  organizerName?: string | null;
  organizerBio?: string | null;
  organizerLogo?: string | null;
  visibility?: EventVisibility;
  confirmationMessage?: string | null;
  seatingChartImage?: string | null;
  categoryId: string;
  locationId?: string;
  location?: { address: string; provinceId: string; wardId?: string };
  tickets?: Omit<TicketTypePayload, "eventId">[];
  payoutInfo?: EventPayoutInfo;
};
export type EventUpdatePayload = Partial<
  Omit<EventCreatePayload, "tickets" | "payoutInfo">
>;
export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  startAt: string;
  endAt: string;
  venueName: string | null;
  description: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  organizerName: string | null;
  organizerBio: string | null;
  organizerLogo: string | null;
  category: { name: string };
  location: EventAddress;
  seatMap?: { imageUrl: string | null } | null;
  ticketTypes: EventTicketType[];
};
export type OwnerEvent = PublicEvent & {
  categoryId: string;
  locationId: string;
  organizerId: string;
  status: EventStatus;
  visibility: EventVisibility;
  rejectionReason: string | null;
  confirmationMessage: string | null;
  payoutInfo?: EventPayoutInfo | null;
};
export type OrganizerReportRange = {
  readonly startAt: string;
  readonly endAt: string;
};
export type OrganizerReportSummary = {
  readonly revenue: number;
  readonly paidOrderCount: number;
  readonly soldTicketCount: number;
  readonly capacity: number;
  readonly remainingTicketCount: number;
  readonly checkInCount: number;
};
export type OrganizerReportTimelineBucket = OrganizerReportRange & {
  readonly revenue: number;
  readonly soldTicketCount: number;
};
export type OrganizerReportTicketType = {
  readonly id: string;
  readonly name: string;
  readonly price: number;
  readonly capacity: number;
  readonly soldTicketCount: number;
  readonly revenue: number;
};
export type OrganizerEventReport = {
  readonly eventId: string;
  readonly saleWindow: OrganizerReportRange;
  readonly range: OrganizerReportRange;
  readonly summary: OrganizerReportSummary;
  readonly timeline: readonly OrganizerReportTimelineBucket[];
  readonly ticketTypes: readonly OrganizerReportTicketType[];
};
export type OrganizerReportRangeInput = {
  readonly from: string;
  readonly to: string;
};
export type EventApiResponse = { event: OwnerEvent };
export type UploadResponse = { url: string };

export type EventListResponse = { events: OwnerEvent[] };
export type PublicEventResponse = { event: PublicEvent };
export type PublicEventListResponse = { events: PublicEvent[] };
export type EventReportResponse = { report: OrganizerEventReport };
export type EventReviewResponse = EventApiResponse;
export type EventTicketTypeResponse = { ticketType: EventTicketType };
export type OrganizerEventOwnerTicketType = EventTicketType & {
  quantity: number;
};
export type OrganizerEventOwnerDetail = {
  event: OwnerEvent;
  ticketTypes: OrganizerEventOwnerTicketType[];
  seatMap: { imageUrl: string | null } | null;
  payoutInfo: EventPayoutInfo | null;
};
