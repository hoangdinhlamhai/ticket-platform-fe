import type { AdminPayoutStatus, AdminReviewStatus, AdminVerificationStatus } from '../types/admin-records.ts'

export type AdminSensitiveOperation = 'approve_event' | 'request_event_changes' | 'reject_event' | 'verify_organizer' | 'request_organizer_changes' | 'reject_organizer' | 'restrict_organizer' | 'suspend_organizer' | 'restore_organizer' | 'restrict_user' | 'suspend_user' | 'restore_user' | 'hide_resale' | 'restore_resale' | 'approve_refund' | 'reject_refund' | 'hold_payout' | 'release_payout' | 'resolve_case' | 'dismiss_case'

const requiredReasonOperations: ReadonlySet<AdminSensitiveOperation> = new Set(['request_event_changes', 'reject_event', 'request_organizer_changes', 'reject_organizer', 'restrict_organizer', 'suspend_organizer', 'restrict_user', 'suspend_user', 'hide_resale', 'reject_refund', 'hold_payout', 'resolve_case', 'dismiss_case'])

export function validateAdminReason(operation: AdminSensitiveOperation, reason: string) {
  const trimmed = reason.trim()
  return requiredReasonOperations.has(operation) && !trimmed
    ? { valid: false, reason: null }
    : { valid: true, reason: trimmed || null }
}
export function canReviewEvent(status: AdminReviewStatus) { return status === 'pending_review' }
export function canDecideOrganizerVerification(status: AdminVerificationStatus) { return status === 'pending' }
export function canHoldPayout(status: AdminPayoutStatus) { return status === 'scheduled' || status === 'pending' || status === 'released' }
