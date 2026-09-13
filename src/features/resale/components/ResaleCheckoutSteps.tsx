type ResaleCheckoutStepsProps = {
  current: 'payment' | 'complete'
}

export function ResaleCheckoutSteps({ current }: ResaleCheckoutStepsProps) {
  const steps = [
    ['Xem vé', 'done'],
    ['Thanh toán', current === 'payment' ? 'current' : 'done'],
    ['Hoàn tất', current === 'complete' ? 'current' : 'upcoming'],
  ] as const

  return (
    <nav aria-label="Tiến trình mua vé resale">
      <ol className="grid grid-cols-3 gap-2 p-0">
        {steps.map(([label, status], index) => (
          <li key={label} className="min-w-0">
            <span className={`block h-1 rounded-full ${status === 'upcoming' ? 'bg-line' : 'bg-coral'}`} aria-hidden="true" />
            <span className={`mt-2 block text-xs font-extrabold ${status === 'upcoming' ? 'text-ink-soft' : 'text-ink'}`} aria-current={status === 'current' ? 'step' : undefined}>
              {index + 1}. {label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  )
}
