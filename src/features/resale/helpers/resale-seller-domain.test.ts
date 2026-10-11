import assert from "node:assert/strict";
import test from "node:test";
import type { OwnedTicket } from "../../tickets/types/ticket.ts";
import { createResaleListing } from "./create-resale-listing.ts";
import { updateResaleListingStatus } from "./update-resale-listing-status.ts";

const profile = {
  fullName: "Minh Anh",
  email: "minhanh@ticketly.vn",
  phone: "0901234567",
  birthDate: "1998-06-15",
};
const ticket = {
  id: "ticket-1",
  eventId: "event-1",
  eventTitle: "Sự kiện thử",
  date: "17 THG 10 · 19:30",
  venue: "Nhà hát",
  address: "TP. Hồ Chí Minh",
  ticketType: "Balcony",
  holderName: profile.fullName,
  referenceCode: "TKL-001",
  purchaseLabel: "Đơn 001",
  status: "Sắp diễn ra",
  source: "primary",
  orderId: "order-1",
  credentialCode: "TKL-001",
  credentialStatus: "ready",
  resaleStatus: "eligible",
  journey: [],
} satisfies OwnedTicket;
test("creates an active current-profile listing from an owned ticket", () => {
  const listing = createResaleListing(ticket, 450000, profile);
  assert.equal(listing.price, 450000);
  assert.equal(listing.eventId, ticket.eventId);
  assert.equal(listing.sourceTicketId, ticket.id);
  assert.equal(listing.ownerLabel, "current-profile");
  assert.equal(listing.listingStatus, "active");
});
test("rejects non-positive prices and updates listing status immutably", () => {
  assert.throws(() => createResaleListing(ticket, 0, profile));
  const listing = createResaleListing(ticket, 450000, profile);
  const updated = updateResaleListingStatus([listing], listing.id, "withdrawn");
  assert.equal(updated[0].listingStatus, "withdrawn");
  assert.equal(listing.listingStatus, "active");
});
