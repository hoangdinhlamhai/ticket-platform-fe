import type { PrimaryCheckoutSelection } from '../../orders'
import type { ResaleListing } from '../../resale/types/resale'
import type { OwnedTicket } from '../types/ticket'

type Input = { orderId: string; selection: PrimaryCheckoutSelection; buyerName: string }
export function issuePrimaryTickets({ orderId, selection, buyerName }: Input): OwnedTicket[] {
  return Array.from({ length: selection.quantity }, (_, index) => {
    const sequence = index + 1
    const suffix = `${orderId}-${sequence}`.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
    return {
      id: `ticket-${orderId.toLowerCase()}-${sequence}`,
      eventId: selection.eventId, eventTitle: selection.eventTitle, date: selection.date, venue: selection.venue, address: selection.address,
      ticketType: `${selection.ticketTierName} · Vé ${sequence}/${selection.quantity}`, holderName: buyerName,
      referenceCode: `TKL-${suffix}`, purchaseLabel: `Đơn minh họa · ${orderId}`, status: 'Sẵn sàng check-in',
      source: 'primary', orderId, credentialCode: `TKL-${suffix}`, credentialStatus: 'ready', resaleStatus: 'eligible',
      journey: [
        { label: 'Thanh toán mock hoàn tất', detail: `Đơn ${orderId} đã phát hành credential demo.`, state: 'complete' },
        { label: 'Sẵn sàng cho ngày diễn', detail: 'Kiểm tra thời gian và địa điểm trước khi tham dự.', state: 'current' },
        { label: 'Check-in tại sự kiện', detail: 'QR demo không có giá trị check-in thật.', state: 'future' },
      ],
    }
  })
}

export function issueResaleTicket({ orderId, listing, buyerName }: { orderId: string; listing: ResaleListing; buyerName: string }): OwnedTicket {
  const suffix = orderId.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  return {
    id: `ticket-${orderId.toLowerCase()}`,
    eventId: listing.eventId ?? '',
    eventTitle: listing.eventTitle,
    date: listing.startsAt,
    venue: listing.venue,
    address: `${listing.venue}, ${listing.city}`,
    ticketType: listing.ticketType,
    holderName: buyerName,
    referenceCode: `TKL-${suffix}`,
    purchaseLabel: `Resale mock · ${orderId}`,
    status: 'Sẵn sàng check-in',
    source: 'resale', orderId, credentialCode: `TKL-${suffix}`, credentialStatus: 'ready', resaleStatus: 'eligible',
    section: listing.section, row: listing.row, seats: listing.seats,
    journey: [
      { label: 'Thanh toán resale mock hoàn tất', detail: `Đơn ${orderId} đã được xác nhận.`, state: 'complete' },
      { label: 'Credential mới đã phát hành', detail: 'Credential nguồn được mô phỏng là đã vô hiệu.', state: 'current' },
      { label: 'Check-in tại sự kiện', detail: 'QR demo không có giá trị check-in thật.', state: 'future' },
    ],
  }
}
