import assert from 'node:assert/strict'
import test from 'node:test'
import { ApiError } from './api-error.ts'
import type { AttendeeUser, AuthSessionResponse } from './auth-contract.ts'
import type { AuthApi } from './auth-api.ts'
import { createAuthSessionController } from './session-controller.ts'

const attendee: AttendeeUser = {
  id: 'attendee-1',
  email: 'linh@example.com',
  fullName: 'Linh Nguyễn',
  phone: null,
  role: 'ATTENDEE',
  status: 'ACTIVE',
}

function session(accessToken = 'access-1', expiresIn = 3600): AuthSessionResponse {
  return { user: attendee, accessToken, expiresIn }
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => { resolve = resolvePromise; reject = rejectPromise })
  return { promise, resolve, reject }
}

function authApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    login: async () => session(),
    register: async () => session(),
    refresh: async () => session(),
    logout: async () => undefined,
    me: async () => attendee,
    ...overrides,
  }
}

function timerHarness() {
  const callbacks = new Map<number, () => void>()
  const delays: number[] = []
  let nextId = 1
  return {
    callbacks,
    delays,
    timer: {
      setTimeout(callback: () => void, delay: number) { const id = nextId++; delays.push(delay); callbacks.set(id, callback); return id },
      clearTimeout(id: number) { callbacks.delete(id) },
    },
    runOnly() {
      assert.equal(callbacks.size, 1)
      const callback = [...callbacks.values()][0]!
      callbacks.clear()
      callback()
    },
  }
}

test('shares bootstrap refresh under StrictMode-style setup cleanup setup', async () => {
  const pending = deferred<AuthSessionResponse>()
  let refreshCalls = 0
  const controller = createAuthSessionController({
    api: authApi({ refresh: async () => { refreshCalls += 1; return pending.promise } }),
    timer: timerHarness().timer,
  })

  const firstSetup = controller.restore()
  const secondSetup = controller.restore()
  assert.equal(refreshCalls, 1)
  assert.equal(controller.getSnapshot().status, 'restoring')

  pending.resolve(session())
  await Promise.all([firstSetup, secondSetup])
  assert.deepEqual(controller.getSnapshot(), {
    status: 'authenticated',
    user: attendee,
    error: null,
    canRetry: false,
  })
})

test('treats an unauthenticated bootstrap response as anonymous rather than a false error', async () => {
  const controller = createAuthSessionController({
    api: authApi({ refresh: async () => { throw new ApiError({ status: 401, code: 'UNAUTHENTICATED', message: 'Missing refresh cookie' }) } }),
    timer: timerHarness().timer,
  })

  await controller.restore()

  assert.deepEqual(controller.getSnapshot(), { status: 'anonymous', user: null, error: null, canRetry: false })
})

test('serializes logout after a pending refresh and never resurrects that stale refresh session', async () => {
  const pendingRefresh = deferred<AuthSessionResponse>()
  let logoutCalls = 0
  const controller = createAuthSessionController({
    api: authApi({
      refresh: async () => pendingRefresh.promise,
      logout: async () => { logoutCalls += 1 },
    }),
    timer: timerHarness().timer,
  })

  const restoring = controller.restore()
  const loggingOut = controller.logout()
  assert.equal(controller.getSnapshot().status, 'anonymous')
  assert.equal(logoutCalls, 0)
  pendingRefresh.resolve(session())
  await Promise.all([restoring, loggingOut])

  assert.equal(logoutCalls, 1)
  assert.deepEqual(controller.getSnapshot(), { status: 'anonymous', user: null, error: null, canRetry: false })
})

test('does not let a late login result recreate a session after logout', async () => {
  const pendingLogin = deferred<AuthSessionResponse>()
  const controller = createAuthSessionController({
    api: authApi({ login: async () => pendingLogin.promise }),
    timer: timerHarness().timer,
  })

  const signingIn = controller.login({ email: attendee.email, password: 'correct-horse' })
  const loggingOut = controller.logout()
  pendingLogin.resolve(session())
  const signedIn = await signingIn
  await loggingOut

  assert.equal(signedIn, false)
  assert.equal(controller.getSnapshot().status, 'anonymous')
  assert.equal(controller.getSnapshot().user, null)
})

test('schedules a single refresh before expiry after authentication', async () => {
  const timers = timerHarness()
  const controller = createAuthSessionController({ api: authApi(), timer: timers.timer, now: () => 10_000, refreshSkewMs: 60_000 })

  await controller.login({ email: attendee.email, password: 'correct-horse' })

  assert.deepEqual(timers.delays, [3_540_000])
  assert.equal(timers.callbacks.size, 1)
})

test('avoids an immediate refresh loop when expiry is shorter than the refresh skew', async () => {
  const timers = timerHarness()
  const controller = createAuthSessionController({ api: authApi({ login: async () => session('access-1', 30) }), timer: timers.timer, now: () => 10_000, refreshSkewMs: 60_000 })

  await controller.login({ email: attendee.email, password: 'correct-horse' })

  assert.deepEqual(timers.delays, [15_000])
})

test('keeps a valid in-memory session on a retryable refresh outage without scheduling an automatic retry loop', async () => {
  const timers = timerHarness()
  let refreshCalls = 0
  const controller = createAuthSessionController({
    api: authApi({
      refresh: async () => {
        refreshCalls += 1
        throw new ApiError({ status: 503, code: 'SERVER_UNAVAILABLE', message: 'Maintenance' })
      },
    }),
    timer: timers.timer,
    refreshSkewMs: 60_000,
  })

  await controller.login({ email: attendee.email, password: 'correct-horse' })
  timers.runOnly()
  await Promise.resolve()
  await Promise.resolve()

  assert.equal(refreshCalls, 1)
  assert.deepEqual(controller.getSnapshot(), {
    status: 'authenticated',
    user: attendee,
    error: { kind: 'retryable', message: 'Maintenance', fieldErrors: {} },
    canRetry: true,
  })
  assert.equal(timers.callbacks.size, 1)
})

test('clears a session rejected as inactive instead of retaining authenticated identity', async () => {
  const controller = createAuthSessionController({
    api: authApi({ refresh: async () => { throw new ApiError({ status: 403, code: 'ACCOUNT_INACTIVE', message: 'Account disabled' }) } }),
    timer: timerHarness().timer,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })
  await controller.retry()
  assert.equal(controller.getSnapshot().status, 'anonymous')
  assert.equal(controller.getSnapshot().user, null)
})

test('expires a retained session after a temporary refresh outage', async () => {
  let clock = 0
  const timers = timerHarness()
  const controller = createAuthSessionController({
    api: authApi({ refresh: async () => { throw new ApiError({ status: 503, code: 'SERVER_UNAVAILABLE', message: 'Maintenance' }) } }),
    timer: timers.timer,
    now: () => clock,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })
  await controller.retry()
  assert.equal(controller.getSnapshot().status, 'authenticated')
  clock = 3_600_000
  timers.runOnly()
  assert.equal(controller.getSnapshot().status, 'anonymous')
  assert.equal(controller.getSnapshot().canRetry, true)
})

test('clears an authenticated session when me reports an expired bearer token', async () => {
  const controller = createAuthSessionController({
    api: authApi({ me: async () => { throw new ApiError({ status: 401, code: 'UNAUTHENTICATED', message: 'Expired' }) } }),
    timer: timerHarness().timer,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })

  await controller.me()

  assert.deepEqual(controller.getSnapshot(), {
    status: 'anonymous',
    user: null,
    error: { kind: 'authentication', message: 'Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại.', fieldErrors: {} },
    canRetry: false,
  })
})

test('surfaces a login API error to the form while retaining mapped session error state', async () => {
  const duplicateEmail = new ApiError({ status: 409, code: 'EMAIL_ALREADY_REGISTERED', message: 'Email đã tồn tại.', fieldErrors: { email: 'Email đã được dùng.' } })
  const controller = createAuthSessionController({
    api: authApi({ login: async () => { throw duplicateEmail } }),
    timer: timerHarness().timer,
  })

  await assert.rejects(() => controller.login({ email: attendee.email, password: 'correct-horse' }), duplicateEmail)

  assert.deepEqual(controller.getSnapshot(), {
    status: 'anonymous',
    user: null,
    error: { kind: 'authentication', message: 'Email đã tồn tại.', fieldErrors: { email: 'Email đã được dùng.' } },
    canRetry: false,
  })
})

test('clears memory and blocks silent restore when server logout fails', async () => {
  let refreshCalls = 0
  const controller = createAuthSessionController({
    api: authApi({
      refresh: async () => { refreshCalls += 1; return session() },
      logout: async () => { throw new ApiError({ status: 503, code: 'SERVER_UNAVAILABLE', message: 'Cannot revoke now' }) },
    }),
    timer: timerHarness().timer,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })

  await controller.logout()
  await controller.restore()

  assert.equal(refreshCalls, 0)
  assert.deepEqual(controller.getSnapshot(), {
    status: 'anonymous',
    user: null,
    error: { kind: 'logout', message: 'Không thể xác nhận đăng xuất trên máy chủ. Phiên trên thiết bị này đã được xóa.', fieldErrors: {} },
    canRetry: false,
  })
})

test('does not clear a newly refreshed session when an older me request fails', async () => {
  const pendingMe = deferred<AttendeeUser>()
  const controller = createAuthSessionController({
    api: authApi({ me: () => pendingMe.promise, refresh: async () => session('access-2') }),
    timer: timerHarness().timer,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })
  const checking = controller.me()
  await controller.retry()
  pendingMe.reject(new ApiError({ status: 401, code: 'UNAUTHENTICATED', message: 'Old token expired' }))
  await checking
  assert.equal(controller.getSnapshot().status, 'authenticated')
})

test('me clears identity when the backend revokes attendee privileges', async () => {
  const controller = createAuthSessionController({
    api: authApi({ me: async () => { throw new ApiError({ status: 403, code: 'ATTENDEE_ONLY', message: 'Role changed' }) } }),
    timer: timerHarness().timer,
  })
  await controller.login({ email: attendee.email, password: 'correct-horse' })
  await controller.me()
  assert.equal(controller.getSnapshot().status, 'anonymous')
  assert.equal(controller.getSnapshot().user, null)
})

test('serializes shared-cookie refreshes across independent tab controllers', async () => {
  let cookieVersion = 0
  let lockTail: Promise<unknown> = Promise.resolve()
  const withCookieLock = <T>(operation: () => Promise<T>): Promise<T> => {
    const next = lockTail.then(operation, operation)
    lockTail = next.then(() => undefined, () => undefined)
    return next
  }
  const api = authApi({ refresh: async () => {
    const submitted = cookieVersion
    await Promise.resolve()
    if (submitted !== cookieVersion) throw new ApiError({ status: 401, code: 'UNAUTHENTICATED', message: 'Refresh replay' })
    cookieVersion += 1
    return session(`access-${cookieVersion}`)
  } })
  const firstTab = createAuthSessionController({ api, timer: timerHarness().timer, withCookieLock })
  const secondTab = createAuthSessionController({ api, timer: timerHarness().timer, withCookieLock })
  await Promise.all([firstTab.restore(), secondTab.restore()])
  assert.equal(firstTab.getSnapshot().status, 'authenticated')
  assert.equal(secondTab.getSnapshot().status, 'authenticated')
  assert.equal(cookieVersion, 2)
})
