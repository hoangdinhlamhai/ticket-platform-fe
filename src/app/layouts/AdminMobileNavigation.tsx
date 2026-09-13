import { useEffect, useRef, type RefObject } from 'react'
import type { AdminPath, AdminRoute } from '../routing/admin-route.ts'
import { ADMIN_NAVIGATION } from './admin-navigation.ts'

type AdminMobileNavigationProps = {
  readonly open: boolean
  readonly activeRoute: AdminRoute
  readonly onClose: () => void
  readonly onNavigate: (path: AdminPath) => void
  readonly returnFocus: RefObject<HTMLButtonElement | null>
}

export function AdminMobileNavigation({ open, activeRoute, onClose, onNavigate, returnFocus }: AdminMobileNavigationProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const navigatingRef = useRef(false)

  useEffect(() => {
    if (!open) return
    const desktopQuery = window.matchMedia('(min-width: 1024px)')
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) return
      navigatingRef.current = true
      onClose()
      window.requestAnimationFrame(() => document.getElementById('main-content')?.focus())
    }
    desktopQuery.addEventListener('change', closeAtDesktop)
    return () => desktopQuery.removeEventListener('change', closeAtDesktop)
  }, [onClose, open])

  useEffect(() => {
    if (!open) return
    const trigger = returnFocus.current
    closeRef.current?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      if (!navigatingRef.current) trigger?.focus()
      navigatingRef.current = false
    }
  }, [onClose, open, returnFocus])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
      <button className="absolute inset-0 h-full w-full bg-pine/60" type="button" aria-label="Đóng điều hướng Admin" onClick={onClose} />
      <section id="admin-mobile-navigation" ref={panelRef} className="absolute top-0 bottom-0 left-0 w-[min(20rem,calc(100vw-3rem))] overflow-y-auto overscroll-contain bg-paper p-5 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="admin-mobile-navigation-title">
        <header className="flex items-center justify-between gap-3 border-b border-line pb-4">
          <h2 id="admin-mobile-navigation-title" className="m-0 text-lg font-extrabold">Điều hướng Admin</h2>
          <button ref={closeRef} className="min-h-11 rounded border border-line px-4 text-sm font-extrabold" type="button" onClick={onClose}>Đóng</button>
        </header>
        {ADMIN_NAVIGATION.map((group) => (
          <section className="mt-5" key={group.group}>
            <h3 className="m-0 text-xs font-extrabold tracking-[.12em] text-ink-soft">{group.group}</h3>
            <ul className="m-0 mt-2 grid list-none gap-1 p-0">
              {group.items.map((item) => (
                <li key={item.path}>
                  <button aria-current={item.routes.includes(activeRoute) ? 'page' : undefined} className={`min-h-11 w-full rounded px-3 text-left font-bold ${item.routes.includes(activeRoute) ? 'bg-pine text-paper' : 'hover:bg-paper-deep'}`} type="button" onClick={() => { navigatingRef.current = true; onNavigate(item.path); onClose() }}>{item.label}</button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </div>
  )
}
