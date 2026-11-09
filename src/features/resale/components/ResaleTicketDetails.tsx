import type { ResaleListing } from '../types/resale'

type ResaleTicketDetailsProps = {
  listing: ResaleListing
}

export function ResaleTicketDetails({ listing }: ResaleTicketDetailsProps) {
  return (
    <section aria-labelledby="resale-ticket-details-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
        TẤT CẢ THÔNG TIN TRƯỚC KHI MUA
      </p>
      <h2
        id="resale-ticket-details-title"
        className="mt-2 mb-0 font-body text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.86] font-extrabold tracking-[-0.09em]"
      >
        Một chỗ ngồi, nhìn thật rõ.
      </h2>
      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line mobile:grid-cols-1">
        {[
          ['Loại vé', listing.ticketType],
          ['Khu vực', listing.section],
          ['Hàng', listing.row ?? 'Không xếp hàng'],
          [
            'Ghế',
            listing.seats.length ? listing.seats.join(', ') : 'Khu đứng tự do',
          ],
          ['Số lượng', `${listing.quantity} vé`],
          [
            'Hình thức',
            listing.seatingType === 'assigned'
              ? 'Ghế chỉ định'
              : 'Vào khu tự do',
          ],
        ].map(([label, value]) => (
          <div key={label} className="bg-surface p-5">
            <span className="text-xs font-extrabold tracking-[0.07em] text-ink-soft">
              {label.toLocaleUpperCase('vi')}
            </span>
            <strong className="mt-2 block text-lg font-extrabold text-ink">
              {value}
            </strong>
          </div>
        ))}
      </div>
    </section>
  )
}
