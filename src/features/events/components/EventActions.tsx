import { useCallback, useMemo, useState } from 'react'
import {
  ArrowUpRightIcon,
  CalendarIcon,
  DownloadIcon,
  LinkIcon,
  PinIcon,
  ShareIcon,
} from '../../../components/icons/TicketlyIcons'
import {
  buildEventDirectionsUrl,
  buildEventGoogleCalendarUrl,
  buildEventIcsDataUrl,
  getEventIcsFilename,
  shareEvent,
} from '../helpers/event-action-links'
import type { MockEventDetail } from '../types/event'

type EventActionsProps = {
  event: MockEventDetail
}

type ActionStatus = 'idle' | 'copied' | 'shared' | 'error'

const actionClassName = 'flex min-h-11 items-center gap-2 rounded-md border border-line bg-surface px-4 text-left text-sm font-bold text-ink hover:border-blue hover:text-blue'
const disabledActionClassName = 'flex min-h-11 cursor-not-allowed items-center gap-2 rounded-md border border-line/70 bg-surface/65 px-4 text-left text-sm font-bold text-ink-soft opacity-65'

function getCurrentEventUrl(eventId: string) {
  if (typeof window === 'undefined') return `/events/${eventId}`
  return window.location.href
}

async function copyEventUrl(eventUrl: string) {
  await navigator.clipboard.writeText(eventUrl)
}

export function EventActions({ event }: EventActionsProps) {
  const [status, setStatus] = useState<ActionStatus>('idle')
  const eventUrl = getCurrentEventUrl(event.id)
  const googleCalendarUrl = useMemo(() => buildEventGoogleCalendarUrl(event), [event])
  const directionsUrl = useMemo(() => buildEventDirectionsUrl(event), [event])
  const icsDataUrl = useMemo(() => buildEventIcsDataUrl(event, eventUrl), [event, eventUrl])
  const icsFilename = useMemo(() => getEventIcsFilename(event), [event])

  const handleCopy = useCallback(async () => {
    try {
      await copyEventUrl(eventUrl)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }, [eventUrl])

  const handleShare = useCallback(async () => {
    try {
      const result = await shareEvent(event, eventUrl, {
        share: navigator.share ? (data) => navigator.share(data) : undefined,
        copyText: copyEventUrl,
      })
      setStatus(result)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('error')
    }
  }, [event, eventUrl])

  const statusMessage = status === 'copied'
    ? 'Đã sao chép liên kết sự kiện.'
    : status === 'shared'
      ? 'Đã mở bảng chia sẻ sự kiện.'
      : status === 'error'
        ? 'Không thể sao chép hoặc chia sẻ liên kết.'
        : ''

  return (
    <section className="mt-8 rounded-lg border border-line/70 bg-paper-deep p-5" aria-labelledby="event-actions-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">CHIA SẺ & TIỆN ÍCH</p>
      <h2 id="event-actions-title" className="mt-2 mb-0 font-body text-2xl font-extrabold tracking-[-0.045em]">Mang sự kiện theo bạn.</h2>
      <div className="mt-5 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        <button className={actionClassName} type="button" onClick={handleShare}>
          <ShareIcon className="h-5 w-5 shrink-0" />Chia sẻ sự kiện
        </button>
        <button className={actionClassName} type="button" onClick={handleCopy}>
          <LinkIcon className="h-5 w-5 shrink-0" />Sao chép liên kết
        </button>
        {googleCalendarUrl ? (
          <a className={actionClassName} href={googleCalendarUrl} target="_blank" rel="noreferrer">
            <CalendarIcon className="h-5 w-5 shrink-0" />Thêm Google Calendar
            <ArrowUpRightIcon className="ml-auto h-4 w-4 shrink-0" />
          </a>
        ) : (
          <button className={disabledActionClassName} type="button" disabled title="Đang chờ dữ liệu ngày giờ từ backend">
            <CalendarIcon className="h-5 w-5 shrink-0" />Google Calendar · Sắp có
          </button>
        )}
        {icsDataUrl ? (
          <>
            <a className={actionClassName} href={icsDataUrl} download={icsFilename}>
              <CalendarIcon className="h-5 w-5 shrink-0" />Thêm Apple Calendar
            </a>
            <a className={actionClassName} href={icsDataUrl} download={icsFilename}>
              <DownloadIcon className="h-5 w-5 shrink-0" />Tải file .ics
            </a>
          </>
        ) : (
          <>
            <button className={disabledActionClassName} type="button" disabled title="Đang chờ dữ liệu ngày giờ từ backend">
              <CalendarIcon className="h-5 w-5 shrink-0" />Apple Calendar · Sắp có
            </button>
            <button className={disabledActionClassName} type="button" disabled title="Đang chờ dữ liệu ngày giờ từ backend">
              <DownloadIcon className="h-5 w-5 shrink-0" />File .ics · Sắp có
            </button>
          </>
        )}
        <a className={actionClassName} href={directionsUrl} target="_blank" rel="noreferrer">
          <PinIcon className="h-5 w-5 shrink-0" />Hướng dẫn đường đi
          <ArrowUpRightIcon className="ml-auto h-4 w-4 shrink-0" />
        </a>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{statusMessage}</p>
      <p className="mt-4 mb-0 text-xs leading-[1.6] text-ink-soft">
        Tính năng lịch sẽ tự mở khi backend cung cấp ngày bắt đầu, ngày kết thúc và múi giờ chuẩn.
      </p>
    </section>
  )
}
