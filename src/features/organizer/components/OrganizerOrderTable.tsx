import { OrganizerResponsiveRecordList } from './OrganizerResponsiveRecordList.tsx'
import { OrganizerStatusBadge } from './OrganizerStatusBadge.tsx'
import { maskOrganizerEmail } from '../helpers/mask-organizer-email.ts'
import type { OrganizerOrder } from '../types/organizer-commerce.ts'

type Props = {
  orders: readonly OrganizerOrder[]
  onOpen: (id: string, opener: HTMLElement) => void
}

const labels = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  refunded: 'Đã hoàn tiền',
} as const
const tones = { paid: 'mint', pending: 'blue', refunded: 'neutral' } as const

export function OrganizerOrderTable({ orders, onOpen }: Props) {
  return <>
    <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Đơn hàng theo sự kiện</caption>
        <thead className="bg-paper-deep"><tr><th className="p-4">Mã đơn</th><th className="p-4">Người mua</th><th className="p-4">Tổng tiền</th><th className="p-4">Trạng thái</th><th className="p-4"><span className="sr-only">Chi tiết</span></th></tr></thead>
        <tbody>{orders.map((order) => <tr className="border-t border-line" key={order.id}><td className="p-4 font-bold">{order.id}</td><td className="p-4">{order.buyerName}<span className="block text-ink-soft">{order.buyerEmail}</span></td><td className="p-4">{order.total.toLocaleString('vi-VN')}đ</td><td className="p-4"><OrganizerStatusBadge label={labels[order.paymentStatus]} tone={tones[order.paymentStatus]} /></td><td className="p-4"><button className="min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onOpen(order.id, event.currentTarget)}>Xem</button></td></tr>)}</tbody>
      </table>
    </div>
    <OrganizerResponsiveRecordList label="Đơn hàng theo sự kiện">
      {orders.map((order) => <article className="rounded-lg border border-line bg-surface p-4" key={order.id}><strong>{order.id}</strong><dl className="mt-3 grid gap-3 text-sm"><div><dt className="font-bold text-ink-soft">Người mua</dt><dd className="m-0">{order.buyerName}<br />{maskOrganizerEmail(order.buyerEmail)}</dd></div><div><dt className="font-bold text-ink-soft">Tổng tiền</dt><dd className="m-0">{order.total.toLocaleString('vi-VN')}đ</dd></div><div><dt className="font-bold text-ink-soft">Trạng thái</dt><dd className="m-0"><OrganizerStatusBadge label={labels[order.paymentStatus]} tone={tones[order.paymentStatus]} /></dd></div></dl><button className="mt-4 min-h-10 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={(event) => onOpen(order.id, event.currentTarget)}>Xem chi tiết</button></article>)}
    </OrganizerResponsiveRecordList>
  </>
}
