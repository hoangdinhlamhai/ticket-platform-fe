import axiosClient from "../../../api/axiosClient.ts";
import type { EventReviewDecision } from "../../../types/event.ts";
import type { AdminEventDetailResponse } from "../event/types/admin-event.ts";

export type AdminQuery = {
  q?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
};

type AdminRecord = Record<string, unknown>;

export const findMetrics = () =>
  axiosClient.get<{ metrics: Record<string, number | string> }>(
    "/admin/dashboard/metrics",
  );

export const findTimeline = () =>
  axiosClient.get<{
    series: readonly {
      date: string;
      revenue: number;
      orders: number;
      tickets: number;
    }[];
  }>("/admin/dashboard/transactions-timeline");

export const findEvents = (params: AdminQuery = {}) =>
  axiosClient.get<{
    events: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/events", { params });

export const reviewEvent = (
  id: string,
  decision: EventReviewDecision,
  reason?: string,
) =>
  axiosClient.post<AdminEventDetailResponse>(
    `/admin/events/${encodeURIComponent(id)}/review`,
    { decision, reason },
  );

export const findRefunds = (params: AdminQuery = {}) =>
  axiosClient.get<{
    refunds: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/refunds", { params });

export const createRefund = (orderId: string, amount: number, reason: string) =>
  axiosClient.post<{ refund: AdminRecord }>("/admin/refunds", {
    orderId,
    amount,
    reason,
  });

export const decideRefund = (
  id: string,
  decision: "APPROVED" | "REJECTED",
  reason: string,
) =>
  axiosClient.post<{ refund: AdminRecord }>(
    `/admin/refunds/${encodeURIComponent(id)}/decision`,
    { decision, reason },
  );

export const findListings = (params: AdminQuery = {}) =>
  axiosClient.get<{ listings: readonly AdminRecord[] }>(
    "/admin/resale/listings",
    { params },
  );

export type AdminResaleListing = {
  id: string;
  price: number;
  status: string;
  createdAt: string;
  seller: { id: string; fullName: string; email: string };
  event: { id: string; title: string };
  ticket: { ticketCode: string };
};

export const findListing = (id: string) =>
  axiosClient.get<{ listing: AdminResaleListing }>(
    `/admin/resale/listings/${encodeURIComponent(id)}`,
  );

export type ResaleListingMetrics = {
  total: number;
  active: number;
  sold: number;
  hiddenOrLocked: number;
};

export const findResaleListingMetrics = () =>
  axiosClient.get<ResaleListingMetrics>("/admin/resale/listings/metrics");

export const findResaleTransactions = (params: AdminQuery = {}) =>
  axiosClient.get<{
    transactions: readonly ResaleTransaction[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/resale/transactions", { params });

export type ResaleTransactionMetrics = {
  total: number;
  pendingPayment: number;
  processing: number;
  completed: number;
};

export const findResaleTransactionMetrics = () =>
  axiosClient.get<ResaleTransactionMetrics>(
    "/admin/resale/transactions/metrics",
  );

export type ResaleTransaction = {
  id: string;
  maGiaoDich?: string;
  transactionCode?: string;
  price: number;
  amount: number;
  status: string;
  createdAt: string;
  event?: { id?: string; tieuDe?: string; title?: string };
  eventTitle?: string;
  suKien?: { tieuDe?: string };
  ticket?: {
    id: string;
    code: string | null;
    type: string;
    seat: string | null;
  };
  seller?: { id?: string; hoTen?: string; fullName?: string; email?: string };
  buyer?: { id?: string; hoTen?: string; fullName?: string; email?: string };
  listing?: {
    event?: { title?: string };
    seller?: { fullName?: string; email?: string };
    ticket?: { ticketCode?: string };
  };
  payment: Record<string, unknown>;
  payout: {
    providerPayoutId?: string | null;
    referenceId?: string | null;
    status?: string | null;
    failureCode?: string | null;
    updatedAt?: string | null;
    bankAccountId?: string | null;
    attempts?: number;
    paidAt?: string | null;
    failureReason?: string | null;
    recipient?: unknown;
  };
  ownershipHistory: readonly {
    id: string;
    owner: { hoTen: string; email: string };
    receivedAt: string;
    returnedAt: string | null;
  }[];
};

export type ResalePayoutBankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
};

export const findResaleTransaction = (id: string) =>
  axiosClient.get<{ transaction: ResaleTransaction }>(
    `/admin/resale/transactions/${encodeURIComponent(id)}`,
  );

export const findResalePayoutBankAccounts = (id: string) =>
  axiosClient.get<{ bankAccounts: ResalePayoutBankAccount[] }>(
    `/admin/resale/transactions/${encodeURIComponent(id)}/payout/bank-accounts`,
  );

export const retryResalePayout = (id: string, bankAccountId: string) =>
  axiosClient.post<{ transaction: { id: string; status: string } }>(
    `/admin/resale/transactions/${encodeURIComponent(id)}/payout/retry`,
    { bankAccountId },
  );
