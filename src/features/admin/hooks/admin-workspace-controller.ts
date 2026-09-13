import type { AdminAccountStatus, AdminCaseStatus, AdminCategory, AdminPayoutStatus, AdminRefundStatus, AdminResaleVisibility, AdminReviewDecision } from '../types/admin-records.ts'
import type { AdminOperationResult, AdminWorkspace } from '../types/admin-workspace.ts'

export type AdminWorkspaceController = {
  readonly workspace: AdminWorkspace
  readonly lastOperation: AdminOperationResult | null
  readonly reviewEvent: (eventId: string, decision: AdminReviewDecision, reason: string) => AdminOperationResult | null
  readonly decideOrganizerVerification: (organizerId: string, decision: 'verified' | 'changes_requested' | 'rejected', reason: string) => AdminOperationResult | null
  readonly setOrganizerAccountStatus: (organizerId: string, status: AdminAccountStatus, reason: string) => AdminOperationResult | null
  readonly setUserAccountStatus: (userId: string, status: AdminAccountStatus, reason: string) => AdminOperationResult | null
  readonly setResaleVisibility: (listingId: string, visibility: AdminResaleVisibility, reason: string) => AdminOperationResult | null
  readonly updateCaseStatus: (caseId: string, status: AdminCaseStatus, resolution: string) => AdminOperationResult | null
  readonly decideRefund: (refundId: string, status: Extract<AdminRefundStatus, 'approved' | 'rejected'>, reason: string) => AdminOperationResult | null
  readonly setPayoutStatus: (payoutId: string, status: Extract<AdminPayoutStatus, 'on_hold' | 'released'>, reason: string) => AdminOperationResult | null
  readonly updateCategory: (categoryId: string, patch: Pick<AdminCategory, 'label' | 'active'>) => AdminOperationResult | null
  readonly updateModerationSettings: (checklist: readonly string[], reasons: readonly string[]) => AdminOperationResult | null
  readonly clearLastOperation: () => AdminOperationResult | null
}
