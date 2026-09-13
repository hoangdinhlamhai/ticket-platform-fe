type Props = { checkedInCount: number; attendeeCount: number }

export function OrganizerCheckInSummary({ checkedInCount, attendeeCount }: Props) {
  const rate = attendeeCount === 0 ? 0 : Math.round((checkedInCount / attendeeCount) * 100)
  return <section className="grid gap-4 sm:grid-cols-3" aria-label="Tóm tắt check-in"><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Đã check-in</p><strong className="mt-2 block text-2xl font-extrabold">{checkedInCount}</strong></article><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Tổng người giữ vé</p><strong className="mt-2 block text-2xl font-extrabold">{attendeeCount}</strong></article><article className="rounded-lg border border-line bg-surface p-4"><p className="m-0 text-sm font-bold text-ink-soft">Tỷ lệ check-in</p><strong className="mt-2 block text-2xl font-extrabold">{rate}%</strong></article></section>
}
