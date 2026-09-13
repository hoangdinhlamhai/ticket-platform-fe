import { useRef, useState, type ReactNode } from 'react'
import type { AdminPath, AdminRoute } from '../routing/admin-route.ts'
import { AdminHeader } from './AdminHeader.tsx'
import { AdminMobileNavigation } from './AdminMobileNavigation.tsx'
import { AdminSidebar } from './AdminSidebar.tsx'

type AdminLayoutProps = {
  readonly activeRoute: AdminRoute
  readonly children: ReactNode
  readonly notice: string
  readonly onAcknowledgeNotice: () => void
  readonly onExitToAttendee: () => void
  readonly onNavigate: (path: AdminPath) => void
  readonly pendingCount: number
}

export function AdminLayout({ activeRoute, children, notice, onAcknowledgeNotice, onExitToAttendee, onNavigate, pendingCount }: AdminLayoutProps) {
  const [isNavigationOpen, setNavigationOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <div className="min-h-dvh overflow-x-hidden bg-paper-deep text-ink">
      <a className="fixed top-3 left-3 z-[70] -translate-y-[150%] bg-pine px-4 py-[.7rem] text-paper no-underline focus:translate-y-0" href="#main-content">Bỏ qua đến nội dung chính</a>
      <AdminHeader isNavigationOpen={isNavigationOpen} menuButtonRef={menuButtonRef} pendingCount={pendingCount} onMenuOpen={() => setNavigationOpen(true)} onExitToAttendee={onExitToAttendee} onNavigate={onNavigate} />
      <div className="lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] overflow-y-auto border-r border-line bg-surface lg:block">
          <AdminSidebar activeRoute={activeRoute} onNavigate={onNavigate} />
        </aside>
        <main id="main-content" className="min-w-0 px-5 py-7 sm:px-6 lg:px-8 lg:py-9" tabIndex={-1}>
          {notice && (
            <section className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-blue/35 bg-google-hover px-4 py-3 text-sm font-bold text-blue-deep" role="status" aria-live="polite" aria-atomic="true">
              <span>{notice}</span>
              <button className="min-h-10 rounded border border-blue px-3 text-sm font-extrabold" type="button" onClick={onAcknowledgeNotice}>Đã hiểu</button>
            </section>
          )}
          {children}
        </main>
      </div>
      <AdminMobileNavigation activeRoute={activeRoute} open={isNavigationOpen} onClose={() => setNavigationOpen(false)} onNavigate={onNavigate} returnFocus={menuButtonRef} />
    </div>
  )
}
