import axiosClient from "../../../api/axiosClient.ts";

export type OrganizerPayoutRecord = {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
  grossAmount: string | number | null;
  refundAmount: string | number | null;
  platformFee: string | number | null;
  paymentFee: string | number | null;
  createdAt: string;
  completedAt: string | null;
  event: { id: string; title: string; endAt: string };
};

export type OrganizerPayoutsResponse = {
  payouts: readonly OrganizerPayoutRecord[];
};

export const findMine = () =>
  axiosClient.get<OrganizerPayoutsResponse>("/payouts/mine");
