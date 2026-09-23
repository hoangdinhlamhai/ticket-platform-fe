import type { AttendeeUser } from '../features/auth'
import type { AuthStatus } from '../features/auth/api/session-controller.ts'
import type { ReactNode } from 'react'
import type { AttendeePath, AttendeeRoute } from '../routes/attendee-route'
import { AttendeeHeader } from './AttendeeHeader'

type AttendeeLayoutProps = {
  activeRoute: AttendeeRoute
  authError: string
  canRetryAuth: boolean
  authenticatedUser: AttendeeUser | null
  authStatus: AuthStatus
  children: ReactNode
  notice: string
  onLogout: () => Promise<void>
  onNavigate: (path: AttendeePath) => void
  onNavigateToOrganizer: () => void
  onRetryAuth: () => Promise<void>
  profileName: string
}

export function AttendeeLayout({
  activeRoute,
  authError,
  canRetryAuth,
  authenticatedUser,
  authStatus,
  children,
  notice,
  onLogout,
  onNavigate,
  onNavigateToOrganizer,
  onRetryAuth,
  profileName,
}: AttendeeLayoutProps) {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-paper text-ink">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-[150%] bg-pine px-4 py-[0.7rem] text-paper no-underline focus:translate-y-0"
        href="#main-content"
      >
        Bỏ qua đến nội dung chính
      </a>
      <AttendeeHeader
        activeRoute={activeRoute}
        authStatus={authStatus}
        authenticatedUser={authenticatedUser}
        onLogout={onLogout}
        onNavigate={onNavigate}
        onNavigateToOrganizer={onNavigateToOrganizer}
        profileName={profileName}
      />
      {authError ? (
        <div className="border-b border-error/30 bg-paper-deep py-3" role="alert">
          <div className="attendee-container flex flex-wrap items-center justify-between gap-3 text-sm text-error">
            <span>{authError}</span>
            {canRetryAuth ? <button className="border border-error/40 bg-paper px-3 py-1.5 font-bold" type="button" onClick={() => void onRetryAuth()}>Thử lại</button> : null}
          </div>
        </div>
      ) : null}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t border-line bg-paper py-7">
        <div className="attendee-container flex flex-wrap justify-between gap-3 text-[0.76rem] leading-[1.5] text-ink-soft">
          <span>Ticketly prototype · Tài khoản đăng nhập là phiên thật; sự kiện, vé, đơn hàng và resale vẫn là dữ liệu minh họa.</span>
          <span>Hồ sơ demo, QR, thanh toán và các thao tác giao dịch chưa được lưu hoặc xử lý như sản phẩm thật.</span>
        </div>
      </footer>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {notice}
      </div>
    </div>
  )
}
