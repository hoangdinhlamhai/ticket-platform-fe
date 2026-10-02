import test from 'node:test'
import assert from 'node:assert/strict'
import axios, { type AxiosRequestConfig } from 'axios'
import axiosClient from '../../../api/axiosClient.ts'
import { createEventApi } from './event-api.ts'

const publicEvent = { id: 'event-1', title: 'Đêm nhạc mùa thu', startAt: '2026-10-17T12:30:00.000Z', endAt: '2026-10-17T15:00:00.000Z', venueName: 'Nhà hát Thành phố', thumbnail: null, category: { name: 'Âm nhạc' }, location: { address: 'Số 7 Công trường Lam Sơn', province: { name: 'TP. Hồ Chí Minh' } }, status: 'APPROVED', visibility: 'PUBLIC' }

async function withAxiosMock<T>(handler: (config: AxiosRequestConfig) => unknown, run: () => Promise<T>) {
  const original = axiosClient.request
  axiosClient.request = (async <R>(config: AxiosRequestConfig) => ({ data: handler(config) }) as { data: R }) as typeof axiosClient.request
  try { return await run() } finally { axiosClient.request = original }
}

const report = { eventId: 'evt-9', saleWindow: { startAt: '2026-01-01T00:00:00.000Z', endAt: '2026-02-01T00:00:00.000Z' }, range: { startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-10T00:00:00.000Z' }, summary: { revenue: '1500000.50', paidOrderCount: '3', soldTicketCount: '12', capacity: '100', remainingTicketCount: '88', checkInCount: '4' }, timeline: [{ startAt: '2026-01-05T00:00:00.000Z', endAt: '2026-01-06T00:00:00.000Z', revenue: '500000', soldTicketCount: '4' }], ticketTypes: [{ id: 'tt-1', name: 'Vé thường', price: '150000', capacity: '50', soldTicketCount: '8', revenue: '1200000' }] }

test('event API reads wards from the wards response key', async () => {
  const requests: string[] = []
  await withAxiosMock((config) => { requests.push(String(config.url)); return { wards: [{ id: 'ward-1', name: 'Hải Châu' }] } }, async () => {
    const api = createEventApi({ baseUrl: 'https://api.example.test/api' })
    assert.deepEqual(await api.wards('province-1'), [{ id: 'ward-1', name: 'Hải Châu' }])
  })
  assert.deepEqual(requests, ['https://api.example.test/api/locations/provinces/province-1/wards'])
})

test('event API fetches public events and maps them for attendee cards', async () => {
  const requests: string[] = []
  await withAxiosMock((config) => { requests.push(String(config.url)); return { events: [publicEvent] } }, async () => {
    const events = await createEventApi({ baseUrl: 'https://api.example.test/api' }).findPublic()
    assert.deepEqual(events, [{ id: 'event-1', title: 'Đêm nhạc mùa thu', category: 'Âm nhạc', date: '17 THG 10 · 19:30', venue: 'Nhà hát Thành phố', city: 'TP. Hồ Chí Minh', priceFrom: 'Liên hệ giá vé', posterLabel: 'EVENT / 17', posterTone: 'yellow' }])
  })
  assert.deepEqual(requests, ['https://api.example.test/api/events'])
})

test('event API reads nested owner detail and maps 404/409 to null', async () => {
  await withAxiosMock((config) => {
    assert.equal(config.headers?.Authorization, 'Bearer owner-token')
    return { event: { id: 'evt-9', title: 'Sự kiện của tôi', startAt: '2026-11-12T12:30:00.000Z', endAt: '2026-11-12T15:30:00.000Z', venueName: 'Nhà hát', status: 'REJECTED', rejectionReason: 'Bổ sung sơ đồ.', seatMap: { imageUrl: 'https://cdn.example.test/seat.png' }, ticketTypes: [{ id: 'tt-1', name: 'Vé thường', price: '150000', quantity: 50, minPerOrder: 1, maxPerOrder: 4 }], payoutInfo: { accountHolder: 'Nguyễn A' } } }
  }, async () => {
    const detail = await createEventApi({ baseUrl: '/api' }).findMineById('owner-token', 'evt-9')
    assert.equal(detail?.event.status, 'rejected'); assert.equal(detail?.seatMap?.imageUrl, 'https://cdn.example.test/seat.png'); assert.equal(detail?.ticketTypes[0]?.price, 150000); assert.equal(detail?.payoutInfo?.accountHolder, 'Nguyễn A')
  })
  for (const status of [404, 409]) {
    await withAxiosMock(() => { throw new axios.AxiosError('no', undefined, undefined, undefined, { status, data: {}, headers: {}, config: { headers: {} } }) }, async () => assert.equal(await createEventApi({ baseUrl: '/api' }).findMineById('t', 'missing'), null))
  }
})

test('ticket type mutations unwrap nested ticketType response', async () => {
  await withAxiosMock(() => ({ ticketType: { id: 'server-tier-7', name: 'VIP', price: 250000, quantity: 20 } }), async () => {
    const api = createEventApi({ baseUrl: '/api' })
    assert.equal((await api.createTicketType('t', { eventId: 'evt-1', name: 'VIP', price: 250000, quantity: 20, minPerOrder: 1, maxPerOrder: 4, saleStartAt: '', saleEndAt: '' })).id, 'server-tier-7')
    assert.equal((await api.updateTicketType('t', 'server-tier-7', { name: 'VIP sửa' })).id, 'server-tier-7')
  })
})

test('reporting API sends range query and maps decimal strings', async () => {
  const requests: AxiosRequestConfig[] = []
  await withAxiosMock((config) => { requests.push(config); return { report } }, async () => {
    const actual = await createEventApi({ baseUrl: 'https://api.example.test/api' }).reporting('owner-token', 'evt-9', { from: report.range.startAt, to: report.range.endAt })
    assert.equal(actual.summary.revenue, 1500000.5); assert.equal(actual.summary.paidOrderCount, 3); assert.equal(actual.timeline[0]?.soldTicketCount, 4); assert.equal(actual.ticketTypes[0]?.revenue, 1200000)
  })
  assert.equal(requests[0]?.url, 'https://api.example.test/api/events/evt-9/reporting?from=2026-01-05T00%3A00%3A00.000Z&to=2026-01-10T00%3A00%3A00.000Z')
  assert.equal(requests[0]?.headers?.Authorization, 'Bearer owner-token')
})

test('reporting omits range query and event update excludes unsupported fields', async () => {
  const requests: AxiosRequestConfig[] = []
  await withAxiosMock((config) => { requests.push(config); return String(config.url).includes('reporting') ? { report: { ...report, timeline: [], ticketTypes: [] } } : { event: { id: 'evt-1', title: 'Đã cập nhật', startAt: '', endAt: '', venueName: '', status: 'DRAFT' } } }, async () => {
    const api = createEventApi({ baseUrl: 'https://api.example.test/api' })
    await api.reporting('owner-token', 'evt-9')
    await api.update('t', 'evt-1', { title: 'Đã cập nhật', provinceId: 'p1', street: 'Số 7', categoryId: '11111111-1111-1111-1111-111111111111', finance: { accountHolder: 'A', accountNumber: '1', bankName: 'VCB', branch: 'HCM', businessType: 'INDIVIDUAL', invoiceName: '', invoiceAddress: '', taxCode: '' }, initialTicketTiers: [{ name: 'x', price: 1, capacity: 1 }] } as never)
  })
  assert.equal(requests[0]?.url, 'https://api.example.test/api/events/evt-9/reporting')
  const body = requests[1]?.data as Record<string, unknown>
  assert.equal('payoutInfo' in body, false); assert.equal('location' in body, false); assert.equal('tickets' in body, false); assert.equal(body.title, 'Đã cập nhật')
})
