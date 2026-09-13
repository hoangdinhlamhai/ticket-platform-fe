import type {
  AdminAccountStatus,
  AdminAuditEntry,
  AdminCase,
  AdminCaseStatus,
  AdminCategory,
  AdminDailyMetric,
  AdminEvent,
  AdminOrder,
  AdminOrganizer,
  AdminPayout,
  AdminPayoutStatus,
  AdminRefund,
  AdminRefundStatus,
  AdminResale,
  AdminResaleVisibility,
  AdminReviewDecision,
  AdminTicket,
  AdminUser,
} from './admin-records.ts'

export type AdminWorkspace = {
  readonly events: readonly AdminEvent[]
  readonly cases: readonly AdminCase[]
  readonly organizers: readonly AdminOrganizer[]
  readonly users: readonly AdminUser[]
  readonly orders: readonly AdminOrder[]
  readonly tickets: readonly AdminTicket[]
  readonly resales: readonly AdminResale[]
  readonly refunds: readonly AdminRefund[]
  readonly payouts: readonly AdminPayout[]
  readonly dailyMetrics: readonly AdminDailyMetric[]
  readonly categories: readonly AdminCategory[]
  readonly moderationChecklist: readonly string[]
  readonly moderationReasons: readonly string[]
  readonly auditEntries: readonly AdminAuditEntry[]
}

export type AdminOperationResult = {
  readonly kind:
    | 'event_reviewed'
    | 'organizer_verification_updated'
    | 'organizer_account_updated'
    | 'user_account_updated'
    | 'resale_visibility_updated'
    | 'case_updated'
    | 'refund_updated'
    | 'payout_updated'
    | 'category_updated'
    | 'moderation_settings_updated'
    | 'operation_rejected'
  readonly reason?: string
}

export type AdminWorkspaceTransition = {
  readonly state: AdminWorkspace
  readonly result: AdminOperationResult | null
}

type AuditedAction = {
  readonly occurredAt: string
  readonly auditId: string
}

export type AdminWorkspaceAction =
  | (AuditedAction & {
      readonly type: 'review_event'
      readonly eventId: string
      readonly decision: AdminReviewDecision
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'decide_organizer_verification'
      readonly organizerId: string
      readonly decision: 'verified' | 'changes_requested' | 'rejected'
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'set_organizer_account_status'
      readonly organizerId: string
      readonly status: AdminAccountStatus
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'set_user_account_status'
      readonly userId: string
      readonly status: AdminAccountStatus
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'set_resale_visibility'
      readonly listingId: string
      readonly visibility: AdminResaleVisibility
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'update_case_status'
      readonly caseId: string
      readonly status: AdminCaseStatus
      readonly resolution: string
    })
  | (AuditedAction & {
      readonly type: 'decide_refund'
      readonly refundId: string
      readonly status: Extract<AdminRefundStatus, 'approved' | 'rejected'>
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'set_payout_status'
      readonly payoutId: string
      readonly status: Extract<AdminPayoutStatus, 'on_hold' | 'released'>
      readonly reason: string
    })
  | (AuditedAction & {
      readonly type: 'update_category'
      readonly categoryId: string
      readonly patch: Pick<AdminCategory, 'label' | 'active'>
    })
  | (AuditedAction & {
      readonly type: 'update_moderation_settings'
      readonly checklist: readonly string[]
      readonly reasons: readonly string[]
    })
  | { readonly type: 'clear_last_operation' }
