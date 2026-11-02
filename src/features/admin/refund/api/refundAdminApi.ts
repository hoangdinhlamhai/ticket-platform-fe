import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminRefundListResponse,
  AdminRefundResponse,
  AdminRefundStatus,
} from "../types/admin-refund.ts";

export type AdminRefundQuery = {
  status?: AdminRefundStatus;
  page?: number;
  pageSize?: number;
};

export const findRefunds = (params: AdminRefundQuery = {}) =>
  axiosClient.get<AdminRefundListResponse>("/admin/refunds", { params });

export const findRefundById = (id: string) =>
  axiosClient.get<AdminRefundResponse>(
    `/admin/refunds/${encodeURIComponent(id)}`,
  );

export const decideRefund = (id: string, decision: "APPROVED" | "REJECTED") =>
  axiosClient.post<AdminRefundResponse>(
    `/admin/refunds/${encodeURIComponent(id)}/decision`,
    { decision },
  );

export const retryRefund = (id: string) =>
  axiosClient.post<AdminRefundResponse>(
    `/admin/refunds/${encodeURIComponent(id)}/retry`,
    {},
  );
