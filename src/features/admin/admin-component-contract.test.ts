import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createAdminDialogStack } from './components/admin-dialog-stack.ts'

const read = (path: string) => readFileSync(path, 'utf8')

test('keeps only the topmost nested Admin dialog active and restores focus in order', () => {
  const stack = createAdminDialogStack()
  const closed: string[] = []
  const focused: string[] = []
  const drawer = stack.open(
    () => closed.push('drawer'),
    () => focused.push('list trigger'),
  )
  const decision = stack.open(
    () => closed.push('decision'),
    () => focused.push('drawer action trigger'),
  )

  assert.equal(drawer.isTopmost(), false)
  assert.equal(decision.isTopmost(), true)
  assert.equal(drawer.handleEscape(), false)
  assert.equal(decision.handleEscape(), true)
  assert.deepEqual(closed, ['decision'])

  decision.close()
  assert.equal(drawer.isTopmost(), true)
  assert.deepEqual(focused, ['drawer action trigger'])
  assert.equal(drawer.handleEscape(), true)
  assert.deepEqual(closed, ['decision', 'drawer'])
  drawer.close()
  assert.deepEqual(focused, [
    'drawer action trigger',
    'list trigger',
  ])
})

test('keeps Admin dialogs keyboard accessible and prototype-only', () => {
  const common = read('src/features/admin/components/AdminCommon.tsx')
  const mobileNavigation = read('src/layouts/AdminMobileNavigation.tsx')
  const sources = [
    common,
    mobileNavigation,
    read('src/features/admin/components/AdminOperationsPages.tsx'),
    read('src/features/admin/components/AdminFinancePages.tsx'),
  ].join('\n')

  assert.match(common, /role="dialog"/)
  assert.match(common, /aria-modal="true"/)
  assert.match(common, /event\.key === 'Escape'/)
  assert.match(common, /activeRef\.current\?\.focus\(\)/)
  assert.match(common, /validateAdminReason\(operation, reason\)/)
  assert.match(mobileNavigation, /event\.key !== 'Tab'/)
  assert.doesNotMatch(
    sources,
    /fetch\s*\(|WebSocket|localStorage|sessionStorage|indexedDB|document\.cookie|Authorization|apiKey|secret/,
  )
})

test('keeps settings values in the session workspace instead of route-local state', () => {
  const settings = read('src/features/admin/components/AdminFinancePages.tsx')
  const workspace = read('src/features/admin/types/admin-workspace.ts')

  assert.match(workspace, /moderationChecklist/)
  assert.match(workspace, /moderationReasons/)
  assert.match(settings, /controller\.workspace\.moderationChecklist/)
  assert.match(settings, /controller\.workspace\.moderationReasons/)
  assert.doesNotMatch(settings, /useState\(\['Kiểm tra chính sách hoàn vé'/)
  assert.doesNotMatch(settings, /useState\(\['Thiếu bằng chứng hoặc giấy tờ'/)
})

test('renders contained desktop tables, mobile record cards, and explicit empty states', () => {
  const table = read('src/features/admin/components/AdminDataTable.tsx')

  assert.match(table, /hidden[^"\n]*md:block/)
  assert.match(table, /md:hidden/)
  assert.match(table, /headers\[index\]/)
  assert.match(table, /Không có bản ghi phù hợp/)
  assert.match(table, /overflow-x-auto/)
})

test('provides domain status filters and the approved moderation and finance fields', () => {
  const common = read('src/features/admin/components/AdminCommon.tsx')
  const moderation = read('src/features/admin/components/AdminModerationPages.tsx')
  const operations = read('src/features/admin/components/AdminOperationsPages.tsx')
  const finance = read('src/features/admin/components/AdminFinancePages.tsx')

  assert.match(common, /statusOptions/)
  assert.match(moderation, /type="date"/)
  assert.match(moderation, /Khoảng giá vé/)
  assert.match(operations, /Ngày tạo/)
  assert.match(operations, /statusOptions=\{accountStatusOptions\}/)
  assert.match(operations, /statusOptions=\{orderStatusOptions\}/)
  assert.match(finance, /statusOptions=\{refundStatusOptions\}/)
  assert.match(finance, /statusOptions=\{payoutStatusOptions\}/)
  assert.match(finance, /Ngày yêu cầu/)
})

test('keeps dashboard charts and audit records accessible and actionable', () => {
  const dashboard = read('src/features/admin/components/AdminDashboardPage.tsx')
  const moderation = read('src/features/admin/components/AdminModerationPages.tsx')
  const finance = read('src/features/admin/components/AdminFinancePages.tsx')
  const header = read('src/layouts/AdminHeader.tsx')

  assert.match(dashboard, /<svg/)
  assert.match(dashboard, /<polyline/)
  assert.match(dashboard, /tabIndex=\{0\}/)
  assert.match(dashboard, /aria-label=/)
  assert.match(dashboard, /onFocus=/)
  assert.match(dashboard, /onMouseEnter=/)
  assert.match(dashboard, /role="status"/)
  assert.match(moderation, /adminCaseSubjectPath/)
  assert.match(moderation, /shouldUseClientNavigation/)
  assert.match(moderation, /Đối tượng không còn khả dụng/)
  assert.doesNotMatch(dashboard, /slice\(-10\)/)
  assert.match(dashboard, /Xem dữ liệu dạng bảng/)
  assert.match(finance, /adminAuditTargetPath/)
  assert.match(header, /Tìm kiếm toàn cục/)
})
