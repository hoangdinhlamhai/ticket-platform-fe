import { useEffect, useRef, useState } from 'react'
import type { AttendeePath } from '../../../routes/attendee-route'
import type { CustomerProfile } from '../../profile'
import type { AttendeeOrderBuyer, DemoPaymentOutcome, PrimaryCheckoutSelection } from '../../orders'
import { DemoPaymentOutcomeSelector } from '../components/DemoPaymentOutcomeSelector'
import { PrimaryBuyerForm } from '../components/PrimaryBuyerForm'
import { PrimaryCheckoutSteps } from '../components/PrimaryCheckoutSteps'
import { PrimaryPurchaseSummary } from '../components/PrimaryPurchaseSummary'
import { PrimaryVietQrPanel } from '../components/PrimaryVietQrPanel'
import { validatePrimaryCheckout } from '../helpers/validate-primary-checkout'
import type { PrimaryCheckoutDraft, PrimaryCheckoutErrors, PrimaryCheckoutField, PrimaryCheckoutSubmission } from '../types/primary-checkout'

type Props = { selection: PrimaryCheckoutSelection | null; profile: CustomerProfile; onComplete: (submission: PrimaryCheckoutSubmission) => void; onNavigate: (path: AttendeePath) => void }
export function PrimaryCheckoutPage({ selection, profile, onComplete, onNavigate }: Props) {
  const [draft, setDraft] = useState<PrimaryCheckoutDraft>({ fullName: profile.fullName, email: profile.email, phone: profile.phone, acceptedTerms: false })
  const [errors, setErrors] = useState<PrimaryCheckoutErrors>({})
  const [outcome, setOutcome] = useState<DemoPaymentOutcome>('completed')
  const [processing, setProcessing] = useState(false)
  const buyerRefs = useRef<(HTMLInputElement | null)[]>([])
  const termsRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | null>(null)
  useEffect(() => () => { if (timerRef.current !== null) window.clearTimeout(timerRef.current) }, [])
  if (!selection) return <section className="px-6 py-24 text-center"><h1 className="font-body text-5xl font-extrabold">Chưa có lựa chọn vé.</h1><p className="mt-4 text-ink-soft">Hãy quay lại sự kiện và chọn hạng vé trước khi checkout.</p><button className="mt-6 min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" onClick={() => onNavigate('/')} type="button">Khám phá sự kiện</button></section>
  const updateBuyer = (field: keyof AttendeeOrderBuyer, value: string) => { setDraft((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: undefined })) }
  const focus = (field: PrimaryCheckoutField) => { const index = { fullName: 0, email: 1, phone: 2 }[field as keyof AttendeeOrderBuyer]; if (typeof index === 'number') buyerRefs.current[index]?.focus(); else termsRef.current?.focus() }
  const submit = () => {
    if (processing) return
    const validation = validatePrimaryCheckout(draft)
    setErrors(validation.errors)
    if (validation.firstInvalidField) { window.requestAnimationFrame(() => focus(validation.firstInvalidField!)); return }
    setProcessing(true)
    timerRef.current = window.setTimeout(() => onComplete({ selection, buyer: { fullName: draft.fullName.trim(), email: draft.email.trim(), phone: draft.phone.trim() }, outcome, transferContent: `TICKETLY ${selection.eventId.replace(/[^a-z0-9]/gi, '').slice(-10).toUpperCase()}` }), 500)
  }
  return <div className="py-[clamp(3rem,6vw,5.5rem)]"><div className="attendee-container"><PrimaryCheckoutSteps current="payment" /><div className="mt-9 grid grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.72fr)] items-start gap-8 max-[1100px]:block"><div className="space-y-7"><PrimaryBuyerForm ref={buyerRefs} buyer={draft} errors={errors} onChange={updateBuyer} /><PrimaryVietQrPanel ref={termsRef} acceptedTerms={draft.acceptedTerms} amount={selection.unitPrice * selection.quantity} error={errors.acceptedTerms} transferContent={`TICKETLY ${selection.eventId.toUpperCase().slice(-10)}`} onAcceptedTermsChange={(acceptedTerms) => { setDraft((current) => ({ ...current, acceptedTerms })); setErrors((current) => ({ ...current, acceptedTerms: undefined })) }} /><DemoPaymentOutcomeSelector value={outcome} onChange={setOutcome} /></div><div className="sticky top-5 max-[1100px]:static max-[1100px]:mt-8"><PrimaryPurchaseSummary selection={selection} /><button className="mt-4 min-h-[3.25rem] w-full rounded-md bg-coral px-5 font-extrabold text-paper disabled:opacity-60" type="button" disabled={processing} onClick={submit}>{processing ? 'Đang tạo kết quả demo…' : 'Xác nhận thanh toán demo'}</button><p className="mt-3 text-center text-xs text-ink-soft" aria-live="polite">{processing ? 'Đang tạo order trong bộ nhớ phiên.' : 'Không có tiền hoặc giữ chỗ thật.'}</p></div></div></div></div>
}
