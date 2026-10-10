import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminPayoutResponse,
  PendingPayoutsResponse,
} from "../types/admin-payout.ts";

export const findPending = () =>
  axiosClient.get<PendingPayoutsResponse>("/admin/payouts/pending");

export const findById = (id: string) =>
  axiosClient.get<AdminPayoutResponse>(
    `/admin/payouts/${encodeURIComponent(id)}`,
  );
