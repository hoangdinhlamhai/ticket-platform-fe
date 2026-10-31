import axiosClient from "../../../api/axiosClient";
import type {
  CreateRefundRequestInput,
  CreateRefundRequestResponse,
  MyRefundRequestsResponse,
} from "../types/refund";

export const createRefundRequest = (
  orderId: string,
  input: CreateRefundRequestInput,
) =>
  axiosClient.post<CreateRefundRequestResponse>(
    `/orders/${encodeURIComponent(orderId)}/refund-requests`,
    input,
  );

export const findMyRefundRequests = () =>
  axiosClient.get<MyRefundRequestsResponse>("/refund-requests/mine");
