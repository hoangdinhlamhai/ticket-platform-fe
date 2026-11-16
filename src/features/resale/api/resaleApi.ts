import axiosClient from "../../../api/axiosClient.ts";
import type { ResaleListing } from "../types/resale";

export type ResaleListingsResponse = { listings: ResaleListing[] };
export type CreateResaleListingPayload = {
  ticketId: string;
  price: number;
  termsAccepted: boolean;
};
export type ResaleListingResponse = { listing: ResaleListing };
export type ResaleTransaction = {
  id: string;
  listingId: string;
  eventId: string;
  eventTitle: string;
  ticketType: string;
  ticketId: string;
  amount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  payoutAt: string | null;
  payoutNeedsConfirmation: boolean;
  payoutError: string | null;
  payoutStatus: string | null;
  payoutUpdatedAt: string | null;
  payoutAccountUpdated: boolean;
  buyerPayoutMessage: string | null;
  canRequestRefund: boolean;
  refundStatus: string | null;
  payoutBankAccountId: string | null;
  isSeller: boolean;
  isBuyer: boolean;
};
export type ResaleTransactionResponse = {
  transaction: ResaleTransaction;
};
export type ResaleTransactionsResponse = {
  transactions: ResaleTransaction[];
};
export type CreateResaleCheckoutResponse = {
  transactionId: string;
  paymentSessionId: string;
  paymentLinkUrl: string;
  expiresAt: string;
};

export const findResaleListings = () =>
  axiosClient.get<ResaleListingsResponse>("/resale/listings");

export const findMyResaleListings = () =>
  axiosClient.get<ResaleListingsResponse>("/resale/listings/mine");

export const createResaleListingRequest = (data: CreateResaleListingPayload) =>
  axiosClient.post<ResaleListingResponse>("/resale/listings", data);

export const createResaleCheckoutRequest = (
  listingId: string,
  payerEmail: string,
) =>
  axiosClient.post<CreateResaleCheckoutResponse>(
    `/resale/listings/${encodeURIComponent(listingId)}/checkout`,
    { payerEmail },
  );

export const findMyResaleSales = () =>
  axiosClient.get<ResaleTransactionsResponse>("/resale/transactions/mine");

export const findResaleTransaction = (transactionId: string) =>
  axiosClient.get<ResaleTransactionResponse>(
    `/resale/transactions/${encodeURIComponent(transactionId)}`,
  );

export const createResaleRefundRequest = (
  transactionId: string,
  reason: string,
) =>
  axiosClient.post<{ refund: { id: string; status: string } }>(
    `/resale/transactions/${encodeURIComponent(transactionId)}/refund-requests`,
    { reason },
  );
