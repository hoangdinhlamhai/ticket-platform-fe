import {
  ORGANIZER_TICKET_SALE_STATUSES,
  type OrganizerTicketSaleStatus,
  type OrganizerTicketTier,
} from '../types/organizer-commerce.ts'
import type { OrganizerEventStatus } from '../types/organizer-event.ts'

export type OrganizerTicketSaleStatusTransition = {
  readonly allowed: boolean
  readonly reason?: string
}

function hasValidSalesWindow(tier: OrganizerTicketTier) {
  const salesStart = Date.parse(tier.salesStartAt)
  const salesEnd = Date.parse(tier.salesEndAt)
  return Number.isFinite(salesStart) && Number.isFinite(salesEnd) && salesStart < salesEnd
}

export function getCanonicalOrganizerTicketSaleStatus(
  tier: OrganizerTicketTier,
): OrganizerTicketSaleStatus {
  return tier.capacity === tier.soldCount && tier.saleStatus !== 'ended'
    ? 'sold_out'
    : tier.saleStatus
}

export function hasValidOrganizerTicketInventory(tier: OrganizerTicketTier) {
  return Number.isInteger(tier.capacity)
    && Number.isInteger(tier.soldCount)
    && Number.isInteger(tier.perOrderLimit)
    && tier.capacity >= tier.soldCount
    && tier.soldCount >= 0
    && tier.capacity >= 0
    && Number.isFinite(tier.price)
    && tier.price >= 0
    && tier.perOrderLimit > 0
    && tier.name.trim().length > 0
    && hasValidSalesWindow(tier)
    && ORGANIZER_TICKET_SALE_STATUSES.includes(tier.saleStatus)
}

export function getOrganizerTicketSaleStatusTransition(
  tier: OrganizerTicketTier,
  eventStatus: OrganizerEventStatus,
  nextStatus: OrganizerTicketSaleStatus,
  currentAt: string,
): OrganizerTicketSaleStatusTransition {
  const currentTime = Date.parse(currentAt)
  const salesStart = Date.parse(tier.salesStartAt)
  const salesEnd = Date.parse(tier.salesEndAt)
  const remainingCount = tier.capacity - tier.soldCount

  if (!Number.isFinite(currentTime)) {
    return { allowed: false, reason: 'Thời điểm kiểm tra trạng thái không hợp lệ.' }
  }
  if (tier.saleStatus === 'ended' && nextStatus !== 'ended') {
    return { allowed: false, reason: 'Hạng vé đã kết thúc không thể mở lại.' }
  }
  if (
    ['on_sale', 'sold_out'].includes(nextStatus)
    && !['published', 'ongoing'].includes(eventStatus)
  ) {
    return {
      allowed: false,
      reason: 'Chỉ sự kiện đã xuất bản hoặc đang diễn ra mới được bán vé.',
    }
  }
  if (nextStatus === 'on_sale' && !hasValidSalesWindow(tier)) {
    return { allowed: false, reason: 'Khoảng thời gian bán vé không hợp lệ.' }
  }
  if (nextStatus === 'on_sale' && currentTime < salesStart) {
    return { allowed: false, reason: 'Chưa đến thời điểm mở bán.' }
  }
  if (nextStatus === 'on_sale' && currentTime >= salesEnd) {
    return { allowed: false, reason: 'Đã qua thời điểm kết thúc bán.' }
  }
  if (nextStatus === 'on_sale' && remainingCount <= 0) {
    return { allowed: false, reason: 'Hạng vé đã hết chỗ.' }
  }
  if (nextStatus === 'sold_out' && remainingCount !== 0) {
    return { allowed: false, reason: 'Chỉ đánh dấu hết vé khi không còn chỗ.' }
  }

  return { allowed: true }
}
