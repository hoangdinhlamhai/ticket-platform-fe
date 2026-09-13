import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const organizerRoot = 'src/features/organizer'
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function source(path: string) {
  return readFileSync(`${organizerRoot}/${path}`, 'utf8')
}

function assertNoExternalSideEffects(path: string) {
  const content = source(path)

  for (const pattern of [
    /\bfetch\s*\(/,
    /XMLHttpRequest/,
    /navigator\.sendBeacon/,
    /\bBlob\s*\(/,
    /\bFormData\s*\(/,
    /\bdownload\s*=/i,
    /URL\.createObjectURL/,
    /document\.createElement\s*\(/,
    /window\.open\s*\(/,
    /\.click\s*\(\)/,
    /\bpayment\s*\(/i,
    /paymentIntent/i,
  ]) {
    assert.doesNotMatch(content, pattern, `Unexpected external side effect in ${path}`)
  }
}

test('keeps ticket sale policy deterministic and caller-clock driven', () => {
  const transitions = source('helpers/organizer-inventory-transitions.ts')
  const reducer = source('helpers/organizer-workspace-reducer.ts')

  assert.match(transitions, /currentAt: string/)
  assert.doesNotMatch(transitions, /new Date\s*\(/)
  assert.match(reducer, /action\.currentAt/)
})

test('renders issued credentials from the canonical event and order join', () => {
  const drawer = source('components/OrganizerOrderDetailDrawer.tsx')
  const ordersPage = source('pages/OrganizerOrdersPage.tsx')

  assert.match(drawer, /attendee\.eventId === eventId && attendee\.orderId === order\.id/)
  assert.match(drawer, /ticketReference/)
  assert.match(drawer, /Vé đã phát hành/)
  assert.match(ordersPage, /attendees=\{workspace\.attendees\}/)
})

test('keeps order drawer keyboard focus containment and restoration', () => {
  const drawer = source('components/OrganizerOrderDetailDrawer.tsx')

  assert.match(drawer, /event\.key === 'Escape'/)
  assert.match(drawer, /querySelectorAll<HTMLElement>/)
  assert.match(drawer, /event\.key !== 'Tab'/)
  assert.match(drawer, /returnFocus\?\.focus\(\)/)
  assert.match(drawer, /closeRef\.current\?\.focus\(\)/)
})

test('keeps desktop tables, mobile records, and masked mobile email presentation', () => {
  for (const [path, emailExpression] of [
    ['components/OrganizerOrderTable.tsx', /maskOrganizerEmail\(order\.buyerEmail\)/],
    ['components/OrganizerAttendeeTable.tsx', /maskOrganizerEmail\(attendee\.email\)/],
  ] as const) {
    const table = source(path)

    assert.match(table, /<table/)
    assert.match(table, /hidden overflow-x-auto[^\n]*md:block/)
    assert.match(table, /<OrganizerResponsiveRecordList/)
    assert.match(table, emailExpression)
  }
})

test('keeps event-list paid revenue derived by a canonical reporting selector', () => {
  const metrics = source('helpers/select-organizer-metrics.ts')
  const eventList = source('hooks/use-organizer-event-list.ts')

  assert.match(metrics, /export function selectOrganizerEventRevenueById/)
  assert.match(eventList, /selectOrganizerEventRevenueById\(workspace\)/)
  assert.doesNotMatch(eventList, /workspace\.orders/)
  assert.doesNotMatch(eventList, /paymentStatus/)
  assert.doesNotMatch(eventList, /\.reduce/)
})

test('keeps reporting, settings, and chart text sourced from canonical session helpers', () => {
  const application = readFileSync(resolve(projectRoot, 'src/app/OrganizerApplication.tsx'), 'utf8')
  const settings = source('pages/OrganizerOrganizationSettingsPage.tsx')
  const analytics = source('pages/OrganizerAnalyticsPage.tsx')
  const finance = source('pages/OrganizerFinancePage.tsx')
  const form = source('components/OrganizerOrganizationForm.tsx')
  const organizationValidation = source('helpers/validate-organizer-organization.ts')
  const chart = source('components/OrganizerAccessibleBarChart.tsx')
  const organizationFixture = source('mock/organizer-organization-data.ts')

  assert.match(application, /organizationName=\{workspace\.workspace\.organization\.name\}/)
  assert.match(settings, /selectOrganizerFinanceSummary\(workspace\)/)
  assert.match(settings, /finance\.payoutsByStatus\.pending/)
  assert.match(settings, /organization\.businessIdentifier/)
  assert.doesNotMatch(settings, /<dd>••••••••••<\/dd>/)
  assert.match(analytics, /selectOrganizerEventAnalytics\(workspace, eventId\)/)
  assert.match(finance, /selectOrganizerFinanceSummary\(workspace\)/)
  assert.match(organizationValidation, /valuesFromOrganizerOrganization/)
  assert.match(organizationValidation, /reconcileOrganizerOrganizationDraft/)
  assert.match(form, /prepareOrganizerOrganizationSave\(values\)/)
  assert.match(form, /reconcileOrganizerOrganizationDraft\(current, previousBaseline, nextBaseline\)/)
  assert.match(form, /export function OrganizerOrganizationForm/)
  assert.doesNotMatch(form, /export function (?!OrganizerOrganizationForm\b)/)
  assert.match(form, /baselineRef\.current = normalized/)
  assert.match(organizationFixture, /businessIdentifier: 'MST •••••• 4821'/)
  assert.match(chart, /Biểu đồ thanh kèm danh sách giá trị đầy đủ/)
  assert.match(chart, /aria-label=\{`\$\{title\}: danh sách giá trị`\}/)
  assert.match(chart, /<span>\{item\.detail\}<\/span>/)

  for (const path of [
    'pages/OrganizerOrganizationSettingsPage.tsx',
    'pages/OrganizerFinancePage.tsx',
    'pages/OrganizerAnalyticsPage.tsx',
  ]) {
    assertNoExternalSideEffects(path)
  }
})
test('keeps CSV actions as notices without export, network, or payment side effects', () => {
  const pages = [
    'pages/OrganizerOrdersPage.tsx',
    'pages/OrganizerAttendeesPage.tsx',
    'pages/OrganizerTicketInventoryPage.tsx',
  ]

  for (const page of pages) {
    const content = source(page)
    assert.match(content, /Xuất CSV sẽ được bổ sung sau; chưa có tệp nào được tạo\./)
    assertNoExternalSideEffects(page)
  }

  for (const path of [
    'components/OrganizerOrderDetailDrawer.tsx',
    'components/OrganizerOrderTable.tsx',
    'components/OrganizerAttendeeTable.tsx',
  ]) {
    assertNoExternalSideEffects(path)
  }
})
