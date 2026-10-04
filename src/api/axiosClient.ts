import axios from "axios";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? "/api",
});

axiosClient.interceptors.request.use((config) => {
  if (accessToken) config.headers.set("Authorization", `Bearer ${accessToken}`);
  return config;
});

export default axiosClient;
