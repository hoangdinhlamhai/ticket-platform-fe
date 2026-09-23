const steps = ['Thông tin sự kiện', 'Thời gian & Loại vé', 'Xác nhận sau khi mua', 'Thông tin thanh toán'] as const

type Props = { currentStep: number }

export function OrganizerEventWizardProgress({ currentStep }: Props) {
  return <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Tiến trình tạo sự kiện">
    {steps.map((step, index) => <li key={step} className={`flex min-h-12 items-center justify-center gap-2 rounded-md px-2 text-center text-xs font-extrabold leading-none ${index === currentStep ? 'bg-blue text-paper' : index < currentStep ? 'bg-mint text-success' : 'bg-paper-deep text-ink-soft'}`} aria-current={index === currentStep ? 'step' : undefined}><span>{index + 1}</span><span>{step}</span></li>)}
  </ol>
}
