import test from 'node:test'
import assert from 'node:assert/strict'
import { createAuthApi } from './auth-api.ts'
import { ApiError } from './api-error.ts'

const attendee = {
  id: 'attendee-1',
  email: 'linh@example.com',
  fullName: 'Linh Nguyễn',
  phone: null,
  role: 'USER' as const,
  status: 'ACTIVE' as const,
}

test('auth API sends JSON credentials and forwards a bearer token for me', async () => {
  const requests: Array<{ url: string; init: RequestInit }> = []
  const api = createAuthApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url, init) => {
      requests.push({ url: String(url), init: init ?? {} })
      return Response.json(url.toString().endsWith('/me') ? { user: attendee } : { user: attendee, accessToken: 'access-1', expiresIn: 3600 })
    },
  })

  const login = await api.login({ email: 'linh@example.com', password: 'correct-horse' })
  const current = await api.me(login.accessToken)

  assert.equal(login.user.fullName, 'Linh Nguyễn')
  assert.equal(current.email, 'linh@example.com')
  assert.deepEqual(requests[0], {
    url: 'https://api.example.test/api/auth/login',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: 'linh@example.com', password: 'correct-horse' }),
    },
  })
  assert.equal(requests[1]?.init.headers instanceof Headers ? requests[1].init.headers.get('Authorization') : (requests[1]?.init.headers as Record<string, string>).Authorization, 'Bearer access-1')
  assert.equal(requests[1]?.init.credentials, 'include')
})

test('auth API recognizes default Nest unauthorized responses', async () => {
  const api = createAuthApi({ baseUrl: '/api', fetch: async () => Response.json({ statusCode: 401, message: 'Unauthorized' }, { status: 401 }) })
  await assert.rejects(() => api.refresh(), (error: unknown) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'UNAUTHENTICATED')
    return true
  })
})

test('auth API maps structured and unavailable-server errors to ApiError', async () => {
  const structured = createAuthApi({
    baseUrl: '/api',
    fetch: async () => Response.json({ statusCode: 409, code: 'EMAIL_ALREADY_REGISTERED', message: 'Email đã tồn tại.', fieldErrors: { email: 'Email đã được dùng.' } }, { status: 409 }),
  })
  await assert.rejects(() => structured.register({ fullName: 'Linh Nguyễn', email: 'linh@example.com', password: 'correct-horse' }), (error: unknown) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'EMAIL_ALREADY_REGISTERED')
    assert.equal(error.fieldErrors.email, 'Email đã được dùng.')
    return true
  })

  const unavailable = createAuthApi({ baseUrl: '/api', fetch: async () => new Response('<html>offline</html>', { status: 503, headers: { 'Content-Type': 'text/html' } }) })
  await assert.rejects(() => unavailable.refresh(), (error: unknown) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'SERVER_UNAVAILABLE')
    return true
  })
})
