import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { me } from "../api/authApi.ts";
import { setAccessToken as setClientAccessToken } from "../../../api/axiosClient.ts";
import type { AttendeeUser } from "../types/authContract.ts";

export type AuthStatus = "restoring" | "anonymous" | "authenticated";

const ACCESS_TOKEN_KEY = "ticketly_access_token";

function readAccessToken(): string | null {
  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function useAuth(enabled = true) {
  const [status, setStatus] = useState<AuthStatus>("restoring");
  const [user, setUser] = useState<AttendeeUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<{ message: string } | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const restorePromise = useRef<Promise<void> | null>(null);

  const authenticate = useCallback(
    (session: { accessToken: string; user: AttendeeUser }) => {
      setAccessToken(session.accessToken);
      setClientAccessToken(session.accessToken);
      setUser(session.user);
      setStatus("authenticated");
      setError(null);
      setCanRetry(false);
    },
    [],
  );

  const refresh = useCallback(async () => {
    setStatus("restoring");
    const token = readAccessToken();
    if (!token) {
      setAccessToken(null);
      setClientAccessToken(null);
      setUser(null);
      setStatus("anonymous");
      setError(null);
      setCanRetry(false);
      return;
    }

    setClientAccessToken(token);
    try {
      const session = await me(token);
      authenticate({ accessToken: token, user: session.user });
    } catch (cause) {
      setAccessToken(null);
      setClientAccessToken(null);
      setUser(null);
      setStatus("anonymous");
      if (axios.isAxiosError(cause) && cause.response?.status === 401) {
        setError(null);
        setCanRetry(false);
      } else {
        setError({
          message:
            cause instanceof Error
              ? cause.message
              : "Không thể khôi phục phiên đăng nhập.",
        });
        setCanRetry(true);
      }
    }
  }, [authenticate]);

  useEffect(() => {
    if (enabled) restorePromise.current ??= refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setAccessToken(null);
      setClientAccessToken(null);
      setUser(null);
      setStatus("anonymous");
      setError(null);
      setCanRetry(false);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const logout = useCallback(async () => {
    setAccessToken(null);
    setClientAccessToken(null);
    setUser(null);
    setStatus("anonymous");
    setError(null);
    setCanRetry(false);
  }, []);

  return {
    status,
    user,
    accessToken,
    error,
    canRetry,
    refresh,
    authenticate,
    logout,
  };
}
