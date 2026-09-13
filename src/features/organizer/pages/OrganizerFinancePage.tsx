import { useMemo } from 'react'
import { OrganizerFinanceSummary } from '../components/OrganizerFinanceSummary.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { OrganizerPayoutTable } from '../components/OrganizerPayoutTable.tsx'
import { selectOrganizerFinanceSummary } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = { workspace: OrganizerWorkspace }

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function OrganizerFinancePage({ workspace }: Props) {
  const summary = useMemo(() => selectOrganizerFinanceSummary(workspace), [workspace])
  const refunds = [...workspace.refunds].sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))

  return <div className="mx-auto max-w-7xl space-y-7">
    <OrganizerPageHeader eyebrow="TÀI CHÍNH TỔ CHỨC" title="Tài chính"><p>Báo cáo chỉ đọc từ dữ liệu mô phỏng. Không có phí nền tảng, thao tác thanh toán, hoàn tiền hoặc chi trả nào trên trang này.</p></OrganizerPageHeader>
    <OrganizerFinanceSummary summary={summary} />
    <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="refund-heading"><h2 id="refund-heading" className="m-0 text-xl font-extrabold">Hoàn tiền đã ghi nhận</h2><p className="mt-2 text-sm text-ink-soft">Tổng hoàn tiền: <strong>{money(summary.refundTotal)}</strong></p>{refunds.length ? <ul className="mt-4 divide-y divide-line p-0">{refunds.map((refund) => <li className="py-4" key={refund.id}><strong>{money(refund.amount)}</strong><span className="ml-2 text-sm text-ink-soft">{refund.reason}</span></li>)}</ul> : <p className="mt-4 text-sm text-ink-soft">Chưa có khoản hoàn tiền.</p>}</section>
    <OrganizerPayoutTable events={workspace.events} payouts={workspace.payouts} />
  </div>
}
