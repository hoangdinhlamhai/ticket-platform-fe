const steps = ['Cơ bản', 'Thời gian', 'Chính sách', 'Hạng vé', 'Xem trước'] as const

type Props = { currentStep: number }
export function OrganizerEventWizardProgress({ currentStep }: Props) {
  return <ol className="grid grid-cols-5 gap-1" aria-label="Tiến trình tạo sự kiện">{steps.map((step, index) => <li key={step} className={`min-h-11 rounded-md px-2 py-2 text-center text-xs font-extrabold ${index === currentStep ? 'bg-blue text-paper' : index < currentStep ? 'bg-mint text-success' : 'bg-paper-deep text-ink-soft'}`} aria-current={index === currentStep ? 'step' : undefined}><span className="block">{index + 1}</span><span className="hidden sm:inline">{step}</span></li>)}</ol>
}
