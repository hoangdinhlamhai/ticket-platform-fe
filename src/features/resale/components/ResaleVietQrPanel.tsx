import { forwardRef } from 'react'
import { formatResalePrice } from '../helpers/format-resale-price'

type ResaleVietQrPanelProps = {
  acceptedTerms: boolean
  amount: number
  error?: string
  onAcceptedTermsChange: (accepted: boolean) => void
  transferContent: string
}

const cells = [0, 1, 2, 3, 5, 8, 9, 10, 12, 14, 17, 18, 20, 22, 24, 26, 27, 29, 31, 32, 34, 36, 38, 40, 41, 43, 45, 46, 48]

export const ResaleVietQrPanel = forwardRef<HTMLInputElement, ResaleVietQrPanelProps>(function ResaleVietQrPanel({ acceptedTerms, amount, error, onAcceptedTermsChange, transferContent }, ref) {
  return (
    <section className="rounded-lg border border-line bg-paper-deep p-5" aria-labelledby="vietqr-title">
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">PHƯƠNG THỨC DUY NHẤT</p>
      <h2 id="vietqr-title" className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.06em]">VietQR minh họa</h2>
      <div className="mt-5 grid grid-cols-[10rem_minmax(0,1fr)] gap-5 mobile:block">
        <div className="relative grid aspect-square grid-cols-7 gap-1 border-8 border-surface bg-surface p-2 shadow-sm mobile:mx-auto mobile:max-w-44" aria-label="Hình mô phỏng QR không thể thanh toán">
          {Array.from({ length: 49 }, (_, index) => <span key={index} className={cells.includes(index) ? 'bg-pine' : 'bg-paper-deep'} />)}
          <strong className="absolute inset-x-1 top-1/2 -translate-y-1/2 rotate-[-8deg] bg-coral px-1 py-2 text-center text-[0.62rem] tracking-[0.08em] text-paper">KHÔNG QUÉT</strong>
        </div>
        <dl className="m-0 space-y-3 text-sm">
          <div><dt className="text-ink-soft">Ngân hàng</dt><dd className="m-0 mt-1 font-extrabold">TICKETLY DEMO BANK</dd></div>
          <div><dt className="text-ink-soft">Tên tài khoản</dt><dd className="m-0 mt-1 font-extrabold">CONG DONG TICKETLY MOCK</dd></div>
          <div><dt className="text-ink-soft">Số tiền</dt><dd className="m-0 mt-1 text-xl font-extrabold tabular-nums text-blue-deep">{formatResalePrice(amount)}</dd></div>
          <div><dt className="text-ink-soft">Nội dung</dt><dd className="m-0 mt-1 break-all font-extrabold">{transferContent}</dd></div>
        </dl>
      </div>
      <p className="mt-5 mb-0 rounded-md border border-error/30 bg-error-ring px-4 py-3 text-sm font-extrabold text-error">MINH HỌA — KHÔNG CHUYỂN TIỀN. Không có tài khoản ngân hàng hoặc giao dịch thật.</p>
      <label className={`mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-md border bg-surface p-3 text-sm leading-[1.5] ${error ? 'border-error ring-3 ring-error-ring' : 'border-line'}`}>
        <input ref={ref} className="mt-1 h-5 w-5 shrink-0 accent-blue" type="checkbox" checked={acceptedTerms} aria-invalid={Boolean(error)} aria-describedby={error ? 'acceptedTerms-error' : undefined} onChange={(event) => onAcceptedTermsChange(event.target.checked)} />
        <span>Tôi hiểu đây là prototype và xác nhận thông tin listing trước khi tiếp tục.</span>
      </label>
      {error && <p id="acceptedTerms-error" className="mt-2 mb-0 text-sm font-bold text-error" role="alert">{error}</p>}
    </section>
  )
})
