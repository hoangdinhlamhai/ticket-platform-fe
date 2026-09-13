import assert from 'node:assert/strict'
import test from 'node:test'
import { getAdminCaseId, getAdminEventId, getAdminRoute, isAdminPath } from './admin-route.ts'

test('maps every static admin route before dynamic routes', () => {
  assert.equal(getAdminRoute('/admin'), 'dashboard')
  assert.equal(getAdminRoute('/admin/events/review'), 'event-reviews')
  assert.equal(getAdminRoute('/admin/cases'), 'cases')
  assert.equal(getAdminRoute('/admin/organizers'), 'organizers')
  assert.equal(getAdminRoute('/admin/users'), 'users')
  assert.equal(getAdminRoute('/admin/orders'), 'orders')
  assert.equal(getAdminRoute('/admin/tickets'), 'tickets')
  assert.equal(getAdminRoute('/admin/resale'), 'resale')
  assert.equal(getAdminRoute('/admin/refunds'), 'refunds')
  assert.equal(getAdminRoute('/admin/payouts'), 'payouts')
  assert.equal(getAdminRoute('/admin/settings'), 'settings')
  assert.equal(getAdminRoute('/admin/audit-logs'), 'audit-logs')
})

test('extracts event and case ids and keeps unknown admin paths in admin', () => {
  assert.equal(getAdminRoute('/admin/events/event-1/review'), 'event-review-detail')
  assert.equal(getAdminEventId('/admin/events/event-1/review'), 'event-1')
  assert.equal(getAdminRoute('/admin/cases/case-1'), 'case-detail')
  assert.equal(getAdminCaseId('/admin/cases/case-1'), 'case-1')
  assert.equal(getAdminRoute('/admin/unknown'), 'not-found')
  assert.equal(isAdminPath('/admin/unknown'), true)
})

test('normalizes suffixes and rejects unsafe encoded ids', () => {
  assert.equal(getAdminRoute('/admin/events/review/?tab=open#top'), 'event-reviews')
  assert.equal(getAdminRoute('/admin/events/a%2Fb/review'), 'not-found')
  assert.equal(getAdminEventId('/admin/events/%E0%A4%A/review'), null)
  assert.equal(isAdminPath('/administrator'), false)
})
