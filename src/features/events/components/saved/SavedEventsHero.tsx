export function SavedEventsHero() {
  return (
    <section
      className="border-b border-line bg-paper-deep py-[clamp(3.5rem,7vw,6rem)]"
      aria-labelledby="saved-events-title"
    >
      <div className="attendee-container">
        <p className="m-0 text-[0.72rem] font-extrabold tracking-[0.11em] text-coral-dark">
          DANH SÁCH QUAN TÂM
        </p>
        <h1
          id="saved-events-title"
          className="mt-3 mb-0 max-w-[48rem] font-body text-[clamp(3rem,7vw,6.8rem)] leading-[0.8] font-extrabold tracking-[-0.1em] text-ink"
        >
          Sự kiện đã lưu.
        </h1>
        <p className="mt-5 mb-0 max-w-[42rem] text-[0.95rem] leading-[1.65] text-ink-soft">
          Một góc nhỏ để giữ lại những điểm hẹn bạn đang quan tâm. Danh sách hiện dùng dữ liệu minh họa và sẽ được đặt lại khi tải lại trang.
        </p>
      </div>
    </section>
  )
}
