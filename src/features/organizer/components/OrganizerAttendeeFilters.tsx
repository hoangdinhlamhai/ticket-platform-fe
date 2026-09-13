import type { OrganizerAttendeeFilters } from '../helpers/filter-organizer-attendees.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'

type Props = {
  filters: OrganizerAttendeeFilters
  onChange: <K extends keyof OrganizerAttendeeFilters>(key: K, value: OrganizerAttendeeFilters[K]) => void
  onReset: () => void
  ticketTiers: readonly OrganizerTicketTier[]
}

export function OrganizerAttendeeFilters({ filters, onChange, onReset, ticketTiers }: Props) {
  return <section className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-5" aria-label="Lọc người tham dự"><label className="text-sm font-bold xl:col-span-2">Tìm người tham dự<input className="mt-2 min-h-11 w-full rounded border border-line bg-paper px-3" placeholder="Tên, email hoặc mã vé" value={filters.query} onChange={(event) => onChange('query', event.target.value)} /></label><label className="text-sm font-bold">Nguồn<select className="mt-2 min-h-11 w-full rounded border border-line bg-paper px-3" value={filters.source} onChange={(event) => onChange('source', event.target.value as OrganizerAttendeeFilters['source'])}><option value="all">Tất cả</option><option value="buyer">Người mua</option><option value="holder">Người giữ vé</option></select></label><label className="text-sm font-bold">Trạng thái vé<select className="mt-2 min-h-11 w-full rounded border border-line bg-paper px-3" value={filters.credentialStatus} onChange={(event) => onChange('credentialStatus', event.target.value as OrganizerAttendeeFilters['credentialStatus'])}><option value="all">Tất cả</option><option value="valid">Hợp lệ</option><option value="checked_in">Đã check-in</option><option value="void">Đã thu hồi</option></select></label><label className="text-sm font-bold">Hạng vé<select className="mt-2 min-h-11 w-full rounded border border-line bg-paper px-3" value={filters.ticketTierId} onChange={(event) => onChange('ticketTierId', event.target.value)}><option value="all">Tất cả</option>{ticketTiers.map((tier) => <option key={tier.id} value={tier.id}>{tier.name}</option>)}</select></label><button className="min-h-11 rounded border border-blue px-3 font-bold text-blue-deep xl:col-start-5" type="button" onClick={onReset}>Đặt lại</button></section>
}
