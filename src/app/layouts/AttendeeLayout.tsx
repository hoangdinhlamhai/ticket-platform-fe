import type { ReactNode } from 'react'
import type { AttendeePath, AttendeeRoute } from '../routing/attendee-route'
import { AttendeeHeader } from './AttendeeHeader'

type AttendeeLayoutProps = {
  activeRoute: AttendeeRoute
  children: ReactNode
  notice: string
  onNavigate: (path: AttendeePath) => void
  profileName: string
}

export function AttendeeLayout({
  activeRoute,
  children,
  notice,
  onNavigate,
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
        onNavigate={onNavigate}
        profileName={profileName}
      />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="border-t border-line bg-paper py-7">
        <div className="attendee-container flex flex-wrap justify-between gap-3 text-[0.76rem] leading-[1.5] text-ink-soft">
          <span>Ticketly prototype · Dữ liệu hiển thị chỉ để minh họa giao diện.</span>
          <span>Không có giao dịch, QR, thanh toán hoặc lưu trữ dữ liệu.</span>
        </div>
      </footer>
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {notice}
      </div>
    </div>
  )
}
