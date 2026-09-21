import { useEffect } from 'react'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventForm, type OrganizerEventFormSave } from '../components/OrganizerEventForm.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { canSubmitOrganizerEventForReview } from '../helpers/organizer-event-transitions.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../app/routing/organizer-route.ts'
import type { OrganizerEventInput } from '../types/organizer-event.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onDirtyChange: (isDirty: boolean) => void
  onNavigate: (path: OrganizerPath) => void
  onUpdate: (eventId: string, input: OrganizerEventInput, finance?: import('../types/organizer-event.ts').OrganizerEventFinance) => boolean | Promise<boolean>
  workspace: OrganizerWorkspace
}

export function OrganizerEventEditPage({ activeRoute, eventId, onDirtyChange, onNavigate, onUpdate, workspace }: Props) {
  const event = workspace.events.find((item) => item.id === eventId)

  useEffect(() => () => onDirtyChange(false), [onDirtyChange])

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const editable = canSubmitOrganizerEventForReview(event.status)
  const save = ({ input, finance }: OrganizerEventFormSave) => onUpdate(event.id, input, finance)
  return <div className="mx-auto max-w-4xl space-y-7"><OrganizerPageHeader eyebrow="THÔNG TIN SỰ KIỆN" title={event.title}><p>{editable ? 'Cập nhật thông tin trước khi gửi Admin duyệt.' : 'Sự kiện ở trạng thái này đã khóa thông tin để bảo toàn quy trình vận hành.'}</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={event.id} onNavigate={onNavigate} />{!editable && <section className="rounded-lg border border-blue/40 bg-google-hover p-4 text-sm leading-relaxed text-ink"><strong>Thông tin đang bị khóa.</strong> Chỉ bản nháp hoặc sự kiện cần chỉnh sửa mới có thể cập nhật và gửi duyệt lại.</section>}<OrganizerEventForm key={event.id} event={event} locked={!editable} onCancel={() => onNavigate(`/organizer/events/${event.id}`)} onDirtyChange={onDirtyChange} onSave={save} submitLabel="Lưu thay đổi" />{editable && <p className="m-0 text-sm leading-relaxed text-ink-soft">Lưu thay đổi không tự gửi Admin duyệt. Hãy kiểm tra bản cập nhật tại trang tổng quan trước khi gửi.</p>}</div>
}
