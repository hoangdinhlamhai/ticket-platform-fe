import assert from 'node:assert/strict'
import test from 'node:test'
import { createAdminWorkspace } from '../mock/create-admin-workspace.ts'
import { filterAdminCases, filterAdminEvents } from './filter-admin-records.ts'

test('matches event titles and organizer names without Vietnamese accents', () => {
  const workspace = createAdminWorkspace()
  const original = workspace.events.map((item) => item.id)
  const titleMatch = filterAdminEvents(workspace.events, workspace.organizers, { query: 'am nhac' })
  const organizerMatch = filterAdminEvents(workspace.events, workspace.organizers, { query: 'su kien xanh' })

  assert.ok(titleMatch.some((item) => item.title.includes('Âm nhạc')))
  assert.ok(organizerMatch.some((item) => item.organizerId === 'org-green'))
  assert.deepEqual(workspace.events.map((item) => item.id), original)
})

test('filters cases by exact status and severity', () => {
  const workspace = createAdminWorkspace()
  const cases = filterAdminCases(workspace.cases, {
    statuses: ['open'],
    severities: ['critical'],
  })

  assert.ok(cases.length > 0)
  assert.ok(cases.every((item) => item.status === 'open' && item.severity === 'critical'))
})
