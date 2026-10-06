import axios from "axios";
import type { InternalAxiosRequestConfig } from "axios";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? "/api",
});

let refreshPromise: Promise<string> | null = null;

type RetriableRequest = InternalAxiosRequestConfig & {
  _retriedAfterRefresh?: boolean;
};

function isAuthRequest(url: string | undefined): boolean {
  return /\/auth\/(login|register|refresh|logout)(?:\?|$)/.test(url ?? "");
}

axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      throw error;
    }

    const request = error.config as RetriableRequest | undefined;
    if (
      !request ||
      request._retriedAfterRefresh ||
      isAuthRequest(request.url)
    ) {
      throw error;
    }

    request._retriedAfterRefresh = true;
    refreshPromise ??= axios
      .post<{ accessToken: string }>(
        `${axiosClient.defaults.baseURL ?? "/api"}/auth/refresh`,
        {},
        { withCredentials: true },
      )
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((refreshError: unknown) => {
        setAccessToken(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:session-expired"));
        }
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const newToken = await refreshPromise;
    request.headers.set("Authorization", `Bearer ${newToken}`);
    return axiosClient.request(request);
  },
);

export default axiosClient;
