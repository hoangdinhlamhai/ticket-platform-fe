import test from 'node:test'
import assert from 'node:assert/strict'
import { createEventApi } from './event-api.ts'

test('event API maps public detail metadata and ticket sales data', async () => {
  const api = createEventApi({
    baseUrl: '/api',
    fetch: async () => Response.json({ event: {
      id: 'event-1', title: 'Đêm nhạc', description: '<p>Âm nhạc <strong>live</strong></p>',
      thumbnail: 'https://cdn.example.test/event.jpg', startAt: '2026-10-17T12:30:00.000Z', endAt: '2026-10-17T15:00:00.000Z',
      venueName: 'Nhà hát Thành phố', organizerName: 'Ban tổ chức', organizerBio: 'Giới thiệu', organizerLogo: null,
      category: { name: 'Âm nhạc' }, location: { address: 'Số 7', province: { name: 'TP. Hồ Chí Minh' } },
      ticketTypes: [{ id: 'tier-1', name: 'Standard', description: 'Ghế thường', image: null, price: '250000', quantity: 20, minPerOrder: 1, maxPerOrder: 4, saleStartAt: null, saleEndAt: null }],
    } }),
  })

  const event = await api.findPublicById('event-1')

  assert.equal(event?.title, 'Đêm nhạc')
  assert.equal(event?.address, 'Số 7, TP. Hồ Chí Minh')
  assert.equal(event?.ticketTiers[0]?.price, 250000)
  assert.equal(event?.ticketTiers[0]?.maxPerOrder, 4)
  assert.equal(event?.calendarSchedule?.timeZone, 'Asia/Ho_Chi_Minh')
})
