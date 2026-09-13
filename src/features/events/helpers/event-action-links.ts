import type { MockEventDetail } from '../types/event.ts'

export type EventShareData = {
  title: string
  text: string
  url: string
}

export type EventShareDependencies = {
  share?: (data: EventShareData) => Promise<void>
  copyText: (value: string) => Promise<void>
}

function getEventLocation(event: MockEventDetail) {
  return `${event.venue}, ${event.address}`
}

function formatUtcCalendarDate(value: string | Date) {
  return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function escapeIcsText(value: string) {
  return value
    .replaceAll('\\', '\\\\')
    .replaceAll('\r\n', '\\n')
    .replaceAll('\n', '\\n')
    .replaceAll(',', '\\,')
    .replaceAll(';', '\\;')
}

export function getEventShareData(event: MockEventDetail, eventUrl: string): EventShareData {
  return {
    title: `${event.title} | Ticketly`,
    text: `${event.title} tại ${event.venue} — ${event.date}`,
    url: eventUrl,
  }
}

export function buildEventDirectionsUrl(event: MockEventDetail) {
  const params = new URLSearchParams({ api: '1', destination: getEventLocation(event) })
  return `https://www.google.com/maps/dir/?${params.toString()}`
}

export function buildEventGoogleCalendarUrl(event: MockEventDetail) {
  if (!event.calendarSchedule) return null

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${formatUtcCalendarDate(event.calendarSchedule.startsAt)}/${formatUtcCalendarDate(event.calendarSchedule.endsAt)}`,
    ctz: event.calendarSchedule.timeZone,
    details: event.description,
    location: getEventLocation(event),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildEventIcs(event: MockEventDetail, eventUrl: string, createdAt = new Date()) {
  if (!event.calendarSchedule) return null

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ticketly//Event Calendar//VI',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(`${event.id}@ticketly.local`)}`,
    `DTSTAMP:${formatUtcCalendarDate(createdAt)}`,
    `DTSTART:${formatUtcCalendarDate(event.calendarSchedule.startsAt)}`,
    `DTEND:${formatUtcCalendarDate(event.calendarSchedule.endsAt)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    `DESCRIPTION:${escapeIcsText(event.description)}`,
    `LOCATION:${escapeIcsText(getEventLocation(event))}`,
    `URL:${escapeIcsText(eventUrl)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return `${lines.join('\r\n')}\r\n`
}

export function buildEventIcsDataUrl(event: MockEventDetail, eventUrl: string) {
  const ics = buildEventIcs(event, eventUrl)
  return ics ? `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}` : null
}

export function getEventIcsFilename(event: MockEventDetail) {
  return `${event.id}.ics`
}

export async function shareEvent(
  event: MockEventDetail,
  eventUrl: string,
  dependencies: EventShareDependencies,
) {
  if (dependencies.share) {
    await dependencies.share(getEventShareData(event, eventUrl))
    return 'shared' as const
  }

  await dependencies.copyText(eventUrl)
  return 'copied' as const
}
