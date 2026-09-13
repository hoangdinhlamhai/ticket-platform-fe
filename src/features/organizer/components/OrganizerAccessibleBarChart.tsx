import { useId } from 'react'

export type OrganizerAccessibleBarDatum = {
  readonly label: string
  readonly value: number
  readonly detail: string
}

type Props = {
  title: string
  unit: string
  values: readonly OrganizerAccessibleBarDatum[]
}

export function OrganizerAccessibleBarChart({ title, unit, values }: Props) {
  const headingId = useId()
  const maximum = Math.max(0, ...values.map((item) => item.value))
  return <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby={headingId}>
    <h2 id={headingId} className="m-0 text-xl font-extrabold">{title}</h2>
    <p className="mt-2 text-sm text-ink-soft">Biểu đồ thanh kèm danh sách giá trị đầy đủ; {unit}.</p>
    {values.length ? <>
      <div className="mt-5 space-y-4">
        {values.map((item) => <div key={item.label}><div className="flex justify-between gap-3 text-sm font-bold"><span>{item.label}</span><span>{item.detail}</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full bg-blue" style={{ width: `${maximum === 0 ? 0 : Math.max(2, Math.round((item.value / maximum) * 100))}%` }} /></div></div>)}
      </div>
      <ul className="mt-5 divide-y divide-line border-t border-line p-0" aria-label={`${title}: danh sách giá trị`}>
        {values.map((item) => <li className="flex justify-between gap-3 py-3 text-sm" key={item.label}><span className="font-bold">{item.label}</span><span>{item.detail}</span></li>)}
      </ul>
    </> : <p className="mt-5 rounded-md bg-paper-deep p-4 text-sm font-bold text-ink-soft">Chưa có dữ liệu để hiển thị.</p>}
  </section>
}
