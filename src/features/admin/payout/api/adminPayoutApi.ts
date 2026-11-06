import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminPayoutActionResponse,
  AdminPayoutResponse,
  PendingPayoutsResponse,
} from "../types/admin-payout.ts";

export type PayoutStatusFilter =
  "ALL" | "PENDING_APPROVAL" | "PROCESSING" | "APPROVED";

export const findPending = (status: PayoutStatusFilter = "ALL", page = 1) =>
  axiosClient.get<PendingPayoutsResponse>("/admin/payouts/pending", {
    params: { ...(status === "ALL" ? {} : { status }), page, pageSize: 20 },
  });

export const findById = (id: string) =>
  axiosClient.get<AdminPayoutResponse>(
    `/admin/payouts/${encodeURIComponent(id)}`,
  );

export const approve = (id: string, reason?: string) =>
  axiosClient.post<AdminPayoutActionResponse>(
    `/admin/payouts/${encodeURIComponent(id)}/approve`,
    { reason },
  );

export const reject = (id: string, reason: string) =>
  axiosClient.post<AdminPayoutResponse>(
    `/admin/payouts/${encodeURIComponent(id)}/reject`,
    { reason },
  );
