export const ORGANIZER_EVENT_STATUSES = [
  "draft",
  "pending_review",
  "changes_requested",
  "approved",
  "published",
  "ongoing",
  "ended",
  "cancelled",
  "rejected",
] as const;
export type OrganizerEventStatus =
  | (typeof ORGANIZER_EVENT_STATUSES)[number]
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";
export type OrganizerEventVisibility = "public" | "link_only";

export type OrganizerEvent = {
  readonly id: string;
  readonly title: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly venue?: string;
  readonly venueName?: string | null;
  readonly city?: string;
  readonly status: OrganizerEventStatus;
  readonly reviewFeedback?: string | null;
  readonly thumbnail?: string | null;
  readonly coverImage?: string | null;
  readonly category?: string | { name: string } | null;
  readonly categoryId?: string;
  readonly provinceId?: string;
  readonly wardId?: string;
  readonly street?: string;
  readonly description?: string | null;
  readonly organizerName?: string | null;
  readonly organizerBio?: string | null;
  readonly organizerLogo?: string | null;
  readonly visibility?: OrganizerEventVisibility;
  readonly confirmationMessage?: string | null;
  readonly seatingChartImage?: string;
};

export type OrganizerEventFinance = {
  readonly accountHolder: string;
  readonly accountNumber: string;
  readonly bankName: string;
  readonly branch: string;
  readonly businessType: string;
  readonly invoiceName?: string | null;
  readonly invoiceAddress?: string | null;
  readonly taxCode?: string | null;
};

export type OrganizerEventInput = Pick<
  OrganizerEvent,
  "title" | "startAt" | "endAt" | "venue" | "city"
> &
  Partial<
    Omit<
      OrganizerEvent,
      | "id"
      | "status"
      | "reviewFeedback"
      | "title"
      | "startAt"
      | "endAt"
      | "venue"
      | "city"
    >
  >;
export type OrganizerEventPatch = Partial<OrganizerEventInput>;
