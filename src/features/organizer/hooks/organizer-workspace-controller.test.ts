import test from 'node:test'
import assert from 'node:assert/strict'
import { ApiError } from '../../auth/api/api-error.ts'
import { createOrganizerWorkspaceController, maskOrganizerWorkspaceView } from './organizer-workspace-controller.ts'
import type { EventApi } from '../../auth/api/event-api.ts'
import type { OrganizerEvent, OrganizerEventInput } from '../types/organizer-event.ts'

function flush() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

function event(id: string, over: Partial<OrganizerEvent> = {}): OrganizerEvent {
  return { id, title: `Event ${id}`, startsAt: '2026-11-12T12:30:00.000Z', endsAt: '2026-11-12T15:30:00.000Z', venue: 'Nhà hát', city: 'TP. Hồ Chí Minh', status: 'draft', reviewFeedback: null, ...over }
}

function input(over: Partial<OrganizerEventInput> = {}): OrganizerEventInput {
  return { title: 'Sự kiện mới', startsAt: '2026-11-12T12:30:00.000Z', endsAt: '2026-11-12T15:30:00.000Z', venue: 'Nhà hát', city: 'TP. Hồ Chí Minh', categoryId: 'cat-9', provinceId: 'p1', wardId: 'w1', street: 'Số 7', ...over }
}

const tier = { name: 'Vé thường', price: 100000, capacity: 100, perOrderLimit: 4, salesStartAt: '', salesEndAt: '' } as never
const finance = { accountHolder: 'A', accountNumber: '1', bankName: 'VCB', branch: 'HCM', businessType: 'INDIVIDUAL', invoiceName: '', invoiceAddress: '', taxCode: '' }

function stubApi(over: Partial<EventApi> = {}): EventApi {
  const notImpl = (async () => { throw new Error('not implemented') }) as never
  return {
    create: notImpl,
    update: notImpl,
    setPayout: (async () => finance) as never,
    submitReview: notImpl,
    findMine: async () => [],
    findMineById: async () => null,
    findPending: notImpl,
    review: notImpl,
    categories: async () => [],
    locations: async () => [],
    wards: async () => [],
    uploadImage: notImpl,
    createTicketType: notImpl,
    updateTicketType: notImpl,
    findPublic: async () => [],
    findPublicById: async () => null,
    ...over,
  } as EventApi
}

test('rejects an anonymous create with a visible error and never fabricates an event', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi() })
  controller.sync({ userId: null, accessToken: null, status: 'anonymous' })

  const result = await controller.createEvent(input(), [tier], finance)

  assert.equal(result, null)
  assert.equal(controller.getSnapshot().workspace.events.length, 0)
  assert.ok(controller.getSnapshot().saveError, 'expected a visible save error for an anonymous create')
})

test('rejects a create when the API fails and preserves prior server state', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('e1')],
      create: async () => { throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Máy chủ lỗi.' }) },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  assert.equal(controller.getSnapshot().workspace.events.length, 1)

  const result = await controller.createEvent(input(), [tier], finance)

  assert.equal(result, null)
  assert.equal(controller.getSnapshot().workspace.events.length, 1, 'no fabricated event on API failure')
  assert.equal(controller.getSnapshot().saveError, 'Máy chủ lỗi.')
})

test('propagates a successful create without sending organizerId and using the selected category', async () => {
  let captured: { token: string; payload: Record<string, unknown> } | null = null
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      create: async (token, payload) => { captured = { token, payload: payload as unknown as Record<string, unknown> }; return event('new-1', { title: 'Mới' }) },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.createEvent(input({ categoryId: 'cat-9' }), [tier], finance)

  assert.equal(result?.kind, 'event_created')
  assert.equal(controller.getSnapshot().workspace.events[0]?.id, 'new-1')
  assert.equal(captured!.token, 't1')
  assert.equal(captured!.payload.categoryId, 'cat-9')
  assert.equal('organizerId' in captured!.payload, false)
})

test('drops a stale mine load after the signed-in user changes', async () => {
  const staleLoad = deferred<readonly OrganizerEvent[]>()
  const controller = createOrganizerWorkspaceController({
    api: stubApi({ findMine: async (token) => token === 't1' ? staleLoad.promise : [event('u2-event')] }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  controller.sync({ userId: 'u2', accessToken: 't2', status: 'authenticated' })
  await flush()
  staleLoad.resolve([event('u1-stale')])
  await flush()

  assert.deepEqual(controller.getSnapshot().workspace.events.map((item) => item.id), ['u2-event'])
})

test('drops a create result that resolves after the user has switched accounts', async () => {
  const pendingCreate = deferred<OrganizerEvent>()
  const controller = createOrganizerWorkspaceController({
    api: stubApi({ create: async () => pendingCreate.promise, findMine: async () => [] }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  const creating = controller.createEvent(input(), [tier], finance)
  controller.sync({ userId: 'u2', accessToken: 't2', status: 'authenticated' })
  await flush()
  pendingCreate.resolve(event('leaked'))
  const result = await creating

  assert.equal(result, null)
  assert.equal(controller.getSnapshot().workspace.events.some((item) => item.id === 'leaked'), false)
})

test('clears organizer workspace immediately on logout', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  assert.equal(controller.getSnapshot().workspace.events.length, 1)

  controller.sync({ userId: null, accessToken: null, status: 'anonymous' })

  assert.equal(controller.getSnapshot().workspace.events.length, 0)
})

test('keeps same-user work across a token refresh without reloading', async () => {
  let mineCalls = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({ findMine: async () => { mineCalls += 1; return [event('e1')] } }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  assert.equal(mineCalls, 1)

  controller.sync({ userId: 'u1', accessToken: 't2-refreshed', status: 'authenticated' })
  await flush()

  assert.equal(mineCalls, 1, 'a token refresh must not trigger a reload')
  assert.equal(controller.getSnapshot().workspace.events.length, 1)
})

test('surfaces a load error instead of silently seeding mock events', async () => {
  let attempt = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => { attempt += 1; if (attempt === 1) throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Không tải được.' }); return [event('e1')] },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  assert.equal(controller.getSnapshot().workspace.events.length, 0)
  assert.equal(controller.getSnapshot().loadError, 'Không tải được.')

  controller.retry()
  await flush()

  assert.equal(controller.getSnapshot().loadError, null)
  assert.equal(controller.getSnapshot().workspace.events.length, 1)
})

test('reports unsupported operations without mutating workspace data', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const publish = controller.publishEvent('e1')
  const sale = controller.setTicketSaleStatus('tier-1', 'on_sale')
  const checkIn = controller.checkInAttendee('e1', 'att-1')
  const organization = controller.updateOrganization({ name: 'Đổi tên' })

  for (const result of [publish, sale, checkIn, organization]) {
    assert.equal(result?.kind, 'action_not_supported')
    assert.ok(result && 'reason' in result && result.reason)
  }
  assert.equal(controller.getSnapshot().workspace.events.length, 1)
  // Neutral blank shell — no fabricated organization profile (no backend org API yet).
  assert.equal(controller.getSnapshot().workspace.organization.name, '')
})

test('rejects a no-token update with a visible error and no reducer fallback', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi() })
  controller.sync({ userId: null, accessToken: null, status: 'anonymous' })

  const result = await controller.updateEvent('e1', { title: 'X' })

  assert.equal(result, null)
  assert.ok(controller.getSnapshot().saveError)
})

test('routes finance through the payout endpoint on update, never in the event body', async () => {
  let updatePayloadFinance: unknown = 'unset'
  let payoutFinance: unknown = null
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('e1')],
      update: async (_token, _id, payload) => { updatePayloadFinance = (payload as Record<string, unknown>).finance; return event('e1', { title: 'Đã sửa' }) },
      setPayout: async (_token, _id, value) => { payoutFinance = value; return value },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.updateEvent('e1', { title: 'Đã sửa' }, finance)

  assert.equal(result?.kind, 'event_updated')
  assert.deepEqual(payoutFinance, finance)
  assert.equal(updatePayloadFinance, undefined, 'finance must not be sent to the event update path (UpdateEventDto rejects payoutInfo)')
})

test('surfaces a payout failure on update instead of reporting a false full success', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('e1')],
      update: async () => event('e1', { title: 'Đã sửa' }),
      setPayout: async () => { throw new ApiError({ status: 400, code: 'EVENT_REQUEST_FAILED', message: 'Không lưu được thông tin thanh toán.' }) },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.updateEvent('e1', { title: 'Đã sửa' }, finance)

  assert.equal(result, null, 'a partial failure must not be reported as event_updated')
  assert.equal(controller.getSnapshot().saveError, 'Không lưu được thông tin thanh toán.')
})

test('does not drop a just-created event when an in-flight mine load resolves late', async () => {
  const pendingLoad = deferred<readonly OrganizerEvent[]>()
  let mineCalls = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => { mineCalls += 1; return mineCalls === 1 ? pendingLoad.promise : [event('server-1'), event('created-1', { title: 'Mới' })] },
      create: async () => event('created-1', { title: 'Mới' }),
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.createEvent(input(), [tier], finance)
  assert.equal(result?.kind, 'event_created')
  assert.equal(controller.getSnapshot().workspace.events.some((item) => item.id === 'created-1'), true)

  // The initial load, started before the create, resolves late without the created event.
  pendingLoad.resolve([event('server-1')])
  await flush()
  await flush()

  assert.equal(controller.getSnapshot().workspace.events.some((item) => item.id === 'created-1'), true, 'the created event must survive a stale load')
})

test('snapshot carries its owning userId so a stale view can be detected before effects flush', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  assert.equal(controller.getSnapshot().userId, 'u1')
})

test('maskOrganizerWorkspaceView blanks a snapshot whose owner is not the current auth user', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  const snapshot = controller.getSnapshot()
  assert.equal(snapshot.workspace.events.length, 1)

  // The auth store already reports u2, but the controller effect has not run yet:
  // the snapshot still belongs to u1. The masked view must hide u1's data.
  const masked = maskOrganizerWorkspaceView(snapshot, 'u2')

  assert.equal(masked.workspace.events.length, 0)
  assert.equal(masked.loading, true, 'a pending identity change reads as loading, not a false empty list')
  assert.equal(masked.loadError, null)
  assert.equal(masked.lastOperation, null)
})

test('maskOrganizerWorkspaceView passes a matching-owner snapshot through unchanged', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  const snapshot = controller.getSnapshot()

  const masked = maskOrganizerWorkspaceView(snapshot, 'u1')

  assert.equal(masked.workspace.events.length, 1)
  assert.equal(masked, snapshot, 'a matching view is returned as-is')
})

test('maskOrganizerWorkspaceView blanks an anonymous view when no auth user is present', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const masked = maskOrganizerWorkspaceView(controller.getSnapshot(), null)

  assert.equal(masked.workspace.events.length, 0)
  assert.equal(masked.loading, false, 'no current user is not a loading state')
})
