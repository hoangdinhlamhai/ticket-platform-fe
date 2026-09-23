import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..')

function read(path: string) {
  return readFileSync(resolve(projectRoot, path), 'utf8')
}

test('renames the shared Organizer events nav item to "Sự kiện của tôi" (desktop + mobile share this source)', () => {
  const sidebar = read('src/layouts/OrganizerSidebar.tsx')

  // The mobile drawer renders the same OrganizerSidebar, so one rename covers both.
  assert.match(sidebar, /href: '\/organizer\/events', label: 'Sự kiện của tôi'/)
})

test('gives the My-events list its own heading and server load/error/retry states', () => {
  const list = read('src/features/organizer/pages/OrganizerEventListPage.tsx')

  assert.match(list, /title="Sự kiện của tôi"/)
  // Reuses the single /organizer/events route — no duplicate list page created.
  assert.match(list, /loading\?: boolean; loadError\?: string \| null; onRetry\?: \(\) => void/)
  // A failed or in-flight server load must not render the "no events" empty state.
  assert.match(list, /loadError\s*\n?\s*\?/)
  assert.match(list, /Đang tải sự kiện của bạn…/)
  assert.match(list, /onClick=\{onRetry\}/)
  assert.match(list, /Thử lại/)
})

test('forwards the controller load state from the app shell into the list page', () => {
  const organizerApp = read('src/pages/OrganizerApplication.tsx')

  assert.match(organizerApp, /loading=\{workspace\.loading\}/)
  assert.match(organizerApp, /loadError=\{workspace\.loadError\}/)
  assert.match(organizerApp, /onRetry=\{workspace\.retry\}/)
})

test('redirects to the My-events list only on a confirmed create, clearing dirty first and keeping the notice', () => {
  const organizerApp = read('src/pages/OrganizerApplication.tsx')

  // The success decision routes through the tested production helper, not an inline kind check.
  assert.match(organizerApp, /resolveOrganizerCreateRedirect\(result\)/)
  assert.match(organizerApp, /if \(!redirect\) return false/)
  // Dirty guard cleared before navigating so the redirect never trips the unsaved prompt.
  assert.match(organizerApp, /setDirty\(redirect\.clearDirtyFirst \? false : dirtyRef\.current\)/)
  // Notice-preserving navigate is used (the normal navigate clears lastOperation).
  assert.match(organizerApp, /onNavigatePreservingNotice\(redirect\.path\)/)
})

test('the app shell preserves the organizer success notice exactly once across the redirect', () => {
  const app = read('src/pages/App.tsx')

  assert.match(app, /preserveOrganizerNoticeRef/)
  // One-shot: consumed by acceptNavigation, otherwise the notice is cleared as usual.
  assert.match(app, /if \(preserveOrganizerNoticeRef\.current\) preserveOrganizerNoticeRef\.current = false\s*\n?\s*else clearOrganizerLastOperation\(\)/)
  assert.match(app, /onNavigatePreservingNotice=\{navigateOrganizerPreservingNotice\}/)
})
