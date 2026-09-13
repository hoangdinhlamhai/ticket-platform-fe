import type { OwnedTicket } from '../types/ticket'

type TicketInformationCardProps = { ticket: OwnedTicket }

export function TicketInformationCard({ ticket }: TicketInformationCardProps) {
  return (
    <section aria-labelledby="ticket-information-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">THÔNG TIN ĐANG GHI NHẬN</p>
      <h2 id="ticket-information-title" className="mt-2 mb-0 font-body text-[clamp(2.2rem,4vw,3.8rem)] leading-[0.9] font-extrabold tracking-[-0.075em]">Vé này đang thuộc về bạn.</h2>
      <dl className="mt-6 grid grid-cols-2 gap-3 mobile:grid-cols-1">
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">NGƯỜI SỞ HỮU</dt><dd className="mt-2 ml-0 font-bold">{ticket.holderName}</dd></div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">MÃ THAM CHIẾU</dt><dd className="mt-2 ml-0 font-bold">{ticket.referenceCode}</dd></div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">HẠNG VÉ</dt><dd className="mt-2 ml-0 font-bold">{ticket.ticketType}</dd></div>
        <div className="rounded-lg border border-line/70 bg-surface p-4"><dt className="text-xs font-extrabold text-ink-soft">NGÀY GHI NHẬN</dt><dd className="mt-2 ml-0 font-bold">{ticket.purchaseLabel}</dd></div>
      </dl>
    </section>
  )
}
