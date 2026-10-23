import type {
  EventUpdatePayload,
  OwnerEvent,
  TicketTypePayload,
} from "../../../types/event.ts";
import type { OrganizerEventFormValues } from "../hooks/use-organizer-event-form.ts";
import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from "../hooks/use-organizer-event-form.ts";
import type { OrganizerTicketTierDraft } from "../types/organizer-commerce.ts";
import { sanitizeOrganizerHtml } from "./sanitize-organizer-html.ts";

export function toEditValues(event: OwnerEvent): OrganizerEventFormValues {
  return {
    title: event.title,
    startAt: toDateTimeLocalValue(event.startAt),
    endAt: toDateTimeLocalValue(event.endAt),
    venue: event.venueName ?? "",
    city: event.location.province.name,
    category: event.category.name,
    categoryId: event.categoryId,
    provinceId: event.location.provinceId,
    wardId: event.location.wardId ?? "",
    street: event.location.address,
    thumbnail: event.thumbnail ?? "",
    coverImage: event.coverImage ?? "",
    description: event.description ?? "",
    organizerName: event.organizerName ?? "",
    organizerBio: event.organizerBio ?? "",
    organizerLogo: event.organizerLogo ?? "",
    visibility: event.visibility === "PUBLIC" ? "public" : "link_only",
    confirmationMessage: event.confirmationMessage ?? "",
    seatingChartImage: event.seatMap?.imageUrl ?? "",
    scheduleSummary: "",
    policySummary: "",
    ticketTierName: "",
    ticketTierPrice: "",
    ticketTierCapacity: "",
    tiers: event.ticketTypes.map((tier) => ({
      name: tier.name,
      price: tier.price,
      capacity: tier.quantity,
      salesStartAt: tier.saleStartAt ?? event.startAt,
      salesEndAt: tier.saleEndAt ?? event.endAt,
      perOrderLimit: tier.maxPerOrder,
      minPerOrder: tier.minPerOrder,
      description: tier.description ?? "",
      image: tier.image ?? "",
    })),
    finance: {
      accountHolder: event.payoutInfo?.accountHolder ?? "",
      accountNumber: event.payoutInfo?.accountNumber ?? "",
      bankName: event.payoutInfo?.bankName ?? "",
      branch: event.payoutInfo?.branch ?? "",
      businessType: event.payoutInfo?.businessType ?? "INDIVIDUAL",
      invoiceName: event.payoutInfo?.invoiceName ?? "",
      invoiceAddress: event.payoutInfo?.invoiceAddress ?? "",
      taxCode: event.payoutInfo?.taxCode ?? "",
    },
  };
}

export function toEditPayload(
  values: OrganizerEventFormValues,
): EventUpdatePayload {
  return {
    title: values.title,
    startAt: fromDateTimeLocalValue(values.startAt),
    endAt: fromDateTimeLocalValue(values.endAt),
    venueName: values.venue || values.street,
    categoryId: values.categoryId,
    location: {
      address: values.street,
      provinceId: values.provinceId,
      wardId: values.wardId || undefined,
    },
    thumbnail: values.thumbnail,
    coverImage: values.coverImage,
    description: sanitizeOrganizerHtml(values.description),
    organizerName: values.organizerName,
    organizerBio: sanitizeOrganizerHtml(values.organizerBio),
    organizerLogo: values.organizerLogo,
    visibility: values.visibility === "public" ? "PUBLIC" : "LINK_ONLY",
    confirmationMessage: values.confirmationMessage,
  };
}

export function toTicketPayload(
  tier: OrganizerTicketTierDraft,
): Omit<TicketTypePayload, "eventId"> {
  return {
    name: tier.name,
    price: tier.price,
    quantity: tier.capacity,
    saleStartAt: tier.salesStartAt,
    saleEndAt: tier.salesEndAt,
    maxPerOrder: tier.perOrderLimit,
    minPerOrder: tier.minPerOrder ?? 1,
    description: tier.description ?? "",
    image: tier.image ?? "",
  };
}
