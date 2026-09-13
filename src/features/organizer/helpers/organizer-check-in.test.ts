import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import type { OrganizerCheckInActivity } from '../types/organizer-commerce.ts'
import {
  classifyOrganizerCheckInLookup,
  findOrganizerCheckInCandidates,
} from './find-organizer-check-in-candidates.ts'
import { organizerWorkspaceReducer } from './organizer-workspace-reducer.ts'
import { sortOrganizerCheckInActivities } from './organizer-check-in-transitions.ts'

const organizerRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const projectRoot = resolve(organizerRoot, '..', '..', '..')

function source(path: string) {
  return readFileSync(resolve(organizerRoot, path), 'utf8')
}

function organizerSourceFiles(directory = organizerRoot): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) return organizerSourceFiles(path)
    return /\.(?:ts|tsx)$/.test(entry.name) ? [path] : []
  })
}

function createCheckInActivity(id: string, checkedInAt: string): OrganizerCheckInActivity {
  return { id, eventId: 'org-event-published', attendeeId: id, checkedInAt }
}

test('looks up normalized name, email, ticket and order references within one event only', () => {
  const workspace = createOrganizerWorkspace()
  const eventId = 'org-event-published'

  assert.deepEqual(
    findOrganizerCheckInCandidates(workspace.attendees, workspace.orders, eventId, 'nguyen minh anh').map((item) => item.id),
    ['attendee-pub-01'],
  )
  assert.deepEqual(
    findOrganizerCheckInCandidates(workspace.attendees, workspace.orders, eventId, 'BAO.TRAN@EXAMPLE.COM').map((item) => item.id),
    ['attendee-pub-03'],
  )
  assert.deepEqual(
    findOrganizerCheckInCandidates(workspace.attendees, workspace.orders, eventId, 'sv-chay-004').map((item) => item.id),
    ['attendee-pub-04'],
  )
  assert.deepEqual(
    findOrganizerCheckInCandidates(workspace.attendees, workspace.orders, eventId, 'order-published-01').map((item) => item.id),
    ['attendee-pub-01', 'attendee-pub-02'],
  )
  assert.equal(
    findOrganizerCheckInCandidates(workspace.attendees, workspace.orders, eventId, 'nv-003').length,
    0,
  )
})

test('classifies exact foreign ticket and order references without returning a selectable attendee', () => {
  const workspace = createOrganizerWorkspace()
  const eventId = 'org-event-published'
  const foreignAttendee = workspace.attendees.find((item) => item.eventId !== eventId)!
  const foreignOrder = workspace.orders.find((item) => item.id === foreignAttendee.orderId)!

  assert.deepEqual(
    classifyOrganizerCheckInLookup(workspace.attendees, workspace.orders, eventId, foreignAttendee.ticketReference),
    { kind: 'wrong_event', attendees: [] },
  )
  assert.deepEqual(
    classifyOrganizerCheckInLookup(workspace.attendees, workspace.orders, eventId, foreignOrder.id),
    { kind: 'wrong_event', attendees: [] },
  )
  assert.deepEqual(
    classifyOrganizerCheckInLookup(workspace.attendees, workspace.orders, eventId, 'does-not-exist'),
    { kind: 'not_found', attendees: [] },
  )
})

test('orders check-in activities by their parsed instants across mixed offsets', () => {
  const activities = [
    createCheckInActivity('local-newer', '2026-09-03T08:15:00+07:00'),
    createCheckInActivity('utc-earlier', '2026-09-03T01:10:00Z'),
    createCheckInActivity('offset-newest', '2026-09-03T00:30:00-01:00'),
  ]

  assert.deepEqual(
    sortOrganizerCheckInActivities(activities).map((activity) => activity.id),
    ['offset-newest', 'local-newer', 'utc-earlier'],
  )
})

test('keeps the reducer canonical for success, rejection, and rapid repeat', () => {
  const workspace = createOrganizerWorkspace()
  const valid = workspace.attendees.find((item) => item.id === 'attendee-pub-01')!
  const checked = organizerWorkspaceReducer(workspace, {
    type: 'check_in_attendee', eventId: valid.eventId, attendeeId: valid.id, checkedInAt: '2026-09-03T08:00:00.000Z',
  })
  const repeated = organizerWorkspaceReducer(checked.state, {
    type: 'check_in_attendee', eventId: valid.eventId, attendeeId: valid.id, checkedInAt: '2026-09-03T08:00:01.000Z',
  })
  const voided = workspace.attendees.find((item) => item.credentialStatus === 'void')!
  const wrongEventId = workspace.events.find((item) => item.id !== valid.eventId)!.id
  const voidResult = organizerWorkspaceReducer(workspace, {
    type: 'check_in_attendee', eventId: voided.eventId, attendeeId: voided.id, checkedInAt: '2026-09-03T08:00:00.000Z',
  })
  const wrongEventResult = organizerWorkspaceReducer(workspace, {
    type: 'check_in_attendee', eventId: wrongEventId, attendeeId: valid.id, checkedInAt: '2026-09-03T08:00:00.000Z',
  })
  const missingResult = organizerWorkspaceReducer(workspace, {
    type: 'check_in_attendee', eventId: valid.eventId, attendeeId: 'unknown', checkedInAt: '2026-09-03T08:00:00.000Z',
  })

  assert.equal(checked.result?.outcome, 'success')
  assert.equal(checked.state.checkInActivities.length, workspace.checkInActivities.length + 1)
  assert.equal(repeated.result?.outcome, 'already_checked_in')
  assert.equal(repeated.state, checked.state)
  assert.equal(voidResult.result?.outcome, 'revoked')
  assert.equal(voidResult.state, workspace)
  assert.equal(wrongEventResult.result?.outcome, 'wrong_event')
  assert.equal(wrongEventResult.state, workspace)
  assert.equal(missingResult.result?.outcome, 'not_found')
  assert.equal(missingResult.state, workspace)
})

test('keeps the check-in console interaction scoped, resettable, and scanner-free', () => {
  const page = source('pages/OrganizerCheckInPage.tsx')
  const application = readFileSync(resolve(projectRoot, 'src/app/OrganizerApplication.tsx'), 'utf8')
  const activity = source('components/OrganizerCheckInActivity.tsx')

  assert.match(application, /<OrganizerCheckInPage key=\{eventId\}/)
  assert.match(page, /setSearchedQuery\(''\)/)
  assert.match(page, /setSelectedAttendeeId\(null\)/)
  assert.match(page, /searchInputRef\.current\?\.focus\(\)/)
  assert.match(page, /lastOperation\.targetIds\.eventId === eventId/)
  assert.match(page, /lastOperation\.targetIds\.attendeeId === selectedAttendeeId/)
  assert.match(application, /const notice = workspace\.lastOperation\?\.kind === 'check_in' \? '' : getOperationNotice\(workspace\.lastOperation\)/)
  assert.match(application, /notice=\{notice\}/)
  assert.match(activity, /sortOrganizerCheckInActivities\(activities\)\.slice\(0, 6\)/)

  const forbiddenPatterns = [
    new RegExp(['media', 'Devices'].join('')),
    new RegExp(['Barcode', 'Detector'].join('')),
    new RegExp(['QR', 'Code'].join('')),
    new RegExp(['qr', '-scanner'].join(''), 'i'),
  ]
  const checkedSources = [
    ...organizerSourceFiles(),
    resolve(projectRoot, 'package.json'),
  ]
  for (const filePath of checkedSources) {
    const contents = readFileSync(filePath, 'utf8')
    for (const pattern of forbiddenPatterns) {
      assert.doesNotMatch(contents, pattern, filePath)
    }
  }
})
