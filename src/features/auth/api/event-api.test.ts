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
