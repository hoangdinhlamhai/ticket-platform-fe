import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import type { OrganizerPath } from '../../../routes/organizer-route.ts'

type Props = {
  eventNotFound?: boolean
  onNavigate: (path: OrganizerPath) => void
}

export function OrganizerNotFoundPage({ eventNotFound = false, onNavigate }: Props) {
  const title = eventNotFound ? 'Không tìm thấy sự kiện' : 'Không tìm thấy trang Organizer'
  const description = eventNotFound
    ? 'Liên kết này không trỏ tới sự kiện nào trong phiên dữ liệu minh họa hiện tại.'
    : 'Đường dẫn Organizer không hợp lệ hoặc không còn được hỗ trợ.'

  return <OrganizerEmptyState
    title={title}
    description={description}
    action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate(eventNotFound ? '/organizer/events' : '/organizer')}>{eventNotFound ? 'Về danh sách sự kiện' : 'Về tổng quan'}</button>}
  />
}
