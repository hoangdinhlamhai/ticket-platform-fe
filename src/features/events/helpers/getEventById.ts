import { MOCK_EVENT_DETAILS } from '../mock/eventDetailData.ts'

export function getEventById(eventId: string) {
  return MOCK_EVENT_DETAILS.find((event) => event.id === eventId)
}
