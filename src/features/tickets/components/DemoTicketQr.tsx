const cells = [0, 1, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 18, 20, 22, 24, 25, 27, 29, 31, 32, 34, 36, 38, 40, 41, 43, 45, 46, 48, 50, 52, 54, 56, 57, 59, 61, 63]
type Props = { large?: boolean }
export function DemoTicketQr({ large = false }: Props) {
  return <div className={`relative grid aspect-square grid-cols-8 gap-1 border-[0.6rem] border-surface bg-surface p-2 ${large ? 'w-[min(78vw,24rem)]' : 'w-full max-w-[15rem]'}`} aria-label="Mã QR vé demo không thể check-in">{Array.from({ length: 64 }, (_, index) => <span key={index} className={cells.includes(index) ? 'bg-pine' : 'bg-paper-deep'} />)}<strong className="absolute inset-x-1 top-1/2 -translate-y-1/2 -rotate-6 bg-coral px-2 py-3 text-center text-[0.65rem] tracking-[0.08em] text-paper">VÉ DEMO · KHÔNG CHECK-IN</strong></div>
}
