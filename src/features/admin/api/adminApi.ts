import axiosClient from "../../../api/axiosClient.ts";
import type { EventReviewDecision } from "../../../types/event.ts";
import type { AdminEventDetailResponse } from "../event/types/admin-event.ts";

export type AdminQuery = {
  q?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  pageSize?: number;
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

export const findUsers = (params: AdminQuery = {}) =>
  axiosClient.get<{
    users: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/users", { params });

export const findUser = (id: string) =>
  axiosClient.get<{ user: AdminRecord }>(
    `/admin/users/${encodeURIComponent(id)}`,
  );

export const setUserStatus = (
  id: string,
  status: "ACTIVE" | "SUSPENDED",
  reason?: string,
) =>
  axiosClient.patch<{ user: AdminRecord }>(
    `/admin/users/${encodeURIComponent(id)}/status`,
    { status, reason },
  );

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

export const findOrganizers = (params: AdminQuery = {}) =>
  axiosClient.get<{
    organizers: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/organizers", { params });

export const findOrders = (params: AdminQuery = {}) =>
  axiosClient.get<{
    orders: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/orders", { params });

export const findPayments = (params: AdminQuery = {}) =>
  axiosClient.get<{
    payments: readonly AdminRecord[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/payments", { params });

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

export const findResaleTransactions = (params: AdminQuery = {}) =>
  axiosClient.get<{ transactions: readonly AdminRecord[] }>(
    "/admin/resale/transactions",
    { params },
  );

export const findCategories = () =>
  axiosClient.get<{ categories: readonly AdminRecord[] }>("/admin/categories");

export const createCategory = (name: string, slug: string) =>
  axiosClient.post<{ category: AdminRecord }>("/admin/categories", {
    name,
    slug,
  });

export const updateCategory = (id: string, name: string, slug: string) =>
  axiosClient.patch<{ category: AdminRecord }>(
    `/admin/categories/${encodeURIComponent(id)}`,
    { name, slug },
  );

export const deleteCategory = (id: string) =>
  axiosClient.delete<{ id: string }>(
    `/admin/categories/${encodeURIComponent(id)}`,
  );
