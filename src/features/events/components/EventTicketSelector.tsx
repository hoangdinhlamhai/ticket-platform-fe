import { formatTicketPrice } from '../helpers/formatTicketPrice'
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

export function EventTicketSelector({
  onDecrease, onIncrease, onMockSubmit, onSelectTier, quantity,
  selectedTier, selectedTierId, subtotal, ticketTiers,
}: EventTicketSelectorProps) {
  return (
    <aside className="rounded-lg border border-line/70 bg-surface p-5" aria-labelledby="ticket-selector-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">CHỌN VÉ MINH HỌA</p>
      <h2 id="ticket-selector-title" className="mt-2 mb-0 font-body text-[2.5rem] leading-[0.92] font-extrabold tracking-[-0.07em]">Bạn muốn đứng ở đâu?</h2>
      <fieldset className="mt-6 space-y-3 border-0 p-0">
        <legend className="sr-only">Chọn hạng vé</legend>
        {ticketTiers.map((tier) => {
          const selected = tier.id === selectedTierId
          return (
            <label key={tier.id} className={`block cursor-pointer rounded-lg border p-4 ${selected ? 'border-blue bg-google-hover' : 'border-line/70 bg-paper hover:border-blue/60'}`}>
              <input className="sr-only" type="radio" name="ticket-tier" value={tier.id} checked={selected} onChange={() => onSelectTier(tier.id)} />
              <span className="flex items-start justify-between gap-4"><span><strong className="block">{tier.name}</strong><span className="mt-1 block text-xs text-ink-soft">{tier.availabilityLabel}</span></span><strong className="text-blue-deep">{formatTicketPrice(tier.price)}</strong></span>
              <span className="mt-2 block text-xs leading-[1.5] text-ink-soft">{tier.note}</span>
            </label>
          )
        })}
      </fieldset>
      <div className="mt-5 flex items-center justify-between gap-4 rounded-lg bg-paper-deep p-4">
        <span className="text-sm font-bold">Số lượng</span>
        <div className="flex items-center gap-3">
          <button className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line/70 bg-surface font-extrabold disabled:opacity-40" type="button" onClick={onDecrease} disabled={quantity <= 1} aria-label="Giảm số lượng vé">−</button>
          <output className="min-w-6 text-center font-extrabold" aria-label="Số lượng vé đã chọn">{quantity}</output>
          <button className="grid min-h-11 min-w-11 place-items-center rounded-md border border-line/70 bg-surface font-extrabold disabled:opacity-40" type="button" onClick={onIncrease} disabled={quantity >= 4} aria-label="Tăng số lượng vé">+</button>
        </div>
      </div>
      <div className="mt-5 border-t border-line/70 pt-5">
        <p className="m-0 flex items-end justify-between gap-3"><span className="text-sm font-bold text-ink-soft">Tạm tính</span><strong className="font-body text-[2rem] leading-none tracking-[-0.055em] text-ink">{formatTicketPrice(subtotal)}</strong></p>
        <button className="mt-5 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper hover:bg-coral-dark" type="button" onClick={onMockSubmit} disabled={!selectedTier}>Tiếp tục thanh toán</button>
        <p className="mt-3 mb-0 text-xs leading-[1.5] text-ink-soft">Checkout tiếp theo chỉ mô phỏng giao dịch và không giữ chỗ thật.</p>
      </div>
    </aside>
  )
}
