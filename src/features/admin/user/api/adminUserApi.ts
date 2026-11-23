import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminUser,
  AdminUserMetrics,
  AdminUserRow,
  AdminUserStatus,
} from "../types/admin-user.ts";

export type AdminUserQuery = {
  q?: string;
  status?: AdminUserStatus;
  organized?: "true" | "false";
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export const findUsers = (params: AdminUserQuery = {}) =>
  axiosClient.get<{
    users: readonly AdminUserRow[];
    total: number;
    page: number;
    pageSize: number;
  }>("/admin/users", { params });

export const findUserMetrics = () =>
  axiosClient.get<AdminUserMetrics>("/admin/users/metrics");

export const findUser = (id: string) =>
  axiosClient.get<{ user: AdminUser }>(
    `/admin/users/${encodeURIComponent(id)}`,
  );

export const setUserStatus = (
  id: string,
  status: AdminUserStatus,
  reason?: string,
) =>
  axiosClient.patch<{ user: AdminUserRow }>(
    `/admin/users/${encodeURIComponent(id)}/status`,
    { status, reason },
  );
