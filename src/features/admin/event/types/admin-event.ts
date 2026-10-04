import type {
  EventReviewDecision,
  EventTicketType,
} from "../../../../types/event.ts";

export type AdminEventListItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  visibility: string;
  startAt: string;
  endAt: string;
  venueName?: string | null;
  submittedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  organizer: { id: string; fullName: string; email: string };
  category: { id: string; name: string };
  location: {
    address: string;
    province: { name: string };
    ward: { name: string } | null;
  };
};

export type AdminEventDetail = AdminEventListItem & {
  description: string | null;
  thumbnail: string | null;
  coverImage: string | null;
  venueName: string | null;
  confirmationMessage: string | null;
  organizerName: string | null;
  organizerBio: string | null;
  organizerLogo: string | null;
  reviewedAt: string | null;
  reviewedBy: { id: string; fullName: string; email: string } | null;
  ticketTypes: EventTicketType[];
  seatMap: {
    id: string;
    width: number;
    height: number;
    imageUrl: string | null;
  } | null;
  payoutInfo: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    businessType: string;
    invoiceName: string | null;
    invoiceAddress: string | null;
    taxCode: string | null;
  } | null;
};

export type AdminEventDetailResponse = { event: AdminEventDetail };
export type AdminEventListResponse = { events: AdminEventListItem[] };
export type AdminEventReviewAction = EventReviewDecision;
