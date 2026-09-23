const steps = ['Thông tin sự kiện', 'Thời gian & Loại vé', 'Cài đặt', 'Thông tin thanh toán'] as const

type Props = { currentStep: number }

export function OrganizerEventWizardProgress({ currentStep }: Props) {
  return <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Tiến trình tạo sự kiện">
    {steps.map((step, index) => <li key={step} className={`min-h-12 rounded-md px-2 py-2 text-center text-xs font-extrabold ${index === currentStep ? 'bg-blue text-paper' : index < currentStep ? 'bg-mint text-success' : 'bg-paper-deep text-ink-soft'}`} aria-current={index === currentStep ? 'step' : undefined}><span className="mr-2 inline-block">{index + 1}</span><span>{step}</span></li>)}
  </ol>
}
