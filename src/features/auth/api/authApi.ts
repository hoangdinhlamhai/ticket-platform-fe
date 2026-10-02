import axiosClient from "../../../api/axiosClient.ts";
import type {
  AttendeeUser,
  AuthSessionResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/authContract.ts";

export async function login(payload: LoginPayload): Promise<AuthSessionResponse> {
  const response = await axiosClient.post<AuthSessionResponse>("/auth/login", payload, { withCredentials: true });
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthSessionResponse> {
  const response = await axiosClient.post<AuthSessionResponse>("/auth/register", payload, { withCredentials: true });
  return response.data;
}

export async function refresh(): Promise<AuthSessionResponse> {
  const response = await axiosClient.post<AuthSessionResponse>("/auth/refresh", {}, { withCredentials: true });
  return response.data;
}

export async function logout(): Promise<void> {
  const response = await axiosClient.post<void>("/auth/logout", {}, { withCredentials: true });
  return response.data;
}

export async function me(accessToken: string): Promise<{ user: AttendeeUser }> {
  const response = await axiosClient.get<{ user: AttendeeUser }>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true,
  });
  return response.data;
}
