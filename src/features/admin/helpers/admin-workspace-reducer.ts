import {
  canDecideOrganizerVerification,
  canHoldPayout,
  canReviewEvent,
  validateAdminReason,
  type AdminSensitiveOperation,
} from './admin-transitions.ts'
import type {
  AdminAccountStatus,
  AdminAuditEntry,
  AdminCaseStatus,
  AdminReviewDecision,
} from '../types/admin-records.ts'
import type {
  AdminOperationResult,
  AdminWorkspace,
  AdminWorkspaceAction,
  AdminWorkspaceTransition,
} from '../types/admin-workspace.ts'

function rejected(state: AdminWorkspace, reason: string): AdminWorkspaceTransition {
  return { state, result: { kind: 'operation_rejected', reason } }
}

function completed(
  state: AdminWorkspace,
  nextState: Omit<AdminWorkspace, 'auditEntries'>,
  audit: AdminAuditEntry,
  result: AdminOperationResult,
): AdminWorkspaceTransition {
  return {
    state: { ...nextState, auditEntries: [audit, ...state.auditEntries] },
    result,
  }
}

function createAudit(
  action: string,
  targetType: AdminAuditEntry['targetType'],
  targetId: string,
  reason: string | null,
  occurredAt: string,
  id: string,
): AdminAuditEntry {
  return {
    id,
    actorLabel: 'Admin demo',
    action,
    targetType,
    targetId,
    reason,
    occurredAt,
    metadata: 'Thao tác trong phiên dữ liệu minh họa.',
  }
}

function replacement<T extends { readonly id: string }>(items: readonly T[], next: T): readonly T[] {
  return items.map((item) => (item.id === next.id ? next : item))
}

function operationForReview(decision: AdminReviewDecision): AdminSensitiveOperation {
  if (decision === 'approved') return 'approve_event'
  return decision === 'changes_requested' ? 'request_event_changes' : 'reject_event'
}

function isReviewDecision(value: unknown): value is AdminReviewDecision {
  return value === 'approved' || value === 'changes_requested' || value === 'rejected'
}

function normalizedSettings(values: readonly string[]) {
  return values.map((value) => value.trim())
}

function canChangeAccountStatus(current: AdminAccountStatus, next: AdminAccountStatus) {
  if (current === next) return false
  if (next === 'active') return current === 'restricted' || current === 'suspended'
  return current === 'active'
}

function canUpdateCaseStatus(current: AdminCaseStatus, next: AdminCaseStatus) {
  if (current === 'resolved' || current === 'dismissed' || current === next) return false
  return next === 'investigating' || next === 'waiting_for_information' || next === 'resolved' || next === 'dismissed'
}

function caseOperation(status: Extract<AdminCaseStatus, 'resolved' | 'dismissed'>): AdminSensitiveOperation {
  return status === 'resolved' ? 'resolve_case' : 'dismiss_case'
}

export function adminWorkspaceReducer(
  state: AdminWorkspace,
  action: AdminWorkspaceAction,
): AdminWorkspaceTransition {
  if (action.type === 'clear_last_operation') return { state, result: null }

  if (action.type === 'update_category') {
    const category = state.categories.find((item) => item.id === action.categoryId)
    const label = action.patch.label.trim()
    if (!category) return rejected(state, 'Không tìm thấy danh mục.')
    if (!label) return rejected(state, 'Tên danh mục không được để trống.')
    return completed(
      state,
      {
        ...state,
        categories: replacement(state.categories, {
          ...category,
          ...action.patch,
          label,
        }),
      },
      createAudit(
        'Cập nhật danh mục sự kiện',
        'category',
        category.id,
        null,
        action.occurredAt,
        action.auditId,
      ),
      { kind: 'category_updated' },
    )
  }

  if (action.type === 'update_moderation_settings') {
    const checklist = normalizedSettings(action.checklist)
    const reasons = normalizedSettings(action.reasons)
    if (!checklist.length || !reasons.length || checklist.some((item) => !item) || reasons.some((item) => !item)) {
      return rejected(state, 'Checklist và lý do moderation không được để trống.')
    }
    return completed(
      state,
      { ...state, moderationChecklist: checklist, moderationReasons: reasons },
      createAudit(
        'Cập nhật cấu hình moderation',
        'settings',
        'moderation-settings',
        null,
        action.occurredAt,
        action.auditId,
      ),
      { kind: 'moderation_settings_updated' },
    )
  }

  if (action.type === 'review_event') {
    if (!isReviewDecision(action.decision)) {
      return rejected(state, 'Quyết định xét duyệt không hợp lệ.')
    }
    const event = state.events.find((item) => item.id === action.eventId)
    const validation = validateAdminReason(operationForReview(action.decision), action.reason)
    if (!event) return rejected(state, 'Không tìm thấy sự kiện.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do cho quyết định này.')
    if (!canReviewEvent(event.reviewStatus)) {
      return rejected(state, 'Sự kiện không thể được xét duyệt ở trạng thái hiện tại.')
    }

    const next = {
      ...event,
      reviewStatus: action.decision,
      reviewHistory: [{
        id: action.auditId,
        submittedAt: event.submittedAt,
        reviewedAt: action.occurredAt,
        decision: action.decision,
        reason: validation.reason,
      }, ...event.reviewHistory],
    }
    const auditAction = action.decision === 'approved'
      ? 'Duyệt sự kiện'
      : action.decision === 'rejected'
        ? 'Từ chối sự kiện'
        : 'Yêu cầu chỉnh sửa sự kiện'
    return completed(
      state,
      { ...state, events: replacement(state.events, next) },
      createAudit(auditAction, 'event', event.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'event_reviewed' },
    )
  }

  if (action.type === 'decide_organizer_verification') {
    const organizer = state.organizers.find((item) => item.id === action.organizerId)
    const operation: AdminSensitiveOperation = action.decision === 'verified'
      ? 'verify_organizer'
      : action.decision === 'rejected'
        ? 'reject_organizer'
        : 'request_organizer_changes'
    const validation = validateAdminReason(operation, action.reason)
    if (!organizer) return rejected(state, 'Không tìm thấy Organizer.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do cho quyết định này.')
    if (!canDecideOrganizerVerification(organizer.verificationStatus)) {
      return rejected(state, 'Hồ sơ xác minh không thể xử lý.')
    }
    return completed(
      state,
      { ...state, organizers: replacement(state.organizers, { ...organizer, verificationStatus: action.decision }) },
      createAudit('Cập nhật xác minh Organizer', 'organizer', organizer.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'organizer_verification_updated' },
    )
  }

  if (action.type === 'set_organizer_account_status') {
    const organizer = state.organizers.find((item) => item.id === action.organizerId)
    const operation: AdminSensitiveOperation = action.status === 'active'
      ? 'restore_organizer'
      : action.status === 'restricted'
        ? 'restrict_organizer'
        : 'suspend_organizer'
    const validation = validateAdminReason(operation, action.reason)
    if (!organizer) return rejected(state, 'Không tìm thấy tài khoản Organizer.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do cho thao tác hạn chế.')
    if (!canChangeAccountStatus(organizer.accountStatus, action.status)) {
      return rejected(state, 'Tài khoản không thể đổi sang trạng thái này.')
    }
    return completed(
      state,
      { ...state, organizers: replacement(state.organizers, { ...organizer, accountStatus: action.status }) },
      createAudit('Cập nhật trạng thái tài khoản', 'organizer', organizer.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'organizer_account_updated' },
    )
  }

  if (action.type === 'set_user_account_status') {
    const user = state.users.find((item) => item.id === action.userId)
    const operation: AdminSensitiveOperation = action.status === 'active'
      ? 'restore_user'
      : action.status === 'restricted'
        ? 'restrict_user'
        : 'suspend_user'
    const validation = validateAdminReason(operation, action.reason)
    if (!user) return rejected(state, 'Không tìm thấy tài khoản người tham dự.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do cho thao tác hạn chế.')
    if (!canChangeAccountStatus(user.accountStatus, action.status)) {
      return rejected(state, 'Tài khoản không thể đổi sang trạng thái này.')
    }
    return completed(
      state,
      { ...state, users: replacement(state.users, { ...user, accountStatus: action.status }) },
      createAudit('Cập nhật trạng thái tài khoản', 'user', user.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'user_account_updated' },
    )
  }

  if (action.type === 'set_resale_visibility') {
    const listing = state.resales.find((item) => item.id === action.listingId)
    const operation: AdminSensitiveOperation = action.visibility === 'hidden' ? 'hide_resale' : 'restore_resale'
    const validation = validateAdminReason(operation, action.reason)
    if (!listing) return rejected(state, 'Không tìm thấy listing resale.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do khi ẩn listing.')
    if (listing.visibility === action.visibility) return rejected(state, 'Listing đã ở trạng thái này.')
    return completed(
      state,
      { ...state, resales: replacement(state.resales, { ...listing, visibility: action.visibility }) },
      createAudit(action.visibility === 'hidden' ? 'Ẩn listing resale' : 'Khôi phục listing resale', 'resale', listing.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'resale_visibility_updated' },
    )
  }

  if (action.type === 'update_case_status') {
    const item = state.cases.find((caseItem) => caseItem.id === action.caseId)
    if (!item) return rejected(state, 'Không tìm thấy vụ việc.')
    if (!canUpdateCaseStatus(item.status, action.status)) {
      return rejected(state, 'Vụ việc không thể đổi trạng thái.')
    }
    const requiresResolution = action.status === 'resolved' || action.status === 'dismissed'
    const validation = requiresResolution
      ? validateAdminReason(caseOperation(action.status), action.resolution)
      : { valid: true, reason: null }
    if (!validation.valid) return rejected(state, 'Vui lòng nhập ghi chú xử lý.')
    const next = {
      ...item,
      status: action.status,
      timeline: [{
        id: action.auditId,
        occurredAt: action.occurredAt,
        message: validation.reason ?? 'Đã cập nhật trạng thái vụ việc.',
      }, ...item.timeline],
    }
    return completed(
      state,
      { ...state, cases: replacement(state.cases, next) },
      createAudit('Cập nhật vụ việc', item.subjectType, item.subjectId, validation.reason, action.occurredAt, action.auditId),
      { kind: 'case_updated' },
    )
  }

  if (action.type === 'decide_refund') {
    const refund = state.refunds.find((item) => item.id === action.refundId)
    const operation: AdminSensitiveOperation = action.status === 'approved' ? 'approve_refund' : 'reject_refund'
    const validation = validateAdminReason(operation, action.reason)
    if (!refund) return rejected(state, 'Không tìm thấy refund.')
    if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do từ chối refund.')
    if (refund.status !== 'requested' && refund.status !== 'under_review') {
      return rejected(state, 'Refund không thể xử lý.')
    }
    return completed(
      state,
      { ...state, refunds: replacement(state.refunds, { ...refund, status: action.status }) },
      createAudit(action.status === 'approved' ? 'Duyệt refund' : 'Từ chối refund', 'refund', refund.id, validation.reason, action.occurredAt, action.auditId),
      { kind: 'refund_updated' },
    )
  }

  const payout = state.payouts.find((item) => item.id === action.payoutId)
  const operation: AdminSensitiveOperation = action.status === 'on_hold' ? 'hold_payout' : 'release_payout'
  const validation = validateAdminReason(operation, action.reason)
  if (!payout) return rejected(state, 'Không tìm thấy payout.')
  if (!validation.valid) return rejected(state, 'Vui lòng nhập lý do giữ payout.')
  const canChange = action.status === 'on_hold'
    ? canHoldPayout(payout.status)
    : payout.status === 'on_hold'
  if (!canChange) return rejected(state, 'Payout không thể đổi trạng thái.')
  return completed(
    state,
    { ...state, payouts: replacement(state.payouts, { ...payout, status: action.status }) },
    createAudit(action.status === 'on_hold' ? 'Giữ payout' : 'Mở giữ payout', 'payout', payout.id, validation.reason, action.occurredAt, action.auditId),
    { kind: 'payout_updated' },
  )
}
