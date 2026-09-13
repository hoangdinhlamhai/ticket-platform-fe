import type { EventCategory } from '../types/event'

type EventCategoryFilterProps = {
  categories: readonly EventCategory[]
  onSelect: (category: EventCategory) => void
  selectedCategory: EventCategory
}

export function EventCategoryFilter({ categories, onSelect, selectedCategory }: EventCategoryFilterProps) {
  return (
    <div className="mt-6" role="group" aria-label="Lọc sự kiện theo danh mục">
      <p className="mb-3 text-[0.73rem] font-extrabold tracking-[0.1em] text-mint">CHỌN MỘT NHỊP ĐIỆU</p>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = category === selectedCategory

          return (
            <button
              key={category}
              className={`min-h-11 rounded-md border px-4 text-[0.83rem] font-bold transition-colors duration-150 ease-out motion-reduce:transition-none ${
                isSelected
                  ? 'border-poster-yellow bg-poster-yellow text-pine'
                  : 'border-story-copy/35 bg-transparent text-paper hover:border-mint/80 hover:bg-mint hover:text-pine'
              }`}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(category)}
            >
              {category}
            </button>
          )
        })}
      </div>
    </div>
  )
}
