import type { DemoPaymentOutcome } from '../../orders'
type Props = { value: DemoPaymentOutcome; onChange: (value: DemoPaymentOutcome) => void }
const outcomes: readonly [DemoPaymentOutcome, string, string][] = [['completed', 'Thành công', 'Phát hành vé và credential demo.'], ['failed', 'Thất bại', 'Tạo đơn thất bại để xem luồng thử lại.'], ['expired', 'Hết hạn', 'Mô phỏng phiên giữ chỗ đã kết thúc.']]
export function DemoPaymentOutcomeSelector({ value, onChange }: Props) {
  return <fieldset className="rounded-lg border border-blue/35 bg-google-hover p-5"><legend className="px-2 text-lg font-extrabold">Chọn kết quả thanh toán demo</legend><div className="mt-3 grid grid-cols-3 gap-3 mobile:grid-cols-1">{outcomes.map(([outcome, label, detail]) => <label key={outcome} className={`cursor-pointer rounded-md border p-3 ${value === outcome ? 'border-blue bg-surface' : 'border-line bg-paper'}`}><input className="mr-2 accent-blue" type="radio" name="demo-outcome" checked={value === outcome} onChange={() => onChange(outcome)} /><strong>{label}</strong><span className="mt-1 block text-xs leading-[1.5] text-ink-soft">{detail}</span></label>)}</div></fieldset>
}
