type EventRecentSearchesProps = {
  onSelect: (query: string) => void
}

const recentSearches = ['Concert cuối tuần', 'Workshop làm gốm', 'Nhà hát Thành phố'] as const

export function EventRecentSearches({ onSelect }: EventRecentSearchesProps) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Tìm kiếm gần đây">
      <span className="mr-1 text-[0.7rem] font-extrabold tracking-[0.08em] text-story-copy">TÌM GẦN ĐÂY</span>
      {recentSearches.map((query) => (
        <button key={query} className="min-h-9 rounded-full border border-story-copy/35 bg-pine/45 px-3 text-xs font-bold text-paper hover:border-mint hover:bg-mint hover:text-pine" type="button" onClick={() => onSelect(query)}>{query}</button>
      ))}
    </div>
  )
}
