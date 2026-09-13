import { useState, type ReactNode } from 'react'
import { selectAdminDashboard } from '../helpers/select-admin-dashboard.ts'
import { AdminPageHeader, AdminStatusBadge } from './AdminCommon.tsx'

export function AdminWorkQueue({ items, onOpen }: { readonly items: readonly { id: string; label: string; detail: string; priority: 'critical' | 'high' | 'medium' | 'low'; path: string }[]; readonly onOpen: (path: string) => void }) {
  if (!items.length) return <p className="rounded-lg border border-dashed border-line p-5 text-ink-soft">Không có công việc cần xử lý ngay.</p>
  const labels = { critical: 'Khẩn cấp', high: 'Cao', medium: 'Trung bình', low: 'Thấp' } as const
  return <ol className="m-0 grid list-none gap-3 p-0">{items.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-surface p-4"><div><strong>{item.label}</strong><p className="m-0 mt-1 text-sm text-ink-soft">{item.detail}</p></div><div className="flex items-center gap-3"><AdminStatusBadge label={labels[item.priority]} tone={item.priority === 'critical' ? 'critical' : item.priority === 'high' ? 'coral' : item.priority === 'medium' ? 'blue' : 'neutral'} /><button type="button" className="min-h-11 rounded border border-blue px-3 text-sm font-bold text-blue-deep" onClick={() => onOpen(item.path)}>Mở</button></div></li>)}</ol>
}

function AccessibleChart({ title, legend, children, table }: { readonly title: string; readonly legend: string; readonly children: ReactNode; readonly table: ReactNode }) {
  return <section className="rounded-lg border border-line bg-surface p-5"><h2 className="mt-0 text-xl font-extrabold">{title}</h2><p className="text-sm font-bold text-ink-soft">{legend}</p>{children}<details className="mt-4"><summary className="cursor-pointer font-bold text-blue-deep">Xem dữ liệu dạng bảng</summary>{table}</details></section>
}

function lineCoordinates(values: readonly number[], max: number) {
  const width = 640
  const height = 180
  return values.map((value, index) => ({
    x: values.length === 1 ? width / 2 : (index / (values.length - 1)) * width,
    y: height - (value / max) * (height - 16) - 8,
  }))
}

function linePoints(values: readonly number[], max: number) {
  return lineCoordinates(values, max).map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
}

export function AdminAccessibleLineChart({ series }: { readonly series: readonly { date: string; primary: number; resale: number }[] }) {
  const points = series
  const max = Math.max(...points.flatMap((item) => [item.primary, item.resale]), 1)
  const [focusedPoint, setFocusedPoint] = useState<string | null>(null)
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null)
  const primaryCoordinates = lineCoordinates(points.map((item) => item.primary), max)
  const resaleCoordinates = lineCoordinates(points.map((item) => item.resale), max)
  const marks = points.flatMap((item, index) => [
    { key: `primary-${item.date}`, label: `Primary ngày ${item.date}: ${item.primary.toLocaleString('vi-VN')} đồng`, x: primaryCoordinates[index]?.x ?? 0, y: primaryCoordinates[index]?.y ?? 0, color: 'var(--color-blue)' },
    { key: `resale-${item.date}`, label: `Resale ngày ${item.date}: ${item.resale.toLocaleString('vi-VN')} đồng`, x: resaleCoordinates[index]?.x ?? 0, y: resaleCoordinates[index]?.y ?? 0, color: 'var(--color-coral)' },
  ])
  const activePoint = focusedPoint ?? hoveredPoint

  return <AccessibleChart title="Giá trị giao dịch 30 ngày" legend="Đường xanh: primary. Đường cam: resale." table={<div className="overflow-x-auto"><table className="mt-3 w-full min-w-96 text-left text-sm"><thead><tr><th>Ngày</th><th>Primary</th><th>Resale</th></tr></thead><tbody>{points.map((item) => <tr key={item.date}><td>{item.date}</td><td>{item.primary.toLocaleString('vi-VN')}đ</td><td>{item.resale.toLocaleString('vi-VN')}đ</td></tr>)}</tbody></table></div>}><svg className="mt-5 h-48 w-full" viewBox="0 0 640 180" role="group" aria-label="Biểu đồ đường giá trị giao dịch primary và resale theo ngày" preserveAspectRatio="none"><line x1="0" y1="172" x2="640" y2="172" stroke="currentColor" opacity="0.2" /><polyline points={linePoints(points.map((item) => item.primary), max)} fill="none" stroke="var(--color-blue)" strokeWidth="4" vectorEffect="non-scaling-stroke" /><polyline points={linePoints(points.map((item) => item.resale), max)} fill="none" stroke="var(--color-coral)" strokeWidth="4" vectorEffect="non-scaling-stroke" />{marks.map((mark) => <circle key={mark.key} cx={mark.x} cy={mark.y} r="6" fill={mark.color} stroke="var(--color-paper)" strokeWidth="2" vectorEffect="non-scaling-stroke" role="img" tabIndex={0} aria-label={mark.label} onFocus={() => setFocusedPoint(mark.label)} onBlur={() => setFocusedPoint(null)} onMouseEnter={() => setHoveredPoint(mark.label)} onMouseLeave={() => setHoveredPoint(null)} />)}</svg><p className="mt-3 min-h-6 text-sm font-bold text-ink-soft" role="status" aria-live="polite">{activePoint ?? 'Dùng Tab hoặc di chuột qua từng điểm để xem chi tiết.'}</p></AccessibleChart>
}

export function AdminAccessibleBarChart({ rows }: { readonly rows: readonly { label: string; value: number; detail: string }[] }) {
  const max = Math.max(...rows.map((item) => item.value), 1)
  const [focusedBar, setFocusedBar] = useState<string | null>(null)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)
  const activeBar = focusedBar ?? hoveredBar

  return <AccessibleChart title="Khối lượng vận hành" legend="Cột thể hiện số lượng bản ghi cần theo dõi." table={<table className="mt-3 w-full text-left text-sm"><thead><tr><th>Loại</th><th>Số lượng</th><th>Chi tiết</th></tr></thead><tbody>{rows.map((item) => <tr key={item.label}><td>{item.label}</td><td>{item.value}</td><td>{item.detail}</td></tr>)}</tbody></table>}><div className="mt-5 grid gap-3">{rows.map((item) => { const label = `${item.label}: ${item.value}. ${item.detail}`; return <div key={item.label}><div className="flex justify-between gap-3 text-sm font-bold"><span>{item.label}</span><span>{item.value}</span></div><div className="mt-1 h-4 rounded bg-paper-deep outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue" role="img" tabIndex={0} aria-label={label} onFocus={() => setFocusedBar(label)} onBlur={() => setFocusedBar(null)} onMouseEnter={() => setHoveredBar(label)} onMouseLeave={() => setHoveredBar(null)}><div className="h-full rounded bg-coral" style={{ width: `${(item.value / max) * 100}%` }} /></div></div>})}</div><p className="mt-3 min-h-6 text-sm font-bold text-ink-soft" role="status" aria-live="polite">{activeBar ?? 'Dùng Tab hoặc di chuột qua từng cột để xem chi tiết.'}</p></AccessibleChart>
}

export function AdminDashboardPage({ workspace, navigate }: { readonly workspace: Parameters<typeof selectAdminDashboard>[0]; readonly navigate: (path: string) => void }) {
  const dashboard = selectAdminDashboard(workspace)
  return <div className="grid gap-7"><AdminPageHeader eyebrow="TỔNG QUAN" title="Bàn điều phối Admin">Theo dõi công việc ưu tiên và thao tác trên dữ liệu mô phỏng trong phiên.</AdminPageHeader><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{dashboard.metrics.map((metric) => <button key={metric.id} type="button" className="min-h-36 rounded-lg border border-line bg-surface p-5 text-left hover:border-blue" onClick={() => navigate(metric.path)}><span className="block text-sm font-bold text-ink-soft">{metric.label}</span><strong className="mt-2 block text-3xl font-extrabold">{metric.id === 'monthly-gmv' ? metric.detail : metric.value}</strong><span className="mt-2 block text-xs font-bold text-blue-deep">{metric.detail}</span></button>)}</div><div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]"><section><h2 className="mt-0 text-2xl font-extrabold">Hàng đợi cần xử lý</h2><AdminWorkQueue items={dashboard.workItems} onOpen={navigate} /></section><section><h2 className="mt-0 text-2xl font-extrabold">Cảnh báo vận hành</h2>{dashboard.alerts.length ? <ul className="m-0 grid list-none gap-3 p-0">{dashboard.alerts.map((alert) => <li key={alert.id}><button className="w-full rounded-lg border border-line bg-surface p-4 text-left hover:border-coral" type="button" onClick={() => navigate(alert.path)}><strong>{alert.title}</strong><span className="mt-1 block text-sm text-ink-soft">{alert.description}</span></button></li>)}</ul> : <p className="rounded-lg border border-dashed border-line p-5 text-ink-soft">Không có cảnh báo vận hành mới.</p>}</section></div><div className="grid gap-6 xl:grid-cols-2"><AdminAccessibleLineChart series={dashboard.transactionSeries} /><AdminAccessibleBarChart rows={dashboard.volumeRows} /></div><section><h2 className="mt-0 text-2xl font-extrabold">Hoạt động gần đây</h2><ol className="m-0 grid list-none gap-2 p-0">{workspace.auditEntries.slice(0, 5).map((item) => <li className="rounded border border-line bg-surface p-3 text-sm" key={item.id}><strong>{item.action}</strong> · {item.actorLabel} · {new Date(item.occurredAt).toLocaleString('vi-VN')}</li>)}</ol></section></div>
}
