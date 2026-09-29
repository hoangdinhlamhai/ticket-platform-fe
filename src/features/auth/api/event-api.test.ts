import test from 'node:test'
import assert from 'node:assert/strict'
import { createEventApi } from './event-api.ts'

const publicEvent = {
  id: 'event-1',
  title: 'Đêm nhạc mùa thu',
  startAt: '2026-10-17T12:30:00.000Z',
  endAt: '2026-10-17T15:00:00.000Z',
  venueName: 'Nhà hát Thành phố',
  thumbnail: null,
  category: { name: 'Âm nhạc' },
  location: { address: 'Số 7 Công trường Lam Sơn', province: { name: 'TP. Hồ Chí Minh' } },
  status: 'APPROVED',
  visibility: 'PUBLIC',
}

test('event API reads wards from the wards response key', async () => {
  const requests: string[] = []
  const api = createEventApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url) => {
      requests.push(String(url))
      return Response.json({ wards: [{ id: 'ward-1', name: 'Hải Châu' }] })
    },
  })

  assert.deepEqual(await api.wards('province-1'), [{ id: 'ward-1', name: 'Hải Châu' }])
  assert.deepEqual(requests, ['https://api.example.test/api/locations/provinces/province-1/wards'])
})

test('event API fetches public events and maps them for attendee cards', async () => {
  const requests: string[] = []
  const api = createEventApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url) => {
      requests.push(String(url))
      return Response.json({ events: [publicEvent] })
    },
  })

  const events = await api.findPublic()

  assert.deepEqual(events, [{
    id: 'event-1',
    title: 'Đêm nhạc mùa thu',
    category: 'Âm nhạc',
    date: '17 THG 10 · 19:30',
    venue: 'Nhà hát Thành phố',
    city: 'TP. Hồ Chí Minh',
    priceFrom: 'Liên hệ giá vé',
    posterLabel: 'EVENT / 17',
    posterTone: 'yellow',
  }])
  assert.deepEqual(requests, ['https://api.example.test/api/events'])
})

test('event API reads owner detail nested under body.event (ticketTypes/seatMap/payoutInfo)', async () => {
  const requests: string[] = []
  const api = createEventApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url, init) => {
      requests.push(String(url))
      assert.equal((init?.headers as Headers | undefined)?.get?.('Authorization') ?? (init?.headers as Record<string, string> | undefined)?.Authorization, 'Bearer owner-token')
      // Backend responds { event: { ...fields, seatMap, ticketTypes, payoutInfo } } — all nested.
      return Response.json({
        event: {
          id: 'evt-9', title: 'Sự kiện của tôi', startAt: '2026-11-12T12:30:00.000Z', endAt: '2026-11-12T15:30:00.000Z',
          venueName: 'Nhà hát', status: 'REJECTED', rejectionReason: 'Bổ sung sơ đồ.',
          seatMap: { imageUrl: 'https://cdn.example.test/seat.png' },
          ticketTypes: [
            { id: 'tt-1', name: 'Vé thường', description: 'Ghế thường', image: null, price: '150000', quantity: 50, minPerOrder: 1, maxPerOrder: 4, saleStartAt: null, saleEndAt: null },
          ],
          payoutInfo: { accountHolder: 'Nguyễn A', accountNumber: '123', bankName: 'VCB', branch: 'HCM', businessType: 'INDIVIDUAL', invoiceName: null, invoiceAddress: null, taxCode: null },
        },
      })
    },
  })

  const detail = await api.findMineById('owner-token', 'evt-9')

  assert.equal(requests[0], 'https://api.example.test/api/events/mine/evt-9')
  assert.equal(detail?.event.id, 'evt-9')
  assert.equal(detail?.event.status, 'rejected')
  assert.equal(detail?.event.reviewFeedback, 'Bổ sung sơ đồ.')
  assert.equal(detail?.seatMap?.imageUrl, 'https://cdn.example.test/seat.png')
  assert.equal(detail?.ticketTypes[0]?.id, 'tt-1')
  assert.equal(detail?.ticketTypes[0]?.price, 150000)
  assert.equal(detail?.ticketTypes[0]?.maxPerOrder, 4)
  assert.equal(detail?.payoutInfo?.accountHolder, 'Nguyễn A')
})

test('event API returns null owner detail for a 404 or 409', async () => {
  const notFound = createEventApi({ baseUrl: '/api', fetch: async () => Response.json({ statusCode: 404, message: 'Event not found.' }, { status: 404 }) })
  assert.equal(await notFound.findMineById('t', 'missing'), null)

  const conflict = createEventApi({ baseUrl: '/api', fetch: async () => Response.json({ statusCode: 409, message: 'Only the event owner can view this event.' }, { status: 409 }) })
  assert.equal(await conflict.findMineById('t', 'not-mine'), null)
})

test('ticket type mutations unwrap the nested ticketType response', async () => {
  const api = createEventApi({
    baseUrl: '/api',
    fetch: async () => Response.json({ ticketType: { id: 'server-tier-7', name: 'VIP', price: 250000, quantity: 20 } }),
  })

  const created = await api.createTicketType('t', { eventId: 'evt-1', name: 'VIP', price: 250000, quantity: 20, minPerOrder: 1, maxPerOrder: 4, saleStartAt: '', saleEndAt: '' })
  const updated = await api.updateTicketType('t', 'server-tier-7', { name: 'VIP sửa' })

  assert.equal(created.id, 'server-tier-7')
  assert.equal(updated.id, 'server-tier-7')
})

test('reporting API sends encoded range query and maps decimal strings to numbers', async () => {
  const requests: string[] = []
  const api = createEventApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url, init) => {
      requests.push(String(url))
      assert.equal((init?.headers as Headers | undefined)?.get?.('Authorization'), 'Bearer owner-token')
      // Backend wraps the report in { report: {...} } with Decimal-like numeric strings.
      return Response.json({
        report: {
          eventId: 'evt-9',
          saleWindow: { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' },
          range: { startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-10T00:00:00.000Z' },
          summary: { revenue: '1500000.50', paidOrderCount: '3', soldTicketCount: '12', capacity: '100', remainingTicketCount: '88', checkInCount: '4' },
          timeline: [{ startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-06T00:00:00.000Z', revenue: '500000', soldTicketCount: '4' }],
          ticketTypes: [{ id: 'tt-1', name: 'Vé thường', price: '150000', capacity: '50', soldTicketCount: '8', revenue: '1200000' }],
        },
      })
    },
  })

  const report = await api.reporting('owner-token', 'evt-9', { from: '2026-01-05T00:00:00.000Z', to: '2026-01-10T00:00:00.000Z' })

  assert.equal(requests[0], 'https://api.example.test/api/events/evt-9/reporting?from=2026-01-05T00%3A00%3A00.000Z&to=2026-01-10T00%3A00%3A00.000Z')
  assert.equal(report.summary.revenue, 1500000.5)
  assert.equal(typeof report.summary.revenue, 'number')
  assert.equal(report.summary.paidOrderCount, 3)
  assert.equal(report.summary.remainingTicketCount, 88)
  assert.equal(report.timeline[0]?.revenue, 500000)
  assert.equal(report.timeline[0]?.soldTicketCount, 4)
  assert.equal(typeof report.timeline[0]?.soldTicketCount, 'number')
  assert.equal(report.ticketTypes[0]?.price, 150000)
  assert.equal(report.ticketTypes[0]?.revenue, 1200000)
  assert.equal(report.saleWindow.startAt, '2026-01-01T00:00:00.000Z')
  assert.equal(report.range.endAt, '2026-01-10T00:00:00.000Z')
})

test('reporting API omits query params when no range is given', async () => {
  const requests: string[] = []
  const api = createEventApi({
    baseUrl: 'https://api.example.test/api',
    fetch: async (url) => {
      requests.push(String(url))
      return Response.json({ report: { eventId: 'evt-9', saleWindow: { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' }, range: { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' }, summary: { revenue: '0', paidOrderCount: '0', soldTicketCount: '0', capacity: '0', remainingTicketCount: '0', checkInCount: '0' }, timeline: [], ticketTypes: [] } })
    },
  })

  await api.reporting('owner-token', 'evt-9')

  assert.equal(requests[0], 'https://api.example.test/api/events/evt-9/reporting')
})

test('event update omits payoutInfo and location, which UpdateEventDto rejects', async () => {
  const bodies: string[] = []
  const api = createEventApi({
    baseUrl: '/api',
    fetch: async (url, init) => {
      if (String(url).endsWith('/events/evt-1')) { bodies.push(String(init?.body ?? '')) }
      return Response.json({ event: { id: 'evt-1', title: 'Đã cập nhật', startAt: '2026-11-12T12:30:00.000Z', endAt: '2026-11-12T15:30:00.000Z', venueName: 'Nhà hát', status: 'DRAFT' } })
    },
  })

  await api.update('t', 'evt-1', {
    title: 'Đã cập nhật',
    provinceId: 'p1', street: 'Số 7', wardId: 'w1',
    categoryId: '11111111-1111-1111-1111-111111111111',
    finance: { accountHolder: 'A', accountNumber: '1', bankName: 'VCB', branch: 'HCM', businessType: 'INDIVIDUAL', invoiceName: '', invoiceAddress: '', taxCode: '' },
    initialTicketTiers: [{ name: 'x', price: 1, capacity: 1 }],
  } as never)

  const parsed = JSON.parse(bodies[0] ?? '{}') as Record<string, unknown>
  assert.equal('payoutInfo' in parsed, false, 'update must not send payoutInfo (UpdateEventDto rejects it)')
  assert.equal('location' in parsed, false, 'update must not send a location object (UpdateEventDto rejects it)')
  assert.equal('tickets' in parsed, false, 'update must not send tickets (UpdateEventDto rejects it)')
  assert.equal(parsed.title, 'Đã cập nhật')
  assert.equal(parsed.categoryId, '11111111-1111-1111-1111-111111111111')
})
