import axios from 'axios'
import { useCallback, useEffect, useRef, useState } from 'react'
import { logout, refresh } from '../api/authApi.ts'
import type { AttendeeUser } from '../types/authContract.ts'

export type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'

const api = { refresh, logout }

export function useAuth(enabled = true) {
  const [status, setStatus] = useState<AuthStatus>('restoring')
  const [user, setUser] = useState<AttendeeUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [error, setError] = useState<{ message: string } | null>(null)
  const [canRetry, setCanRetry] = useState(false)
  const restorePromise = useRef<Promise<void> | null>(null)

  const refresh = useCallback(async () => {
    setStatus('restoring')
    try {
      const session = await api.refresh()
      setAccessToken(session.accessToken)
      localStorage.setItem('accessToken', session.accessToken)
      setUser(session.user)
      setStatus('authenticated')
      setError(null)
      setCanRetry(false)
    } catch (cause) {
      setAccessToken(null)
      localStorage.removeItem('accessToken')
      setUser(null)
      setStatus('anonymous')
      if (axios.isAxiosError(cause) && cause.response?.status === 401) {
        setError(null)
        setCanRetry(false)
      } else {
        setError({
          message:
            cause instanceof Error
              ? cause.message
              : 'Không thể khôi phục phiên đăng nhập.',
        })
        setCanRetry(true)
      }
    }
  }, [])

  useEffect(() => {
    if (enabled) restorePromise.current ??= refresh()
  }, [enabled, refresh])

  async function logout() {
    setAccessToken(null)
    localStorage.removeItem('accessToken')
    setUser(null)
    setStatus('anonymous')
    setError(null)
    setCanRetry(false)
    try {
      await api.logout()
    } catch (cause) {
      setError({
        message:
          cause instanceof Error
            ? cause.message
            : 'Không thể xác nhận đăng xuất trên máy chủ.',
      })
    }
  }

  return { status, user, accessToken, error, canRetry, refresh, logout }
}
