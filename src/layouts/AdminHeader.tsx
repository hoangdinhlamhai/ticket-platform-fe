import { useState, type RefObject } from 'react'
import { TicketlyMark } from '../components/icons/TicketlyIcons.tsx'
import { shouldUseClientNavigation } from '../routes/client-navigation.ts'
import type { AdminPath } from '../routes/admin-route.ts'

type AdminHeaderProps = {
  readonly isNavigationOpen: boolean
  readonly menuButtonRef: RefObject<HTMLButtonElement | null>
  readonly pendingCount: number
  readonly onMenuOpen: () => void
  readonly onExitToAttendee: () => void
  readonly onNavigate: (path: AdminPath) => void
}

export function AdminHeader({ isNavigationOpen, menuButtonRef, pendingCount, onMenuOpen, onExitToAttendee, onNavigate }: AdminHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 lg:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <button ref={menuButtonRef} className="grid min-h-11 min-w-11 place-items-center rounded border border-line font-bold lg:hidden" type="button" aria-controls="admin-mobile-navigation" aria-expanded={isNavigationOpen} aria-label="Mở điều hướng Admin" onClick={onMenuOpen}>☰</button>
          <a className="flex min-h-11 items-center gap-2 text-pine no-underline" href="/admin" onClick={(event) => { if (!shouldUseClientNavigation(event)) return; event.preventDefault(); onNavigate('/admin') }}>
            <TicketlyMark className="h-8 w-8" />
            <span className="font-body text-xl font-extrabold tracking-[-.06em]">Ticketly</span>
            <span className="rounded bg-coral px-2 py-1 text-[.65rem] font-extrabold tracking-[.08em] text-paper">ADMIN</span>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button className="min-h-11 rounded border border-line px-3 text-sm font-bold" type="button" aria-expanded={searchOpen} aria-controls="admin-global-search" onClick={() => setSearchOpen((open) => !open)}>Tìm kiếm toàn cục</button>
          <span className="hidden rounded-full bg-google-hover px-3 py-1 text-sm font-bold text-blue-deep sm:block">{pendingCount} cần xử lý</span>
          <button className="min-h-11 rounded border border-line px-3 text-sm font-bold" type="button" onClick={onExitToAttendee}>Thoát về Ticketly</button>
        </div>
      </div>
      {searchOpen && <div id="admin-global-search" className="border-t border-line px-4 py-3 lg:px-7"><label className="block max-w-xl text-sm font-bold">Tìm kiếm toàn cục<input className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3" type="search" placeholder="Tìm sự kiện, người dùng, đơn hàng hoặc vụ việc" autoFocus /></label><p className="mb-0 mt-1 text-xs text-ink-soft">Bản mẫu chỉ hiển thị ô tìm kiếm trong phiên; chưa kết nối backend.</p></div>}
    </header>
  )
}
