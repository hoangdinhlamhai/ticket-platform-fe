import test from 'node:test'
import assert from 'node:assert/strict'
import { getEventById } from './getEventById.ts'
import { formatTicketPrice, getTicketSubtotal } from './formatTicketPrice.ts'
import {
  buildEventDirectionsUrl,
  buildEventGoogleCalendarUrl,
  buildEventIcs,
  buildEventIcsDataUrl,
  getEventIcsFilename,
  getEventShareData,
  shareEvent,
} from './event-action-links.ts'

test('looks up known mock events and returns undefined for unknown ids', () => {
  assert.equal(getEventById('vong-khuc-thanh-pho')?.title, 'Vọng khúc thành phố')
  assert.equal(getEventById('khong-ton-tai'), undefined)
})

test('formats ticket prices and calculates mock subtotals', () => {
  assert.equal(formatTicketPrice(390000), '390.000đ')
  assert.equal(getTicketSubtotal(390000, 3), 1170000)
  assert.equal(formatTicketPrice(getTicketSubtotal(390000, 3)), '1.170.000đ')
})

test('builds share and directions data from the current event URL', () => {
  const event = getEventById('vong-khuc-thanh-pho')!
  const shareData = getEventShareData(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho')

  assert.deepEqual(shareData, {
    title: 'Vọng khúc thành phố | Ticketly',
    text: 'Vọng khúc thành phố tại Nhà hát Thành phố — 17 THG 10 · 19:30',
    url: 'https://ticketly.vn/events/vong-khuc-thanh-pho',
  })
  assert.equal(
    buildEventDirectionsUrl(event),
    'https://www.google.com/maps/dir/?api=1&destination=Nh%C3%A0+h%C3%A1t+Th%C3%A0nh+ph%E1%BB%91%2C+7+C%C3%B4ng+tr%C6%B0%E1%BB%9Dng+Lam+S%C6%A1n%2C+Qu%E1%BA%ADn+1%2C+TP.+H%E1%BB%93+Ch%C3%AD+Minh',
  )
})

test('withholds calendar exports until backend provides a structured schedule', () => {
  const event = getEventById('vong-khuc-thanh-pho')!

  assert.equal(buildEventGoogleCalendarUrl(event), null)
  assert.equal(buildEventIcs(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho'), null)
  assert.equal(buildEventIcsDataUrl(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho'), null)
})

test('builds valid Google and ics calendar data from a structured backend schedule', () => {
  const event = {
    ...getEventById('vong-khuc-thanh-pho')!,
    calendarSchedule: {
      startsAt: '2026-10-17T19:30:00+07:00',
      endsAt: '2026-10-17T21:30:00+07:00',
      timeZone: 'Asia/Ho_Chi_Minh',
    },
  }
  const calendarUrl = new URL(buildEventGoogleCalendarUrl(event)!)
  const ics = buildEventIcs(
    event,
    'https://ticketly.vn/events/vong-khuc-thanh-pho',
    new Date('2026-09-01T17:00:00.000Z'),
  )!

  assert.equal(calendarUrl.searchParams.get('dates'), '20261017T123000Z/20261017T143000Z')
  assert.equal(calendarUrl.searchParams.get('ctz'), 'Asia/Ho_Chi_Minh')
  assert.match(ics, /DTSTAMP:20260901T170000Z/)
  assert.match(ics, /DTSTART:20261017T123000Z/)
  assert.match(ics, /DTEND:20261017T143000Z/)
  assert.equal(getEventIcsFilename(event), 'vong-khuc-thanh-pho.ics')
  assert.match(buildEventIcsDataUrl(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho')!, /^data:text\/calendar;charset=utf-8,/)
})

test('uses native share and falls back to clipboard when sharing is unavailable', async () => {
  const event = getEventById('vong-khuc-thanh-pho')!
  let sharedTitle = ''
  let copiedUrl = ''

  const nativeResult = await shareEvent(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho', {
    share: async (data) => { sharedTitle = data.title },
    copyText: async () => { throw new Error('clipboard fallback should not run') },
  })
  assert.equal(nativeResult, 'shared')
  assert.equal(sharedTitle, 'Vọng khúc thành phố | Ticketly')

  const fallbackResult = await shareEvent(event, 'https://ticketly.vn/events/vong-khuc-thanh-pho', {
    copyText: async (value) => { copiedUrl = value },
  })
  assert.equal(fallbackResult, 'copied')
  assert.equal(copiedUrl, 'https://ticketly.vn/events/vong-khuc-thanh-pho')
})
