import { formatTicketPrice } from '../helpers/formatTicketPrice'
import { getTicketAvailability, getTicketQuantityBounds, type TicketAvailabilityStatus } from '../helpers/ticket-selection'
import type { EventTicketTier } from '../types/event'

type EventTicketSelectorProps = {
  onDecrease: () => void
  onIncrease: () => void
  onMockSubmit: () => void
  onSelectTier: (tierId: string) => void
  quantity: number
  selectedTier?: EventTicketTier
  selectedTierId: string
  subtotal: number
  ticketTiers: readonly EventTicketTier[]
}

const statusLabel: Record<TicketAvailabilityStatus, string> = { available: '', future: 'Mở bán trong thời gian tới', expired: 'Đã kết thúc bán', 'sold-out': 'Hết suất phân bổ', 'invalid-price': 'Giá vé chưa hợp lệ', 'event-ended': 'Sự kiện đã kết thúc' }
function formatWindow(value?: string | null) { return value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(value)) : '' }

export function EventTicketSelector({ onDecrease, onIncrease, onMockSubmit, onSelectTier, quantity, selectedTier, selectedTierId, subtotal, ticketTiers }: EventTicketSelectorProps) {
  const selectedBounds = selectedTier ? getTicketQuantityBounds(selectedTier) : { min: 1, max: 1 }
  const selectedAvailable = selectedTier ? getTicketAvailability(selectedTier).available : false
  return (
    <aside className="rounded-lg border border-line/70 bg-surface p-5" aria-labelledby="ticket-selector-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">CHỌN HẠNG VÉ</p>
      <h2 id="ticket-selector-title" className="mt-2 mb-0 font-body text-[2.5rem] leading-[0.92] font-extrabold tracking-[-0.07em]">Bạn muốn đứng ở đâu?</h2>
      <fieldset className="mt-6 space-y-3 border-0 p-0"><legend className="sr-only">Chọn hạng vé</legend>{ticketTiers.map((tier) => { const selected = tier.id === selectedTierId; const availability = getTicketAvailability(tier); const bounds = getTicketQuantityBounds(tier); return <label key={tier.id} className={`block rounded-lg border p-4 ${availability.available ? 'cursor-pointer' : 'cursor-not-allowed opacity-65'} ${selected ? 'border-blue bg-google-hover' : 'border-line/70 bg-paper hover:border-blue/60'}`}><input className="sr-only" type="radio" name="ticket-tier" value={tier.id} checked={selected} disabled={!availability.available} onChange={() => onSelectTier(tier.id)} />{tier.image && <img className="mb-3 h-28 w-full rounded object-cover" src={tier.image} alt="" />}<span className="flex items-start justify-between gap-4"><span><strong className="block">{tier.name}</strong><span className="mt-1 block text-xs text-ink-soft">{tier.availabilityLabel}</span></span><strong className="text-blue-deep">{formatTicketPrice(tier.price)}</strong></span><span className="mt-2 block text-xs leading-[1.5] text-ink-soft">{tier.note}</span>{tier.saleStartAt && <span className="mt-2 block text-xs text-ink-soft">Mở bán: {formatWindow(tier.saleStartAt)}</span>}{tier.saleEndAt && <span className="block text-xs text-ink-soft">Đóng bán: {formatWindow(tier.saleEndAt)}</span>}<span className="mt-2 block text-xs font-bold text-coral-dark">{statusLabel[availability.status] || `Giới hạn ${bounds.min}–${bounds.max} vé/đơn`}</span></label> })}</fieldset>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-paper-deep p-4"><span className="text-sm font-bold">Số lượng</span><div className="flex items-center gap-3"><button className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line/70 bg-surface font-extrabold disabled:opacity-40" type="button" onClick={onDecrease} disabled={!selectedAvailable || quantity <= selectedBounds.min} aria-label="Giảm số lượng vé">−</button><output className="min-w-6 text-center font-extrabold" aria-label="Số lượng vé đã chọn">{quantity}</output><button className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line/70 bg-surface font-extrabold disabled:opacity-40" type="button" onClick={onIncrease} disabled={!selectedAvailable || quantity >= selectedBounds.max} aria-label="Tăng số lượng vé">+</button></div></div>
      <div className="mt-5 border-t border-line/70 pt-5"><p className="m-0 flex items-end justify-between gap-3"><span className="text-sm font-bold text-ink-soft">Tạm tính</span><strong className="font-body text-[2rem] leading-none tracking-[-0.055em] text-ink">{formatTicketPrice(subtotal)}</strong></p><button className="mt-5 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper hover:bg-coral-dark disabled:opacity-50" type="button" onClick={onMockSubmit} disabled={!selectedAvailable}>Tiếp tục thanh toán</button><p className="mt-3 mb-0 text-xs leading-[1.5] text-ink-soft">Số lượng hiển thị là suất phân bổ đã cấu hình, không phải tồn kho trực tiếp.</p></div>
    </aside>
  )
}
