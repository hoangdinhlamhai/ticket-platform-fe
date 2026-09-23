import type { AdminPath, AdminRoute } from '../routes/admin-route.ts'
import { ADMIN_NAVIGATION } from './admin-navigation.ts'

export function AdminSidebar({ activeRoute, onNavigate }: { readonly activeRoute: AdminRoute; readonly onNavigate: (path: AdminPath) => void }) {
  return <nav aria-label="Điều hướng Admin" className="sticky top-20 grid gap-6 p-5">{ADMIN_NAVIGATION.map((group) => <section key={group.group}><h2 className="m-0 text-xs font-extrabold tracking-[.12em] text-ink-soft">{group.group}</h2><ul className="m-0 mt-2 grid list-none gap-1 p-0">{group.items.map((item) => <li key={item.path}><button aria-current={item.routes.includes(activeRoute) ? 'page' : undefined} className={`min-h-11 w-full rounded px-3 text-left text-sm font-bold ${item.routes.includes(activeRoute) ? 'bg-pine text-paper' : 'hover:bg-paper-deep'}`} type="button" onClick={() => onNavigate(item.path)}>{item.label}</button></li>)}</ul></section>)}</nav>
}
