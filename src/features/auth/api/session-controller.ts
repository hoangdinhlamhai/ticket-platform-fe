import { ApiError, isRetryableApiError } from './api-error.ts'
import type { AuthApi } from './auth-api.ts'
import type { AttendeeUser, AuthSessionResponse, LoginPayload, RegisterPayload } from './auth-contract.ts'

export type AuthStatus = 'restoring' | 'anonymous' | 'authenticated'
export type SessionError = { kind: 'authentication' | 'retryable' | 'logout' | 'validation'; message: string; fieldErrors: Record<string, string> }
export type SessionSnapshot = { status: AuthStatus; user: AttendeeUser | null; error: SessionError | null; canRetry: boolean }

type Timer = { setTimeout: (callback: () => void, delay: number) => ReturnType<typeof setTimeout>; clearTimeout: (id: ReturnType<typeof setTimeout>) => void }
type CookieLock = <T>(operation: () => Promise<T>) => Promise<T>
type Options = { api: AuthApi; timer: Timer; now?: () => number; refreshSkewMs?: number; withCookieLock?: CookieLock }

function errorDetail(error: unknown, fallback: string): SessionError {
  if (error instanceof ApiError) {
    return {
      kind: isRetryableApiError(error) ? 'retryable' : 'authentication',
      message: error.message || fallback,
      fieldErrors: error.fieldErrors,
    }
  }
  return { kind: 'retryable', message: fallback, fieldErrors: {} }
}

export function createAuthSessionController({ api, timer, now = () => Date.now(), refreshSkewMs = 60_000, withCookieLock = (operation) => operation() }: Options) {
  let snapshot: SessionSnapshot = { status: 'anonymous', user: null, error: null, canRetry: false }
  let accessToken: string | null = null
  let expiresAt = 0
  let generation = 0
  let refreshPromise: Promise<void> | null = null
  let logoutPromise: Promise<void> | null = null
  let refreshTimer: ReturnType<typeof setTimeout> | null = null
  let cookieOperation: Promise<void> | null = null
  let blockedRestore = false
  const listeners = new Set<() => void>()

  function serializeCookieOperation<T>(operation: () => Promise<T>) {
    let next: Promise<T>
    if (cookieOperation) {
      next = cookieOperation.then(() => withCookieLock(operation), () => withCookieLock(operation))
    } else {
      try { next = withCookieLock(operation) } catch (error) { next = Promise.reject(error) }
    }
    const tail = next.then(() => undefined, () => undefined)
    cookieOperation = tail
    void tail.then(() => { if (cookieOperation === tail) cookieOperation = null })
    return next
  }

  function emit() { listeners.forEach((listener) => listener()) }
  function set(next: SessionSnapshot) { snapshot = next; emit() }
  function clearTimer() { if (refreshTimer !== null) { timer.clearTimeout(refreshTimer); refreshTimer = null } }
  function clearSession(error: SessionError | null = null) {
    clearTimer()
    accessToken = null
    expiresAt = 0
    set({ status: 'anonymous', user: null, error, canRetry: Boolean(error?.kind === 'retryable') })
  }
  function schedule() {
    clearTimer()
    const remaining = Math.max(0, expiresAt - now())
    const delay = Math.max(1_000, remaining - Math.min(refreshSkewMs, remaining / 2))
    refreshTimer = timer.setTimeout(() => { void refresh(false) }, delay)
  }
  function applySession(result: AuthSessionResponse, currentGeneration: number) {
    if (currentGeneration !== generation) return false
    accessToken = result.accessToken
    blockedRestore = false
    expiresAt = now() + result.expiresIn * 1_000
    set({ status: 'authenticated', user: result.user, error: null, canRetry: false })
    schedule()
    return true
  }
  async function refresh(bootstrap: boolean) {
    if (blockedRestore && bootstrap) return
    if (refreshPromise) return refreshPromise
    const currentGeneration = generation
    if (bootstrap && snapshot.status !== 'authenticated') set({ status: 'restoring', user: null, error: null, canRetry: false })
    refreshPromise = (async () => {
      try {
        applySession(await serializeCookieOperation(() => api.refresh()), currentGeneration)
      } catch (error) {
        if (currentGeneration !== generation) return
        if (error instanceof ApiError && error.code === 'UNAUTHENTICATED') {
          clearSession()
          return
        }
        const detail = errorDetail(error, 'Không thể khôi phục phiên đăng nhập. Vui lòng thử lại.')
        if (detail.kind === 'retryable' && snapshot.status === 'authenticated' && accessToken && expiresAt > now()) {
          clearTimer()
          set({ ...snapshot, error: detail, canRetry: true })
          refreshTimer = timer.setTimeout(() => {
            if (currentGeneration === generation) clearSession(detail)
          }, expiresAt - now())
        } else {
          clearSession(detail)
        }
      } finally {
        refreshPromise = null
      }
    })()
    return refreshPromise
  }
  async function authenticate(operation: () => Promise<AuthSessionResponse>) {
    const currentGeneration = ++generation
    try { return applySession(await serializeCookieOperation(operation), currentGeneration) } catch (error) {
      if (currentGeneration !== generation) return false
      clearSession(errorDetail(error, 'Không thể xác thực. Vui lòng thử lại.'))
      throw error
    }
  }

  return {
    getAccessToken: () => accessToken,
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener) },
    restore: () => refresh(true),
    retry: () => refresh(false),
    login: (payload: LoginPayload) => authenticate(() => api.login(payload)),
    register: (payload: RegisterPayload) => authenticate(() => api.register(payload)),
    async me() {
      const currentGeneration = generation
      const requestedToken = accessToken
      if (!requestedToken) return null
      try {
        const user = await api.me(requestedToken)
        if (currentGeneration !== generation || requestedToken !== accessToken) return null
        set({ ...snapshot, status: 'authenticated', user })
        return user
      } catch (error) {
        if (currentGeneration === generation && requestedToken === accessToken && error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession({ kind: 'authentication', message: 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.', fieldErrors: {} })
        }
        return null
      }
    },
    async logout() {
      if (logoutPromise) return logoutPromise
      ++generation
      blockedRestore = true
      clearSession()
      logoutPromise = (async () => {
        try { await serializeCookieOperation(() => api.logout()) }
        catch {
          set({ status: 'anonymous', user: null, error: { kind: 'logout', message: 'Không thể xác nhận đăng xuất trên máy chủ. Phiên trên thiết bị này đã được xóa.', fieldErrors: {} }, canRetry: false })
        } finally { logoutPromise = null }
      })()
      return logoutPromise
    },
  }
}
