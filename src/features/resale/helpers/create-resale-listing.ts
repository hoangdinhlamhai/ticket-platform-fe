import type { CustomerProfile } from '../../profile'
import type { OwnedTicket } from '../../tickets'
import type { ResaleListing } from '../types/resale'
export function createResaleListing(ticket: OwnedTicket, price: number, profile: CustomerProfile): ResaleListing {
  if (!Number.isFinite(price) || price <= 0) throw new Error('Giá bán phải lớn hơn 0.')
  const sequence = Date.now().toString().slice(-8)
  return { id: `resale-user-${sequence}`, eventId: ticket.eventId, availability: 'available', eventTitle: ticket.eventTitle, startsAt: ticket.date, venue: ticket.venue, city: ticket.address.split(',').at(-1)?.trim() || 'TP. Hồ Chí Minh', ticketType: ticket.ticketType, section: ticket.section ?? 'Theo vé gốc', row: ticket.row ?? null, seats: ticket.seats ?? [], quantity: 1, seatingType: ticket.seats?.length ? 'assigned' : 'general-admission', usageTerms: ['Credential cũ sẽ bị vô hiệu khi giao dịch mock hoàn tất.', 'Listing chỉ tồn tại trong phiên trình diễn.'], price, seller: { name: profile.fullName, verified: true, joinedAt: 'Hồ sơ hiện tại', completedSales: 0 }, posterTone: 'coral', sourceTicketId: ticket.id, ownerLabel: 'current-profile', listingStatus: 'active' }
}
