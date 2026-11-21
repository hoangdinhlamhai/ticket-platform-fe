import axiosClient from '../../../../api/axiosClient.ts';
import type { AdminPaymentQuery } from '../types/admin-payment.ts';

export const findPayments = (params: AdminPaymentQuery = {}) =>
  axiosClient.get<{
    payments: readonly Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
  }>('/admin/payments', { params });

export const findPayment = (id: string) =>
  axiosClient.get<{ payment: Record<string, unknown> }>(
    `/admin/payments/${encodeURIComponent(id)}`,
  );
