type EventDiscoveryEmptyStateProps = {
  onReset: () => void
  onSuggestionSelect: (query: string) => void
}

const suggestions = ['Âm nhạc', 'Nhà hát', 'TP. Hồ Chí Minh'] as const

export function EventDiscoveryEmptyState({ onReset, onSuggestionSelect }: EventDiscoveryEmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-paper-deep px-5 py-10 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-poster-yellow text-2xl" aria-hidden="true">?</span>
      <p className="mt-4 mb-0 font-body text-[1.7rem] font-extrabold tracking-[-0.07em] text-ink">Chưa tìm thấy cuộc hẹn phù hợp.</p>
      <p className="mx-auto mt-2 mb-0 max-w-xl text-[0.9rem] leading-[1.55] text-ink-soft">Thử mở rộng khoảng ngày, bỏ bớt điều kiện hoặc khám phá một gợi ý đang được quan tâm.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {suggestions.map((suggestion) => <button key={suggestion} className="min-h-10 rounded-full border border-blue-deep/25 bg-surface px-4 text-xs font-extrabold text-blue-deep hover:bg-mint" type="button" onClick={() => onSuggestionSelect(suggestion)}>{suggestion}</button>)}
      </div>
      <button className="mt-5 min-h-11 rounded-md bg-blue px-5 text-sm font-extrabold text-paper" type="button" onClick={onReset}>Xóa tất cả bộ lọc</button>
    </div>
  )
}
