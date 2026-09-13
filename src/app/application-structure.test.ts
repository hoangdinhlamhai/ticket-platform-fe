import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import test from 'node:test'

const expectedFiles = [
  'src/app/App.tsx',
  'src/app/routing/attendee-route.ts',
  'src/app/routing/attendee-route.test.ts',
  'src/app/layouts/AttendeeHeader.tsx',
  'src/app/layouts/AttendeeLayout.tsx',
  'src/features/events/pages/EventDiscoveryPage.tsx',
  'src/features/events/pages/EventDetailPage.tsx',
  'src/features/events/pages/SavedEventsPage.tsx',
  'src/features/events/components/SavedEventsHero.tsx',
  'src/features/events/components/SavedEventsGrid.tsx',
  'src/features/tickets/pages/OwnedTicketsPage.tsx',
  'src/features/tickets/pages/TicketStatusPage.tsx',
  'src/features/resale/pages/ResaleMarketplacePage.tsx',
  'src/features/resale/pages/ResaleListingPage.tsx',
  'src/features/resale/pages/ResaleCheckoutPage.tsx',
  'src/features/resale/pages/ResaleResultPage.tsx',
  'src/features/resale/hooks/use-resale-marketplace.ts',
  'src/features/resale/hooks/use-resale-checkout.ts',
  'src/features/resale/components/ResaleMarketplaceHero.tsx',
  'src/features/resale/components/ResaleMarketplaceToolbar.tsx',
  'src/features/resale/components/ResaleFilterPanel.tsx',
  'src/features/resale/components/ResaleListingCard.tsx',
  'src/features/resale/components/ResaleListingGrid.tsx',
  'src/features/resale/components/ResaleListingHero.tsx',
  'src/features/resale/components/ResaleTicketDetails.tsx',
  'src/features/resale/components/ResaleSellerCard.tsx',
  'src/features/resale/components/ResalePurchaseSummary.tsx',
  'src/features/resale/components/ResaleCheckoutSteps.tsx',
  'src/features/resale/components/ResaleBuyerForm.tsx',
  'src/features/resale/components/ResaleVietQrPanel.tsx',
  'src/features/checkout/pages/PrimaryCheckoutPage.tsx',
  'src/features/checkout/pages/PrimaryOrderResultPage.tsx',
  'src/features/orders/pages/OrderHistoryPage.tsx',
  'src/features/orders/pages/OrderDetailPage.tsx',
  'src/features/tickets/components/TicketCredentialCard.tsx',
  'src/features/tickets/components/TicketQrDialog.tsx',
  'src/features/resale/pages/CreateResaleListingPage.tsx',
  'src/features/resale/pages/MyResaleListingsPage.tsx',
  'src/features/profile/pages/CustomerProfilePage.tsx',
  'src/features/profile/hooks/use-customer-profile.ts',
  'src/features/profile/helpers/validate-customer-profile.ts',
  'src/app/OrganizerApplication.tsx',
  'src/app/AdminApplication.tsx',
  'src/app/routing/admin-route.ts',
  'src/app/layouts/AdminLayout.tsx',
  'src/app/layouts/AdminHeader.tsx',
  'src/app/layouts/AdminSidebar.tsx',
  'src/features/admin/components/AdminDashboardPage.tsx',
  'src/features/admin/components/AdminModerationPages.tsx',
  'src/features/admin/components/AdminOperationsPages.tsx',
  'src/features/admin/components/AdminFinancePages.tsx',
  'src/features/admin/components/AdminCommon.tsx',
  'src/features/admin/components/AdminDataTable.tsx',
  'src/features/admin/mock/admin-record-data.ts',
  'src/app/routing/organizer-route.ts',
  'src/app/layouts/OrganizerLayout.tsx',
  'src/app/layouts/OrganizerSidebar.tsx',
  'src/features/organizer/pages/OrganizerDashboardPage.tsx',
  'src/features/organizer/pages/OrganizerEventListPage.tsx',
  'src/features/organizer/pages/OrganizerEventCreatePage.tsx',
  'src/features/organizer/pages/OrganizerEventOverviewPage.tsx',
  'src/features/organizer/pages/OrganizerEventEditPage.tsx',
  'src/features/organizer/pages/OrganizerTicketInventoryPage.tsx',
  'src/features/organizer/pages/OrganizerOrdersPage.tsx',
  'src/features/organizer/pages/OrganizerAttendeesPage.tsx',
  'src/features/organizer/pages/OrganizerCheckInPage.tsx',
  'src/features/organizer/pages/OrganizerAnalyticsPage.tsx',
  'src/features/organizer/pages/OrganizerFinancePage.tsx',
  'src/features/organizer/pages/OrganizerOrganizationSettingsPage.tsx',
  'src/features/organizer/pages/OrganizerNotFoundPage.tsx',
]

const retiredFiles = [
  'src/App.tsx',
  'src/pages/attendee/AttendeeHomePage.tsx',
  'src/pages/attendee/EventDetailPage.tsx',
  'src/pages/attendee/OwnedTicketsPage.tsx',
  'src/pages/attendee/ResaleMarketplacePage.tsx',
  'src/pages/attendee/TicketStatusPage.tsx',
  'src/features/resale/components/ResaleSpotlight.tsx',
]

test('keeps application shell and business pages in their owning modules', () => {
  for (const filePath of expectedFiles) {
    assert.equal(existsSync(filePath), true, `Expected ${filePath} to exist`)
  }

  for (const filePath of retiredFiles) {
    assert.equal(existsSync(filePath), false, `Expected ${filePath} to be removed`)
  }
})

test('keeps attendee and Organizer React module filenames in PascalCase', () => {
  const resaleReactDirectories = [
    'src/features/events/pages',
    'src/features/events/components',
    'src/features/resale/pages',
    'src/features/resale/components',
    'src/features/checkout/pages',
    'src/features/checkout/components',
    'src/features/orders/pages',
    'src/features/orders/components',
    'src/features/tickets/pages',
    'src/features/tickets/components',
    'src/features/organizer/pages',
    'src/features/organizer/components',
  ]

  for (const directory of resaleReactDirectories) {
    const reactFiles = readdirSync(directory).filter((fileName) => fileName.endsWith('.tsx'))

    for (const fileName of reactFiles) {
      assert.match(fileName, /^[A-Z][A-Za-z0-9]*\.tsx$/, `Expected ${directory}/${fileName} to use PascalCase`)
    }
  }
})

test('keeps mobile event filters modal for keyboard users', () => {
  const drawer = readFileSync('src/features/events/components/EventFilterDrawer.tsx', 'utf8')

  assert.match(drawer, /querySelectorAll<HTMLElement>/)
  assert.match(drawer, /event\.key !== 'Tab'/)
  assert.match(drawer, /trigger\?\.focus\(\)/)
})

test('wires the saved events route through the header and app shell', () => {
  const header = readFileSync('src/app/layouts/AttendeeHeader.tsx', 'utf8')
  const app = readFileSync('src/app/App.tsx', 'utf8')

  assert.match(header, /href="\/saved-events"/)
  assert.match(header, /activeRoute === 'saved-events'/)
  assert.match(app, /route === 'saved-events'/)
  assert.match(app, /<SavedEventsPage/)
})

test('uses informational semantics for non-mutating saved-event heart controls', () => {
  const eventCard = readFileSync('src/features/events/components/EventDiscoveryCard.tsx', 'utf8')
  const savedGrid = readFileSync('src/features/events/components/SavedEventsGrid.tsx', 'utf8')

  assert.match(eventCard, /favoriteControlMode\?: 'toggle' \| 'informational'/)
  assert.match(eventCard, /favoriteControlMode === 'toggle' \? isFavorite : undefined/)
  assert.match(eventCard, /Thông tin sự kiện đã lưu/)
  assert.match(savedGrid, /favoriteControlMode="informational"/)
})

test('wires Organizer routes, shell accessibility, and prototype boundaries', () => {
  const app = readFileSync('src/app/App.tsx', 'utf8')
  const organizerApp = readFileSync('src/app/OrganizerApplication.tsx', 'utf8')
  const layout = readFileSync('src/app/layouts/OrganizerLayout.tsx', 'utf8')
  const route = readFileSync('src/app/routing/organizer-route.ts', 'utf8')

  assert.match(app, /const organizerWorkspace = useOrganizerWorkspace\(\)/)
  assert.match(app, /if \(isOrganizerPath\(pathname\)\)/)
  assert.match(app, /<OrganizerApplication/)
  assert.match(organizerApp, /getOrganizerRoute\(pathname\)/)
  assert.match(layout, /href="#main-content"/)
  assert.match(layout, /id="main-content"/)
  assert.match(layout, /tabIndex=\{-1\}/)
  assert.match(layout, /aria-live="polite"/)
  assert.match(route, /'event-analytics'/)
})

test('keeps Organizer prototype free of production-only browser and network APIs', () => {
  const directories = ['src/features/organizer', 'src/app/OrganizerApplication.tsx', 'src/app/layouts/OrganizerLayout.tsx']
  const forbidden = /localStorage|sessionStorage|indexedDB|fetch\(|supabase|WebSocket|mediaDevices|BarcodeDetector|QRCode|qrcode/

  function readSources(path: string): string[] {
    if (!existsSync(path)) return []
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return [readFileSync(path, 'utf8')]
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => readSources(`${path}/${entry.name}`))
  }

  for (const source of directories.flatMap(readSources)) assert.doesNotMatch(source, forbidden)
})

test('wires all Admin surfaces before Organizer and attendee fallback', () => {
  const app = readFileSync('src/app/App.tsx', 'utf8')
  const adminApp = readFileSync('src/app/AdminApplication.tsx', 'utf8')
  const route = readFileSync('src/app/routing/admin-route.ts', 'utf8')
  const adminDispatch = app.indexOf('if (isAdminPath(pathname))')
  const organizerDispatch = app.indexOf('if (isOrganizerPath(pathname))')

  assert.match(app, /const adminWorkspace = useAdminWorkspace\(\)/)
  assert.match(app, /<AdminApplication/)
  assert.ok(adminDispatch >= 0 && organizerDispatch > adminDispatch)
  assert.match(adminApp, /getAdminRoute\(pathname\)/)

  const staticSurfaces = [
    '/admin',
    '/admin/events/review',
    '/admin/cases',
    '/admin/organizers',
    '/admin/users',
    '/admin/orders',
    '/admin/tickets',
    '/admin/resale',
    '/admin/refunds',
    '/admin/payouts',
    '/admin/settings',
    '/admin/audit-logs',
  ]

  for (const surface of staticSurfaces) assert.match(route, new RegExp(`'${surface}'`))
  assert.match(route, /`\/admin\/events\/\$\{string\}\/review`/)
  assert.match(route, /`\/admin\/cases\/\$\{string\}`/)
  for (const page of ['AdminDashboardPage', 'AdminEventReviewListPage', 'AdminEventReviewDetailPage', 'AdminCaseListPage', 'AdminCaseDetailPage', 'AdminOrganizerPage', 'AdminUserPage', 'AdminOrderPage', 'AdminTicketPage', 'AdminResalePage', 'AdminRefundPage', 'AdminPayoutPage', 'AdminSettingsPage', 'AdminAuditLogPage']) assert.match(adminApp, new RegExp(`<${page}`))
})

test('keeps Admin shell accessible and source-only prototype boundaries intact', () => {
  const layout = readFileSync('src/app/layouts/AdminLayout.tsx', 'utf8')
  const sidebar = readFileSync('src/app/layouts/AdminSidebar.tsx', 'utf8')
  const directories = ['src/features/admin', 'src/app/AdminApplication.tsx', 'src/app/layouts/AdminLayout.tsx', 'src/app/layouts/AdminHeader.tsx', 'src/app/layouts/AdminMobileNavigation.tsx', 'src/app/layouts/AdminSidebar.tsx']
  const forbidden = /fetch\s*\(|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|Authorization|apiKey|secret/

  function readSources(path: string): string[] {
    if (!existsSync(path) || path.endsWith('.test.ts') || path.endsWith('.test.tsx')) return []
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return [readFileSync(path, 'utf8')]
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
      const childPath = `${path}/${entry.name}`
      if (entry.isDirectory()) return readSources(childPath)
      return (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.test.tsx') ? [readFileSync(childPath, 'utf8')] : []
    })
  }

  assert.match(layout, /href="#main-content"/)
  assert.match(layout, /id="main-content"/)
  assert.match(layout, /tabIndex=\{-1\}/)
  assert.match(layout, /aria-live="polite"/)
  assert.match(sidebar, /aria-label="Điều hướng Admin"/)
  for (const source of directories.flatMap(readSources)) assert.doesNotMatch(source, forbidden)
})

test('keeps shared attendee gutters and desktop discovery columns stable', () => {
  const styles = readFileSync('src/index.css', 'utf8')
  const discoveryGrid = readFileSync('src/features/events/components/EventDiscoveryGrid.tsx', 'utf8')
  const savedEventsGrid = readFileSync('src/features/events/components/SavedEventsGrid.tsx', 'utf8')
  const filterSidebar = readFileSync('src/features/events/components/AdvancedEventFilterSidebar.tsx', 'utf8')
  const toolbar = readFileSync('src/features/events/components/EventDiscoveryToolbar.tsx', 'utf8')
  const filterDrawer = readFileSync('src/features/events/components/EventFilterDrawer.tsx', 'utf8')
  const wideAttendeeSources = [
    'src/app/layouts/AttendeeHeader.tsx',
    'src/app/layouts/AttendeeLayout.tsx',
    'src/features/events',
    'src/features/profile',
    'src/features/checkout',
    'src/features/orders',
    'src/features/resale',
    'src/features/tickets',
  ]

  function readSources(path: string): string[] {
    if (path.endsWith('.tsx') || path.endsWith('.ts')) return [readFileSync(path, 'utf8')]
    return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
      const childPath = `${path}/${entry.name}`
      if (entry.isDirectory()) return readSources(childPath)
      return entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') ? [readFileSync(childPath, 'utf8')] : []
    })
  }

  assert.match(styles, /\.attendee-container\s*\{[^}]*width:\s*calc\(100%\s*-\s*clamp\(2\.5rem,\s*8vw,\s*10rem\)\);[^}]*margin-inline:\s*auto;/s)
  assert.doesNotMatch(styles, /\.attendee-container\s*\{[^}]*padding-inline:/s)
  assert.match(discoveryGrid, /attendee-container/)
  assert.match(discoveryGrid, /grid-cols-1[^"\n]*min-\[769px\]:grid-cols-2[^"\n]*min-\[1101px\]:grid-cols-3/)
  assert.match(discoveryGrid, /min-\[1101px\]:grid/)
  assert.match(savedEventsGrid, /grid-cols-1[^"\n]*min-\[769px\]:grid-cols-2[^"\n]*min-\[1101px\]:grid-cols-3/)
  assert.match(filterSidebar, /hidden[^"\n]*min-\[1101px\]:block/)
  assert.match(toolbar, /block[^"\n]*min-\[1101px\]:hidden/)
  assert.match(filterDrawer, /block[^"\n]*min-\[1101px\]:hidden/)

  for (const source of wideAttendeeSources.flatMap(readSources)) {
    assert.doesNotMatch(source, /max-w-\[92rem\]/)
  }
})

test('reserves scrollbar space so the centered header does not shift between pages', () => {
  const styles = readFileSync('src/index.css', 'utf8')

  assert.match(styles, /html\s*\{[^}]*scrollbar-gutter:\s*stable;/s)
})
