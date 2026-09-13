type Props = { current: 'payment' | 'complete' }
export function PrimaryCheckoutSteps({ current }: Props) {
  const steps = [['Chọn vé', 'done'], ['Thanh toán', current === 'payment' ? 'current' : 'done'], ['Hoàn tất', current === 'complete' ? 'current' : 'upcoming']] as const
  return <nav aria-label="Tiến trình mua vé chính thức"><ol className="grid grid-cols-3 gap-2 p-0">{steps.map(([label, status], index) => <li key={label}><span className={`block h-1 rounded-full ${status === 'upcoming' ? 'bg-line' : 'bg-coral'}`} /><span className={`mt-2 block text-xs font-extrabold ${status === 'upcoming' ? 'text-ink-soft' : 'text-ink'}`} aria-current={status === 'current' ? 'step' : undefined}>{index + 1}. {label}</span></li>)}</ol></nav>
}
