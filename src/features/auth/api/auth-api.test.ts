import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createAuthApi } from './auth-api.ts'

test('login sends backend credentials and returns session', async () => {
  let request: RequestInit | undefined
  const api = createAuthApi('/api', async (_input, init) => {
    request = init
    return new Response(JSON.stringify({ user: { id: 'u1', fullName: 'A', email: 'a@example.com' }, accessToken: 'token', expiresIn: 900 }), { status: 200, headers: { 'content-type': 'application/json' } })
  })

  const result = await api.login({ email: 'a@example.com', password: 'password123' })

  assert.equal(result.accessToken, 'token')
  assert.equal(request?.credentials, 'include')
  assert.equal(request?.method, 'POST')
  assert.deepEqual(JSON.parse(String(request?.body)), { email: 'a@example.com', password: 'password123' })
})

test('create event sends bearer token and backend field names', async () => {
  let request: RequestInit | undefined
  const api = createAuthApi('/api', async (_input, init) => {
    request = init
    return new Response(JSON.stringify({ event: { id: 'e1' } }), { status: 201, headers: { 'content-type': 'application/json' } })
  })

  await api.createEvent('token', { title: 'Demo', startsAt: '2026-10-01T10:00:00.000Z', endsAt: '2026-10-01T12:00:00.000Z', venue: 'Hall', city: 'Hanoi' })

  assert.equal(new Headers(request?.headers).get('authorization'), 'Bearer token')
  assert.deepEqual(JSON.parse(String(request?.body)), { title: 'Demo', slug: 'demo', startAt: '2026-10-01T10:00:00.000Z', endAt: '2026-10-01T12:00:00.000Z', venueName: 'Hall', visibility: 'PUBLIC' })
})
