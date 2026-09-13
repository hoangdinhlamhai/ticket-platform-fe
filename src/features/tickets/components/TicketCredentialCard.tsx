import { useRef, useState } from 'react'
import type { OwnedTicket } from '../types/ticket'
import { DemoTicketQr } from './DemoTicketQr'
import { TicketQrDialog } from './TicketQrDialog'
const labels = { ready: 'Sẵn sàng demo', pending: 'Chưa phát hành', revoked: 'Đã vô hiệu' }
export function TicketCredentialCard({ ticket }: { ticket: OwnedTicket }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  return <aside className="rounded-lg bg-blue p-6 text-paper"><p className="text-xs font-extrabold tracking-[0.1em] text-mint">E-TICKET CREDENTIAL</p><h2 className="mt-2 font-body text-4xl font-extrabold tracking-[-0.08em]">{labels[ticket.credentialStatus]}</h2><div className={`mt-5 rounded-lg bg-paper p-4 ${ticket.credentialStatus === 'revoked' ? 'opacity-45' : ''}`}><DemoTicketQr /></div><dl className="mt-5 space-y-2 text-sm"><div><dt className="text-story-copy">Mã credential</dt><dd className="m-0 break-all font-extrabold">{ticket.credentialCode}</dd></div><div><dt className="text-story-copy">Chủ vé</dt><dd className="m-0 font-extrabold">{ticket.holderName}</dd></div></dl><p className="mt-4 rounded-md border border-mint/30 p-3 text-xs font-bold text-mint">VÉ DEMO · KHÔNG CÓ GIÁ TRỊ CHECK-IN</p><button ref={triggerRef} className="mt-4 min-h-12 w-full rounded-md bg-coral px-4 font-extrabold text-paper disabled:opacity-40" type="button" disabled={ticket.credentialStatus !== 'ready'} onClick={() => setOpen(true)}>Phóng to QR demo</button><TicketQrDialog open={open} onClose={() => setOpen(false)} returnFocus={triggerRef} /></aside>
}
