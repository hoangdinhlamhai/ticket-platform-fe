import axios from "axios";

const ACCESS_TOKEN_KEY = "ticketly_access_token";

function readStoredAccessToken(): string | null {
  try {
    return typeof window === "undefined"
      ? null
      : window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

let accessToken: string | null = readStoredAccessToken();

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (typeof window === "undefined") return;
    if (token) window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // Keep the in-memory session usable when browser storage is unavailable.
  }
}

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? "/api",
});

axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !/\/auth\/(login|register)(?:\?|$)/.test(error.config?.url ?? "")
    ) {
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    }
    throw error;
  },
);

export default axiosClient;
