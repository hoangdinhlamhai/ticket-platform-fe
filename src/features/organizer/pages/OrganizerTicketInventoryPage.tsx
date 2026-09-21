import { useMemo, useState } from 'react'
import { OrganizerEmptyState } from '../components/OrganizerEmptyState.tsx'
import { OrganizerEventNavigation } from '../components/OrganizerEventNavigation.tsx'
import { OrganizerInventorySummary } from '../components/OrganizerInventorySummary.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { OrganizerTicketTierForm } from '../components/OrganizerTicketTierForm.tsx'
import { OrganizerTicketTierList } from '../components/OrganizerTicketTierList.tsx'
import { selectOrganizerEventMetrics } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerPath, OrganizerRoute } from '../../../app/routing/organizer-route.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  activeRoute: OrganizerRoute
  eventId: string
  onNavigate: (path: OrganizerPath) => void
  onSaveTicketTier: (tier: OrganizerTicketTier) => void | Promise<unknown>
  onSetSaleStatus: (tierId: string, status: OrganizerTicketTier['saleStatus']) => void
  onUpdateEventImage: (eventId: string, field: 'seatingChartImage', value: string) => Promise<unknown>
  workspace: OrganizerWorkspace
}

export function OrganizerTicketInventoryPage({ activeRoute, eventId, onNavigate, onSaveTicketTier, onSetSaleStatus, onUpdateEventImage, workspace }: Props) {
  const [editingTierId, setEditingTierId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [exportNotice, setExportNotice] = useState('')
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null)
  const event = workspace.events.find((item) => item.id === eventId)
  const [seatingChartImage, setSeatingChartImage] = useState(event?.seatingChartImage ?? '')
  const [seatingNotice, setSeatingNotice] = useState('')
  const metrics = useMemo(() => selectOrganizerEventMetrics(workspace, eventId), [eventId, workspace])
  const editingTier = workspace.ticketTiers.find((tier) => tier.id === editingTierId) ?? null

  if (!event) return <OrganizerEmptyState title="Không tìm thấy sự kiện" description="Liên kết này không trỏ tới sự kiện nào trong phiên hiện tại." action={<button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="button" onClick={() => onNavigate('/organizer/events')}>Về danh sách sự kiện</button>} />

  const closeForm = () => {
    setFormOpen(false)
    setEditingTierId(null)
  }
  const createTier = (opener: HTMLElement) => {
    setReturnFocus(opener)
    setEditingTierId(null)
    setFormOpen(true)
  }
  const editTier = (tierId: string, opener: HTMLElement) => {
    setReturnFocus(opener)
    setEditingTierId(tierId)
    setFormOpen(true)
  }
  const saveSeatingChart = async (file: File) => {
    setSeatingNotice('')
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result !== 'string') return
      setSeatingChartImage(reader.result)
      void onUpdateEventImage(eventId, 'seatingChartImage', reader.result).catch(() => setSeatingNotice('Không thể tải sơ đồ chỗ ngồi. Vui lòng thử lại.'))
    }
    reader.readAsDataURL(file)
  }

  return <div className="mx-auto max-w-7xl space-y-7"><OrganizerPageHeader eyebrow="VẬN HÀNH VÉ" title="Vé và tồn kho" actions={<><button className="min-h-11 rounded-md border border-blue px-4 font-extrabold text-blue-deep" type="button" onClick={() => setExportNotice('Xuất CSV sẽ được bổ sung sau; chưa có tệp nào được tạo.')}>Xuất CSV</button><button className="min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper" type="button" onClick={(event) => createTier(event.currentTarget)}>Tạo hạng vé</button></>}><p>{event.title}. Số vé đã bán được khóa; mọi thay đổi trạng thái sẽ được kiểm tra bởi quy tắc tồn kho hiện có.</p></OrganizerPageHeader><OrganizerEventNavigation activeRoute={activeRoute} eventId={eventId} onNavigate={onNavigate} />{exportNotice && <p className="rounded-md border border-blue bg-paper-deep p-3 text-sm font-bold text-blue-deep" role="status">{exportNotice}</p>}<OrganizerInventorySummary ticketTiers={metrics.ticketTiers} />{metrics.ticketTiers.length ? <OrganizerTicketTierList ticketTiers={metrics.ticketTiers} onEdit={editTier} onStatusChange={onSetSaleStatus} /> : <OrganizerEmptyState title="Chưa có hạng vé" description="Tạo hạng vé đầu tiên để bắt đầu cấu hình tồn kho cho sự kiện." action={<button className="min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper" type="button" onClick={(event) => createTier(event.currentTarget)}>Tạo hạng vé</button>} />}{formOpen && <OrganizerTicketTierForm eventId={eventId} onClose={closeForm} onSave={onSaveTicketTier} returnFocus={returnFocus} tier={editingTier} />}<section className="rounded-lg border border-line bg-surface p-5"><h2 className="text-xl font-extrabold">Sơ đồ chỗ ngồi</h2><p className="mt-2 text-sm text-ink-soft">Tùy chọn; lưu trong workspace phiên demo.</p><input className="mt-3 block text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={(input) => { const file = input.target.files?.[0]; if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) { setSeatingNotice('Chỉ nhận PNG, JPEG hoặc WebP tối đa 3MB.'); return } void saveSeatingChart(file) }} />{seatingNotice && <p className="mt-2 text-sm font-bold text-error" role="alert">{seatingNotice}</p>}{seatingChartImage && <div className="mt-4 flex items-start gap-3"><img className="max-h-48 rounded border border-line" src={seatingChartImage} alt="Sơ đồ chỗ ngồi" /><button className="font-bold text-coral-dark" type="button" onClick={() => { setSeatingChartImage(''); void onUpdateEventImage(eventId, 'seatingChartImage', '') }}>Xóa sơ đồ</button></div>}</section></div>
}
