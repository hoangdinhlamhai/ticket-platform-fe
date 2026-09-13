import type { AttendeeOrderStatus } from '../types/order'
const labels = { completed: 'Đã thanh toán', failed: 'Thất bại', expired: 'Hết hạn' }
const styles = { completed: 'border-success/40 bg-mint text-success', failed: 'border-error/35 bg-error-ring text-error', expired: 'border-coral-dark/35 bg-paper-deep text-coral-dark' }
export function OrderStatusBadge({ status }: { status: AttendeeOrderStatus }) { return <span className={`inline-flex rounded-sm border px-2 py-1 text-[0.68rem] font-extrabold tracking-[0.05em] ${styles[status]}`}>{labels[status]}</span> }
