import type { ReactNode } from 'react'
import { AdminResponsiveRecordList } from './AdminCommon.tsx'

export type AdminTableRow = {
  readonly key: string
  readonly cells: readonly ReactNode[]
  readonly onOpen?: () => void
  readonly openLabel?: string
}

export function AdminDataTable({ label, headers, rows }: { readonly label: string; readonly headers: readonly string[]; readonly rows: readonly AdminTableRow[] }) {
  if (rows.length === 0) {
    return <div className="rounded-lg border border-dashed border-line bg-surface p-6 text-center text-ink-soft" role="status">Không có bản ghi phù hợp với bộ lọc hiện tại.</div>
  }

  return (
    <AdminResponsiveRecordList label={label}>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead className="bg-paper-deep"><tr>{headers.map((header) => <th className="px-4 py-3 font-extrabold" key={header}>{header}</th>)}<th className="px-4 py-3"><span className="sr-only">Thao tác</span></th></tr></thead>
          <tbody>{rows.map((row) => <tr className="border-t border-line" key={row.key}>{row.cells.map((cell, index) => <td className="px-4 py-3 align-top" key={index}>{cell}</td>)}<td className="px-4 py-3">{row.onOpen && <button className="min-h-11 rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={row.onOpen}>{row.openLabel ?? 'Chi tiết'}</button>}</td></tr>)}</tbody>
        </table>
      </div>
      <ul className="m-0 grid list-none gap-3 p-3 md:hidden">
        {rows.map((row) => <li className="rounded-lg border border-line bg-surface p-4" key={row.key}><dl className="m-0 grid gap-3">{row.cells.map((cell, index) => <div className="grid gap-1" key={index}><dt className="text-xs font-extrabold uppercase tracking-wide text-ink-soft">{headers[index] ?? `Trường ${index + 1}`}</dt><dd className="m-0 text-sm">{cell}</dd></div>)}</dl>{row.onOpen && <button className="mt-4 min-h-11 w-full rounded border border-blue px-3 font-bold text-blue-deep" type="button" onClick={row.onOpen}>{row.openLabel ?? 'Chi tiết'}</button>}</li>)}
      </ul>
    </AdminResponsiveRecordList>
  )
}
