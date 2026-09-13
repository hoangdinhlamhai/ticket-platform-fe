import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminWorkspace } from '../mock/create-admin-workspace.ts'
import { adminWorkspaceReducer } from './admin-workspace-reducer.ts'
import { selectAdminDashboard } from './select-admin-dashboard.ts'

const NOW = '2026-09-05T09:00:00.000Z'

function metricValue(workspace: ReturnType<typeof createAdminWorkspace>, id: string) {
  return selectAdminDashboard(workspace).metrics.find((item) => item.id === id)?.value
}

test('derives dashboard metric counts from canonical records', () => {
  const workspace = createAdminWorkspace()
  const dashboard = selectAdminDashboard(workspace)

  assert.equal(metricValue(workspace, 'pending-event-reviews'), workspace.events.filter((item) => item.reviewStatus === 'pending_review').length)
  assert.equal(metricValue(workspace, 'open-cases'), workspace.cases.filter((item) => !['resolved', 'dismissed'].includes(item.status)).length)
  assert.equal(metricValue(workspace, 'pending-organizer-verifications'), workspace.organizers.filter((item) => item.verificationStatus === 'pending').length)
  assert.equal(dashboard.transactionSeries.length, 30)
  assert.equal(dashboard.transactionSeries, workspace.dailyMetrics)
})

test('sorts work items by priority then oldest creation time', () => {
  const workspace = createAdminWorkspace()
  const items = selectAdminDashboard(workspace).workItems
  const weight = { critical: 0, high: 1, medium: 2, low: 3 } as const

  for (let index = 1; index < items.length; index += 1) {
    const previous = items[index - 1]!
    const current = items[index]!
    const priorityOrder = weight[previous.priority] - weight[current.priority]
    assert.ok(priorityOrder < 0 || (priorityOrder === 0 && previous.createdAt <= current.createdAt))
  }
})

test('removes resolved cases from the open-work metric and queue', () => {
  const workspace = createAdminWorkspace()
  const openCase = workspace.cases.find((item) => item.status === 'open')
  assert.ok(openCase)
  const before = metricValue(workspace, 'open-cases')
  const transition = adminWorkspaceReducer(workspace, {
    type: 'update_case_status',
    caseId: openCase.id,
    status: 'resolved',
    resolution: 'Đã đối chiếu chứng cứ và hoàn tất xử lý.',
    occurredAt: NOW,
    auditId: 'audit-case-resolution',
  })
  const after = metricValue(transition.state, 'open-cases')
  assert.equal(after, (before ?? 0) - 1)
  assert.equal(selectAdminDashboard(transition.state).workItems.some((item) => item.targetId === openCase.id), false)
})
