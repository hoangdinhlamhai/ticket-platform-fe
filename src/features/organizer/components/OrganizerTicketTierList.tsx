import { OrganizerResponsiveRecordList } from './OrganizerResponsiveRecordList.tsx'
import { OrganizerStatusBadge } from './OrganizerStatusBadge.tsx'
import type { OrganizerTicketTierMetric } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerTicketSaleStatus } from '../types/organizer-commerce.ts'

type Props = {
  ticketTiers: readonly OrganizerTicketTierMetric[]
  onEdit: (tierId: string, opener: HTMLElement) => void
  onStatusChange: (tierId: string, status: OrganizerTicketSaleStatus) => void
}

const labels = {
  scheduled: 'Chờ mở bán',
  on_sale: 'Đang bán',
  paused: 'Tạm dừng',
  sold_out: 'Hết vé',
  ended: 'Đã kết thúc',
} as const
const tones = { scheduled: 'neutral', on_sale: 'mint', paused: 'coral', sold_out: 'coral', ended: 'neutral' } as const

function StatusSelect({ tier, onStatusChange }: Pick<Props, 'onStatusChange'> & { tier: OrganizerTicketTierMetric }) {
  return <label className="text-sm font-bold">Trạng thái<select aria-label={`Đổi trạng thái ${tier.name}`} className="mt-1 min-h-10 rounded border border-line bg-paper px-2 font-normal" value={tier.saleStatus} onChange={(event) => onStatusChange(tier.id, event.target.value as OrganizerTicketSaleStatus)}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
}

export function OrganizerTicketTierList({ ticketTiers, onEdit, onStatusChange }: Props) {
  return <><div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block"><table className="min-w-full text-left text-sm"><caption className="sr-only">Hạng vé và tồn kho</caption><thead className="bg-paper-deep"><tr><th className="p-4">Hạng vé</th><th className="p-4">Giá</th><th className="p-4">Đã bán / còn</th><th className="p-4">Trạng thái</th><th className="p-4">Thao tác</th></tr></thead><tbody>{ticketTiers.map((tier) => <tr className="border-t border-line" key={tier.id}><td className="p-4"><strong>{tier.name}</strong><span className="block text-ink-soft">Tối đa {tier.perOrderLimit}/đơn</span></td><td className="p-4">{tier.price.toLocaleString('vi-VN')}đ</td><td className="p-4">{tier.soldCount}/{tier.capacity} · còn {tier.remainingCount}</td><td className="p-4"><OrganizerStatusBadge label={labels[tier.saleStatus]} tone={tones[tier.saleStatus]} /></td><td className="p-4"><div className="flex flex-wrap gap-2"><button className="min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onEdit(tier.id, event.currentTarget)}>Sửa</button><StatusSelect tier={tier} onStatusChange={onStatusChange} /></div></td></tr>)}</tbody></table></div><OrganizerResponsiveRecordList label="Hạng vé và tồn kho">{ticketTiers.map((tier) => <article className="rounded-lg border border-line bg-surface p-4" key={tier.id}><strong>{tier.name}</strong><dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-ink-soft">Giá</dt><dd className="m-0">{tier.price.toLocaleString('vi-VN')}đ</dd></div><div><dt className="text-ink-soft">Tồn kho</dt><dd className="m-0">{tier.soldCount}/{tier.capacity}, còn {tier.remainingCount}</dd></div><div><dt className="text-ink-soft">Giới hạn</dt><dd className="m-0">{tier.perOrderLimit} vé/đơn</dd></div><div><dt className="text-ink-soft">Trạng thái hiện tại</dt><dd className="m-0"><OrganizerStatusBadge label={labels[tier.saleStatus]} tone={tones[tier.saleStatus]} /></dd></div></dl><div className="mt-4 flex flex-wrap items-end gap-3"><button className="min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onEdit(tier.id, event.currentTarget)}>Sửa</button><StatusSelect tier={tier} onStatusChange={onStatusChange} /></div></article>)}</OrganizerResponsiveRecordList></>
}
