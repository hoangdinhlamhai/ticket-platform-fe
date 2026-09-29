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
    reporting: notImpl,
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

test('hydrates owned event ticket tiers from detail responses', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-1')],
      findMineById: async () => ({
        event: event('evt-1'),
        ticketTypes: [{ id: 'server-tier-1', name: 'VIP', price: 250000, quantity: 40, description: 'Gần sân khấu', image: 'vip.png', minPerOrder: 2, maxPerOrder: 5, saleStartAt: '2026-10-01T00:00:00.000Z', saleEndAt: '2026-11-01T00:00:00.000Z' }],
        seatMap: null,
        payoutInfo: null,
      }),
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await flush()

  assert.deepEqual(controller.getSnapshot().workspace.ticketTiers, [{
    id: 'server-tier-1', eventId: 'evt-1', name: 'VIP', price: 250000, capacity: 40,
    soldCount: 0, saleStatus: 'scheduled', salesStartAt: '2026-10-01T00:00:00.000Z',
    salesEndAt: '2026-11-01T00:00:00.000Z', minPerOrder: 2, perOrderLimit: 5,
    description: 'Gần sân khấu', image: 'vip.png',
  }])
})

test('publishes the event list when a per-event detail request fails, without a false whole-list error', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({ findMine: async () => [event('evt-1')], findMineById: async () => { throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Không tải được vé.' }) } }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await flush()

  // Best-effort detail hydration: a single detail 500 must not blank the whole event
  // list or read as a whole-list failure. The event still shows; only its tiers are absent.
  assert.equal(controller.getSnapshot().workspace.events.length, 1, 'the event list must survive a single detail failure')
  assert.equal(controller.getSnapshot().workspace.events[0]?.id, 'evt-1')
  assert.equal(controller.getSnapshot().workspace.ticketTiers.length, 0)
  assert.equal(controller.getSnapshot().loadError, null, 'a single detail 500 is not a whole-list failure')
  assert.equal(controller.getSnapshot().loading, false)
})

test('hydrates the details that succeed while tolerating one that fails', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-ok'), event('evt-bad')],
      findMineById: async (_token, id) => {
        if (id === 'evt-bad') throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Không tải được vé.' })
        return { event: event('evt-ok'), ticketTypes: [{ id: 'tier-ok', name: 'VIP', price: 250000, quantity: 40 }], seatMap: null, payoutInfo: null }
      },
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await flush()

  const snapshot = controller.getSnapshot()
  assert.deepEqual(snapshot.workspace.events.map((item) => item.id).sort(), ['evt-bad', 'evt-ok'], 'both events remain published')
  assert.equal(snapshot.workspace.ticketTiers.filter((tier) => tier.eventId === 'evt-ok').length, 1, 'the successful detail is hydrated')
  assert.equal(snapshot.workspace.ticketTiers.some((tier) => tier.id === 'tier-ok'), true)
  assert.equal(snapshot.loadError, null, 'a partial detail failure is not a whole-list failure')
})

test('surfaces a whole-list load error when findMine itself fails', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({ findMine: async () => { throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Không tải được danh sách.' }) } }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await flush()

  assert.equal(controller.getSnapshot().workspace.events.length, 0)
  assert.equal(controller.getSnapshot().loadError, 'Không tải được danh sách.')
})

test('drops a detail hydration after the signed-in user changes', async () => {
  const pendingDetail = deferred<import('../../auth/api/event-api.ts').OrganizerEventOwnerDetail | null>()
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async (token) => token === 't1' ? [event('u1-event')] : [event('u2-event')],
      findMineById: async (token) => token === 't1' ? pendingDetail.promise : null,
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  controller.sync({ userId: 'u2', accessToken: 't2', status: 'authenticated' })
  await flush()
  pendingDetail.resolve({ event: event('u1-event'), ticketTypes: [{ id: 'leaked-tier', name: 'Không được lộ', price: 1, quantity: 1 }], seatMap: null, payoutInfo: null })
  await flush()

  assert.deepEqual(controller.getSnapshot().workspace.events.map((item) => item.id), ['u2-event'])
  assert.equal(controller.getSnapshot().workspace.ticketTiers.some((item) => item.id === 'leaked-tier'), false)
})

test('keeps a created event once when its follow-up detail read fails', async () => {
  let createCalls = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      create: async () => { createCalls += 1; return event('created-1') },
      findMineById: async (_token, id) => id === 'created-1' ? Promise.reject(new Error('detail unavailable')) : null,
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  const result = await controller.createEvent(input(), [tier], finance)

  assert.equal(result?.kind, 'event_created')
  assert.equal(createCalls, 1)
  assert.equal(controller.getSnapshot().workspace.events.filter((item) => item.id === 'created-1').length, 1)
})

test('hydrates newly created event tiers without creating it a second time', async () => {
  let createCalls = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      create: async () => { createCalls += 1; return event('created-1') },
      findMineById: async () => ({ event: event('created-1'), ticketTypes: [{ id: 'created-tier', name: 'Vé mới', price: 100000, quantity: 10 }], seatMap: null, payoutInfo: null }),
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await controller.createEvent(input(), [tier], finance)
  await flush()

  assert.equal(createCalls, 1)
  assert.equal(controller.getSnapshot().workspace.events.filter((item) => item.id === 'created-1').length, 1)
  assert.equal(controller.getSnapshot().workspace.ticketTiers[0]?.id, 'created-tier')
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

const report = {
  eventId: 'evt-1',
  saleWindow: { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' },
  range: { startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-10T00:00:00.000Z' },
  summary: { revenue: 1500000, paidOrderCount: 3, soldTicketCount: 12, capacity: 100, remainingTicketCount: 88, checkInCount: 4 },
  timeline: [{ startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-06T00:00:00.000Z', revenue: 500000, soldTicketCount: 4 }],
  ticketTypes: [{ id: 'tt-1', name: 'Vé thường', price: 150000, capacity: 50, soldTicketCount: 8, revenue: 1200000 }],
} as const

test('loadEventReport calls the API with the exact ISO bounds and stores the response', async () => {
  let captured: { id: string; range?: { from: string; to: string } } | null = null
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-1')],
      reporting: (async (_token: string, id: string, range?: { from: string; to: string }) => { captured = { id, range }; return report }) as never,
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.loadEventReport('evt-1', { from: '2026-01-05T00:00:00.000Z', to: '2026-01-10T00:00:00.000Z' })

  assert.equal(result?.summary.revenue, 1500000)
  assert.equal(captured!.id, 'evt-1')
  assert.deepEqual(captured!.range, { from: '2026-01-05T00:00:00.000Z', to: '2026-01-10T00:00:00.000Z' })
  assert.equal(controller.getSnapshot().report?.data?.eventId, 'evt-1')
  assert.equal(controller.getSnapshot().report?.error, null)
  assert.equal(controller.getSnapshot().report?.loading, false)
})

test('loadEventReport surfaces an API error without reverting to workspace mock metrics', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-1')],
      reporting: (async () => { throw new ApiError({ status: 500, code: 'EVENT_REQUEST_FAILED', message: 'Không tải được báo cáo.' }) }) as never,
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const result = await controller.loadEventReport('evt-1')

  assert.equal(result, null)
  assert.equal(controller.getSnapshot().report?.error, 'Không tải được báo cáo.')
  assert.equal(controller.getSnapshot().report?.data, null)
})

test('loadEventReport ignores a stale result after a newer report request starts', async () => {
  const first = deferred<typeof report>()
  let call = 0
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-1')],
      reporting: (async () => { call += 1; return call === 1 ? first.promise : { ...report, summary: { ...report.summary, revenue: 999 } } }) as never,
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const stale = controller.loadEventReport('evt-1', { from: report.range.startAt, to: report.range.endAt })
  const fresh = await controller.loadEventReport('evt-1', { from: report.range.startAt, to: report.range.endAt })
  first.resolve(report)
  await stale

  assert.equal(fresh?.summary.revenue, 999)
  assert.equal(controller.getSnapshot().report?.data?.summary.revenue, 999, 'the late stale result must not overwrite the fresh one')
})

test('owner detail maps confirmationMessage into the event and payout into eventFinance', async () => {
  const controller = createOrganizerWorkspaceController({
    api: stubApi({
      findMine: async () => [event('evt-1')],
      findMineById: async () => ({
        event: event('evt-1', { confirmationMessage: 'Cảm ơn bạn đã mua vé.' }),
        ticketTypes: [],
        seatMap: null,
        payoutInfo: { accountHolder: 'Nguyễn A', accountNumber: '123', bankName: 'VCB', branch: 'HCM', businessType: 'INDIVIDUAL', invoiceName: '', invoiceAddress: '', taxCode: '' },
      }),
    }),
  })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()
  await flush()

  const snapshot = controller.getSnapshot()
  assert.equal(snapshot.workspace.events[0]?.confirmationMessage, 'Cảm ơn bạn đã mua vé.')
  assert.equal(snapshot.workspace.eventFinance['evt-1']?.accountHolder, 'Nguyễn A')
})

test('maskOrganizerWorkspaceView blanks an anonymous view when no auth user is present', async () => {
  const controller = createOrganizerWorkspaceController({ api: stubApi({ findMine: async () => [event('e1')] }) })
  controller.sync({ userId: 'u1', accessToken: 't1', status: 'authenticated' })
  await flush()

  const masked = maskOrganizerWorkspaceView(controller.getSnapshot(), null)

  assert.equal(masked.workspace.events.length, 0)
  assert.equal(masked.loading, false, 'no current user is not a loading state')
})
