import {
  OrganizerEventForm,
  type OrganizerEventFormSave,
} from '../components/OrganizerEventForm.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'

type Props = {
  onCancel: () => void
  onCreate: (value: OrganizerEventFormSave) => boolean | Promise<boolean>
  onDirtyChange: (hasUnsavedChanges: boolean) => void
  saving?: boolean
  error?: string | null
}

export function OrganizerEventCreatePage({
  onCancel,
  onCreate,
  onDirtyChange,
  saving = false,
  error = null,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <OrganizerPageHeader eyebrow="TẠO SỰ KIỆN" title="Bắt đầu từ bản nháp.">
        <p>
          Hoàn thiện từng bước. Sự kiện sẽ được gửi cho Admin duyệt ngay sau khi bạn nhấn xác
          nhận ở bước cuối.
        </p>
      </OrganizerPageHeader>

      <OrganizerEventForm
        wizard
        saving={saving}
        error={error}
        submitLabel="Gửi sự kiện"
        onDirtyChange={onDirtyChange}
        onSave={onCreate}
      />

      <div className="rounded-lg border border-dashed border-line bg-paper-deep p-4 text-sm leading-relaxed text-ink-soft">
        Sự kiện sau khi tạo sẽ ở trạng thái <strong>chờ duyệt</strong>. Admin sẽ xem xét và phê
        duyệt trước khi sự kiện được công bố.
      </div>

      <button
        className="min-h-12 rounded-md border border-line px-5 text-sm font-extrabold"
        type="button"
        onClick={onCancel}
      >
        Hủy tạo sự kiện
      </button>
    </div>
  )
}
