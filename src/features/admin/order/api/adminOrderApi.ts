import axiosClient from '../../../../api/axiosClient.ts';
import type { AdminOrderQuery } from '../types/admin-order.ts';

export const findOrders = (params: AdminOrderQuery = {}) =>
  axiosClient.get<{
    orders: readonly Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
  }>('/admin/orders', { params });

export const findOrder = (id: string) =>
  axiosClient.get<{ order: Record<string, unknown> }>(
    `/admin/orders/${encodeURIComponent(id)}`,
  );
