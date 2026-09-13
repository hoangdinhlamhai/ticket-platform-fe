import { useEffect, useRef, type RefObject } from 'react'
import type { EventDiscoveryFilters } from '../helpers/event-discovery-filter-state'
import { AdvancedEventFilterControls } from './AdvancedEventFilterControls'

type EventFilterDrawerProps = {
  activeFilterCount: number
  filters: EventDiscoveryFilters
  isOpen: boolean
  onApply: () => void
  onChange: <K extends keyof EventDiscoveryFilters>(field: K, value: EventDiscoveryFilters[K]) => void
  onClose: () => void
  onReset: () => void
  returnFocus: RefObject<HTMLButtonElement | null>
}

export function EventFilterDrawer({ activeFilterCount, filters, isOpen, onApply, onChange, onClose, onReset, returnFocus }: EventFilterDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const trigger = returnFocus.current
    closeButtonRef.current?.focus()
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab') return
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    window.addEventListener('keydown', handleKeydown)
    return () => { window.removeEventListener('keydown', handleKeydown); trigger?.focus() }
  }, [isOpen, onClose, returnFocus])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 block min-[1101px]:hidden" role="presentation">
      <button className="absolute inset-0 h-full w-full cursor-default bg-pine/55" type="button" aria-label="Đóng bộ lọc" onClick={onClose} />
      <section ref={panelRef} className="absolute right-0 bottom-0 left-0 max-h-[92dvh] overflow-y-auto rounded-t-2xl bg-paper px-5 pt-5 pb-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="mobile-event-filter-title">
        <header className="mb-5 flex items-start justify-between gap-4 border-b border-line pb-4">
          <div><p className="m-0 text-[0.68rem] font-extrabold tracking-[0.1em] text-coral-dark">TÌM ĐÚNG CUỘC HẸN</p><h2 id="mobile-event-filter-title" className="mt-1 mb-0 text-2xl font-extrabold">Bộ lọc sự kiện</h2></div>
          <button ref={closeButtonRef} className="min-h-11 rounded-md border border-line bg-surface px-4 text-sm font-extrabold" type="button" onClick={onClose}>Đóng</button>
        </header>
        <AdvancedEventFilterControls filters={filters} onChange={onChange} />
        <div className="sticky bottom-0 mt-6 grid grid-cols-2 gap-3 border-t border-line bg-paper pt-4">
          <button className="min-h-12 rounded-md border border-blue-deep/50 bg-surface px-4 text-sm font-extrabold text-blue-deep" type="button" onClick={onReset}>Đặt lại</button>
          <button className="min-h-12 rounded-md bg-blue px-4 text-sm font-extrabold text-paper" type="button" onClick={onApply}>Xem sự kiện{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</button>
        </div>
      </section>
    </div>
  )
}
