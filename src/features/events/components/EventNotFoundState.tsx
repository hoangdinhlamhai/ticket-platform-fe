type EventNotFoundStateProps = { onBack: () => void }

export function EventNotFoundState({ onBack }: EventNotFoundStateProps) {
  return (
    <section className="px-6 py-[clamp(5rem,12vw,9rem)] text-center mobile:px-5" aria-labelledby="event-not-found-title">
      <div className="mx-auto max-w-2xl rounded-lg border border-dashed border-line/70 bg-paper-deep p-8">
        <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">EVENT / 404</p>
        <h1 id="event-not-found-title" className="mt-3 mb-0 font-body text-[clamp(2.8rem,6vw,5rem)] leading-[0.9] font-extrabold tracking-[-0.08em]">Không tìm thấy cuộc hẹn này.</h1>
        <p className="mt-5 mb-0 leading-[1.65] text-ink-soft">Đường dẫn chưa khớp với dữ liệu sự kiện minh họa hiện có.</p>
        <button className="mt-7 min-h-11 rounded-md bg-blue px-5 font-extrabold text-paper hover:bg-blue-deep" type="button" onClick={onBack}>Quay lại khám phá</button>
      </div>
    </section>
  )
}
