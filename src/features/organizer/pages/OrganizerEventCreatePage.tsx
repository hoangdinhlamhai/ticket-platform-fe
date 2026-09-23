import { OrganizerEventForm, type OrganizerEventFormSave } from '../components/OrganizerEventForm.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'

type Props = { onCancel: () => void; onCreate: (value: OrganizerEventFormSave) => boolean | Promise<boolean>; onDirtyChange: (hasUnsavedChanges: boolean) => void }
export function OrganizerEventCreatePage({ onCancel, onCreate, onDirtyChange }: Props) {
  return <div className="mx-auto max-w-4xl space-y-7"><OrganizerPageHeader eyebrow="TẠO SỰ KIỆN" title="Bắt đầu từ bản nháp."><p>Hoàn thiện từng bước. Không có dữ liệu sự kiện nào được tạo trước khi bạn bấm lưu bản nháp ở bước cuối.</p></OrganizerPageHeader><OrganizerEventForm wizard submitLabel="Lưu bản nháp" onDirtyChange={onDirtyChange} onSave={onCreate} /><div className="rounded-lg border border-dashed border-line bg-paper-deep p-4 text-sm leading-relaxed text-ink-soft">Sự kiện mới luôn ở trạng thái <strong>bản nháp</strong>. Sau khi lưu, bạn có thể rà soát và gửi Admin duyệt ở trang tổng quan sự kiện.</div><button className="min-h-12 rounded-md border border-line px-5 text-sm font-extrabold" type="button" onClick={onCancel}>Hủy tạo sự kiện</button></div>
}
