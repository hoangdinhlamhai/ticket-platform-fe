import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { createAuthApi } from '../api/auth-api.ts'
import { createAuthSessionController } from '../api/session-controller.ts'

const controller = createAuthSessionController({
  api: createAuthApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch }),
  timer: { setTimeout: (callback, delay) => window.setTimeout(callback, delay), clearTimeout: (id) => window.clearTimeout(id) },
  withCookieLock: (operation) => navigator.locks
    ? navigator.locks.request('ticketly:auth-cookie', operation)
    : operation(),
})

export function useAttendeeAuth(enabled = true) {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)

  useEffect(() => { if (enabled) void controller.restore() }, [enabled])

  return useMemo(() => ({
    ...snapshot,
    login: controller.login,
    register: controller.register,
    refresh: controller.retry,
    logout: controller.logout,
    me: controller.me,
  }), [snapshot])
}

export function useAttendeeLogout() {
  return useCallback(() => controller.logout(), [])
}
