import { useCallback, type MouseEvent } from 'react'
import type { AttendeePath } from '../../../routes/attendee-route'
import { shouldUseClientNavigation } from '../../../routes/attendee-route'
import { SavedEventsGrid } from '../components/SavedEventsGrid'
import { SavedEventsHero } from '../components/SavedEventsHero'
import { MOCK_EVENTS } from '../mock/eventData'
import type { MockEvent } from '../types/event'

const SAVED_EVENT_IDS = new Set([
  'vong-khuc-thanh-pho',
  'midnight-market-live-set',
  'cham-vao-dat',
])

const SAVED_EVENTS = MOCK_EVENTS.filter((event) => SAVED_EVENT_IDS.has(event.id))

type SavedEventsPageProps = {
  onNavigate: (path: AttendeePath) => void
  onNoticeChange: (notice: string) => void
}

export function SavedEventsPage({ onNavigate, onNoticeChange }: SavedEventsPageProps) {
  const viewEvent = useCallback((event: MockEvent, clickEvent: MouseEvent<HTMLAnchorElement>) => {
    if (!shouldUseClientNavigation(clickEvent)) return
    clickEvent.preventDefault()
    onNavigate(`/events/${event.id}`)
  }, [onNavigate])

  const showStaticFavoriteNotice = useCallback((event: MockEvent) => {
    onNoticeChange(`“${event.title}” đang nằm trong danh sách minh họa. Tính năng bỏ lưu chưa được kết nối.`)
  }, [onNoticeChange])

  return (
    <>
      <SavedEventsHero />
      <SavedEventsGrid
        events={SAVED_EVENTS}
        onToggleFavorite={showStaticFavoriteNotice}
        onViewEvent={viewEvent}
      />
    </>
  )
}
