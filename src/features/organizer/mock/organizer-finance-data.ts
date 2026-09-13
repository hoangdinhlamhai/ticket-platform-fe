import type { OrganizerPayout, OrganizerRefund } from '../types/organizer-commerce.ts'

export const ORGANIZER_REFUND_FIXTURES: readonly OrganizerRefund[] = [
  { id: 'refund-ended-01', orderId: 'order-refunded-01', amount: 150000, reason: 'Khách hủy trước thời hạn quy định', createdAt: '2026-08-05T10:00:00+07:00' },
]

export const ORGANIZER_PAYOUT_FIXTURES: readonly OrganizerPayout[] = [
  { id: 'payout-ended-01', eventId: 'org-event-ended', amount: 300000, status: 'paid', scheduledAt: '2026-08-22T09:00:00+07:00', paidAt: '2026-08-22T11:00:00+07:00' },
  { id: 'payout-ongoing-01', eventId: 'org-event-ongoing', amount: 500000, status: 'pending', scheduledAt: '2026-09-05T09:00:00+07:00', paidAt: null },
  { id: 'payout-published-01', eventId: 'org-event-published', amount: 900000, status: 'scheduled', scheduledAt: '2026-10-30T09:00:00+07:00', paidAt: null },
]
