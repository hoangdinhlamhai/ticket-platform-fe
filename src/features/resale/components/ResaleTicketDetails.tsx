import { TicketIcon } from '../../../components/icons/TicketlyIcons'
import type { ResaleListing } from '../types/resale'

type ResaleTicketDetailsProps = {
  listing: ResaleListing
}

export function ResaleTicketDetails({ listing }: ResaleTicketDetailsProps) {
  return (
    <section aria-labelledby="resale-ticket-details-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">TẤT CẢ THÔNG TIN TRƯỚC KHI MUA</p>
      <h2 id="resale-ticket-details-title" className="mt-2 mb-0 font-body text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.86] font-extrabold tracking-[-0.09em]">Một chỗ ngồi, nhìn thật rõ.</h2>
      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line mobile:grid-cols-1">
        {[
          ['Loại vé', listing.ticketType],
          ['Khu vực', listing.section],
          ['Hàng', listing.row ?? 'Không xếp hàng'],
          ['Ghế', listing.seats.length ? listing.seats.join(', ') : 'Khu đứng tự do'],
          ['Số lượng', `${listing.quantity} vé`],
          ['Hình thức', listing.seatingType === 'assigned' ? 'Ghế chỉ định' : 'Vào khu tự do'],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-5">
            <span className="text-xs font-extrabold tracking-[0.07em] text-ink-soft">{label.toLocaleUpperCase('vi')}</span>
            <strong className="mt-2 block text-lg font-extrabold text-ink">{value}</strong>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg bg-paper-deep p-5">
        <h3 className="m-0 flex items-center gap-2 text-lg font-extrabold"><TicketIcon className="h-5 w-5 text-blue" />Điều kiện sử dụng</h3>
        <ul className="mt-4 mb-0 space-y-2 pl-5 text-sm leading-[1.6] text-ink-soft">
          {listing.usageTerms.map((term) => <li key={term}>{term}</li>)}
        </ul>
      </div>
    </section>
  )
}
