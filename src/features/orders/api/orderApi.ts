import axiosClient from "../../../api/axiosClient";
import type {
  AttendeeOrderDetail,
  AttendeeOrderRecord,
  CreateOrderInput,
  CreateOrderResponse,
} from "../types/order";

export const createOrder = (input: CreateOrderInput) =>
  axiosClient.post<CreateOrderResponse>("/orders", input);

export const findMine = () =>
  axiosClient.get<{ orders: AttendeeOrderRecord[] }>("/orders");

export const findMineById = (id: string) =>
  axiosClient.get<{ order: AttendeeOrderDetail }>(
    `/orders/${encodeURIComponent(id)}`,
  );
