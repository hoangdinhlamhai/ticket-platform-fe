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
