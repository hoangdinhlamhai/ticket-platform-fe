import type { AttendeeOrder } from '../types/order'
export const MOCK_ATTENDEE_ORDERS: readonly AttendeeOrder[] = [
  { id: 'ORD-240812', source: 'primary', status: 'completed', eventId: 'vong-khuc-thanh-pho', eventTitle: 'Vọng khúc thành phố', buyer: { fullName: 'Minh Anh', email: 'minhanh@example.com', phone: '0901234567' }, items: [{ label: 'Balcony', quantity: 1, unitPrice: 390000 }], subtotal: 390000, serviceFee: 0, total: 390000, createdAt: '2026-08-12T10:30:00.000Z', paidAt: '2026-08-12T10:31:00.000Z', issuedTicketIds: ['ticket-vong-khuc'] },
  { id: 'ORD-240820', source: 'primary', status: 'failed', eventId: 'midnight-market-live-set', eventTitle: 'Midnight Market: Live Set', buyer: { fullName: 'Minh Anh', email: 'minhanh@example.com', phone: '0901234567' }, items: [{ label: 'Standing', quantity: 1, unitPrice: 520000 }], subtotal: 520000, serviceFee: 0, total: 520000, createdAt: '2026-08-20T09:15:00.000Z', paidAt: null, issuedTicketIds: [] },
]
