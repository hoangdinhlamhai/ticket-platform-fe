import axiosClient from "../../../api/axiosClient.ts";
import type {
  AttendeeUser,
  AuthSessionResponse,
  LoginPayload,
  RegisterPayload,
} from "../types/authContract.ts";

export async function login(
  payload: LoginPayload,
): Promise<AuthSessionResponse> {
  const response = await axiosClient.post<AuthSessionResponse>(
    "/auth/login",
    payload,
  );
  return response.data;
}

export async function register(
  payload: RegisterPayload,
): Promise<AuthSessionResponse> {
  const response = await axiosClient.post<AuthSessionResponse>(
    "/auth/register",
    payload,
  );
  return response.data;
}

// Refresh and server logout requests are disabled while access tokens are permanent.

export async function me(accessToken: string): Promise<{ user: AttendeeUser }> {
  const response = await axiosClient.get<{ user: AttendeeUser }>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
}
