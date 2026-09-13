import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminWorkspace } from '../mock/create-admin-workspace.ts'
import { adminWorkspaceReducer } from './admin-workspace-reducer.ts'
import type { AdminWorkspaceAction } from '../types/admin-workspace.ts'

const NOW = '2026-09-05T09:00:00.000Z'

function assertAudited(
  workspace: ReturnType<typeof createAdminWorkspace>,
  action: Parameters<typeof adminWorkspaceReducer>[1],
  expectedKind: string,
) {
  const transition = adminWorkspaceReducer(workspace, action)
  assert.notEqual(transition.state, workspace)
  assert.equal(transition.state.auditEntries.length, workspace.auditEntries.length + 1)
  assert.equal(transition.state.auditEntries[0]?.id, 'audit-test')
  assert.equal(transition.result?.kind, expectedKind)
  return transition
}

function assertRejected(
  workspace: ReturnType<typeof createAdminWorkspace>,
  action: Parameters<typeof adminWorkspaceReducer>[1],
) {
  const transition = adminWorkspaceReducer(workspace, action)
  assert.equal(transition.state, workspace)
  assert.equal(transition.state.auditEntries.length, workspace.auditEntries.length)
  assert.equal(transition.result?.kind, 'operation_rejected')
}

test('updates an event review and its audit entry atomically', () => {
  const workspace = createAdminWorkspace()
  const pending = workspace.events.find((item) => item.reviewStatus === 'pending_review')
  assert.ok(pending)
  const transition = assertAudited(workspace, {
    type: 'review_event', eventId: pending.id, decision: 'changes_requested', reason: ' Thiếu chính sách hoàn vé ', occurredAt: NOW, auditId: 'audit-test',
  }, 'event_reviewed')
  assert.equal(transition.state.events.find((item) => item.id === pending.id)?.reviewStatus, 'changes_requested')
  assert.equal(transition.state.auditEntries[0]?.reason, 'Thiếu chính sách hoàn vé')
})

test('records one audit entry for every sensitive workflow family', () => {
  const verificationWorkspace = createAdminWorkspace()
  const pendingOrganizer = verificationWorkspace.organizers.find((item) => item.verificationStatus === 'pending')
  assert.ok(pendingOrganizer)
  assertAudited(verificationWorkspace, { type: 'decide_organizer_verification', organizerId: pendingOrganizer.id, decision: 'verified', reason: '', occurredAt: NOW, auditId: 'audit-test' }, 'organizer_verification_updated')

  const organizerWorkspace = createAdminWorkspace()
  const activeOrganizer = organizerWorkspace.organizers.find((item) => item.accountStatus === 'active')
  assert.ok(activeOrganizer)
  assertAudited(organizerWorkspace, { type: 'set_organizer_account_status', organizerId: activeOrganizer.id, status: 'restricted', reason: ' Vi phạm quy định ', occurredAt: NOW, auditId: 'audit-test' }, 'organizer_account_updated')

  const userWorkspace = createAdminWorkspace()
  const activeUser = userWorkspace.users.find((item) => item.accountStatus === 'active')
  assert.ok(activeUser)
  assertAudited(userWorkspace, { type: 'set_user_account_status', userId: activeUser.id, status: 'suspended', reason: ' Cần xác minh ', occurredAt: NOW, auditId: 'audit-test' }, 'user_account_updated')

  const resaleWorkspace = createAdminWorkspace()
  const visibleListing = resaleWorkspace.resales.find((item) => item.visibility === 'visible')
  assert.ok(visibleListing)
  assertAudited(resaleWorkspace, { type: 'set_resale_visibility', listingId: visibleListing.id, visibility: 'hidden', reason: ' Listing bị báo cáo ', occurredAt: NOW, auditId: 'audit-test' }, 'resale_visibility_updated')

  const caseWorkspace = createAdminWorkspace()
  const openCase = caseWorkspace.cases.find((item) => item.status === 'open')
  assert.ok(openCase)
  const caseTransition = assertAudited(caseWorkspace, { type: 'update_case_status', caseId: openCase.id, status: 'resolved', resolution: ' Đã đối chiếu chứng cứ ', occurredAt: NOW, auditId: 'audit-test' }, 'case_updated')
  assert.equal(caseTransition.state.auditEntries[0]?.targetType, openCase.subjectType)

  const refundWorkspace = createAdminWorkspace()
  const requestedRefund = refundWorkspace.refunds.find((item) => item.status === 'requested')
  assert.ok(requestedRefund)
  assertAudited(refundWorkspace, { type: 'decide_refund', refundId: requestedRefund.id, status: 'approved', reason: '', occurredAt: NOW, auditId: 'audit-test' }, 'refund_updated')

  const payoutWorkspace = createAdminWorkspace()
  const scheduledPayout = payoutWorkspace.payouts.find((item) => item.status === 'scheduled')
  assert.ok(scheduledPayout)
  assertAudited(payoutWorkspace, { type: 'set_payout_status', payoutId: scheduledPayout.id, status: 'on_hold', reason: ' Chờ xử lý refund ', occurredAt: NOW, auditId: 'audit-test' }, 'payout_updated')
})

test('rejects blank adverse reasons and invalid transitions without entity or audit mutations', () => {
  const eventWorkspace = createAdminWorkspace()
  const pendingEvent = eventWorkspace.events.find((item) => item.reviewStatus === 'pending_review')
  assert.ok(pendingEvent)
  assertRejected(eventWorkspace, { type: 'review_event', eventId: pendingEvent.id, decision: 'rejected', reason: '   ', occurredAt: NOW, auditId: 'audit-test' })

  const organizerWorkspace = createAdminWorkspace()
  const verifiedOrganizer = organizerWorkspace.organizers.find((item) => item.verificationStatus === 'verified')
  assert.ok(verifiedOrganizer)
  assertRejected(organizerWorkspace, { type: 'decide_organizer_verification', organizerId: verifiedOrganizer.id, decision: 'rejected', reason: 'Lý do', occurredAt: NOW, auditId: 'audit-test' })

  const accountWorkspace = createAdminWorkspace()
  const activeUser = accountWorkspace.users.find((item) => item.accountStatus === 'active')
  assert.ok(activeUser)
  assertRejected(accountWorkspace, { type: 'set_user_account_status', userId: activeUser.id, status: 'restricted', reason: ' ', occurredAt: NOW, auditId: 'audit-test' })

  const resaleWorkspace = createAdminWorkspace()
  const hiddenListing = resaleWorkspace.resales.find((item) => item.visibility === 'hidden')
  assert.ok(hiddenListing)
  assertRejected(resaleWorkspace, { type: 'set_resale_visibility', listingId: hiddenListing.id, visibility: 'hidden', reason: '', occurredAt: NOW, auditId: 'audit-test' })

  const caseWorkspace = createAdminWorkspace()
  const resolvedCase = caseWorkspace.cases.find((item) => item.status === 'resolved')
  assert.ok(resolvedCase)
  assertRejected(caseWorkspace, { type: 'update_case_status', caseId: resolvedCase.id, status: 'investigating', resolution: '', occurredAt: NOW, auditId: 'audit-test' })

  const refundWorkspace = createAdminWorkspace()
  const requestedRefund = refundWorkspace.refunds.find((item) => item.status === 'requested')
  assert.ok(requestedRefund)
  assertRejected(refundWorkspace, { type: 'decide_refund', refundId: requestedRefund.id, status: 'rejected', reason: ' ', occurredAt: NOW, auditId: 'audit-test' })

  const payoutWorkspace = createAdminWorkspace()
  const paidPayout = payoutWorkspace.payouts.find((item) => item.status === 'paid')
  assert.ok(paidPayout)
  assertRejected(payoutWorkspace, { type: 'set_payout_status', payoutId: paidPayout.id, status: 'on_hold', reason: 'Lý do', occurredAt: NOW, auditId: 'audit-test' })
})

test('rejects a runtime-invalid pending event decision without state or audit changes', () => {
  const workspace = createAdminWorkspace()
  const pending = workspace.events.find((item) => item.reviewStatus === 'pending_review')
  assert.ok(pending)

  assertRejected(workspace, {
    type: 'review_event',
    eventId: pending.id,
    decision: 'pending_review',
    reason: 'Giá trị runtime không hợp lệ',
    occurredAt: NOW,
    auditId: 'audit-test',
  } as unknown as AdminWorkspaceAction)
})

test('persists administrative settings and audits category and config changes', () => {
  const categoryWorkspace = createAdminWorkspace()
  const category = categoryWorkspace.categories[0]
  assert.ok(category)
  const categoryTransition = assertAudited(categoryWorkspace, {
    type: 'update_category',
    categoryId: category.id,
    patch: { label: ' Âm nhạc mới ', active: category.active },
    occurredAt: NOW,
    auditId: 'audit-test',
  }, 'category_updated')
  assert.equal(categoryTransition.state.categories[0]?.label, 'Âm nhạc mới')

  const settingsWorkspace = createAdminWorkspace()
  const checklist = ['Kiểm tra chính sách mới', ...settingsWorkspace.moderationChecklist.slice(1)]
  const reasons = ['Lý do mới', ...settingsWorkspace.moderationReasons.slice(1)]
  const settingsTransition = assertAudited(settingsWorkspace, {
    type: 'update_moderation_settings',
    checklist,
    reasons,
    occurredAt: NOW,
    auditId: 'audit-test',
  }, 'moderation_settings_updated')
  assert.deepEqual(settingsTransition.state.moderationChecklist, checklist)
  assert.deepEqual(settingsTransition.state.moderationReasons, reasons)
  assert.equal(settingsTransition.state.auditEntries[0]?.targetId, 'moderation-settings')
})

test('rejects invalid moderation configuration without changing state or audit', () => {
  const workspace = createAdminWorkspace()
  assertRejected(workspace, {
    type: 'update_moderation_settings',
    checklist: ['   '],
    reasons: workspace.moderationReasons,
    occurredAt: NOW,
    auditId: 'audit-test',
  })
})

test('creates isolated fixture state with valid cross-record references', () => {
  const first = createAdminWorkspace()
  const second = createAdminWorkspace()
  assert.notEqual(first.events, second.events)
  assert.notEqual(first.events[0], second.events[0])
  assert.notEqual(first.events[0]?.ticketTiers, second.events[0]?.ticketTiers)
  assert.notEqual(first.moderationChecklist, second.moderationChecklist)
  assert.notEqual(first.moderationReasons, second.moderationReasons)
  const organizerIds = new Set(first.organizers.map((item) => item.id))
  const eventIds = new Set(first.events.map((item) => item.id))
  const orderIds = new Set(first.orders.map((item) => item.id))
  const ticketIds = new Set(first.tickets.map((item) => item.id))
  assert.ok(first.events.every((item) => organizerIds.has(item.organizerId)))
  assert.ok(first.orders.every((item) => eventIds.has(item.eventId) && organizerIds.has(item.organizerId)))
  assert.ok(first.tickets.every((item) => orderIds.has(item.orderId) && eventIds.has(item.eventId)))
  assert.ok(first.resales.every((item) => ticketIds.has(item.ticketId)))
})
