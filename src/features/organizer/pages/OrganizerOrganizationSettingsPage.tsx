import { OrganizerOrganizationForm } from '../components/OrganizerOrganizationForm.tsx'
import { OrganizerPageHeader } from '../components/OrganizerPageHeader.tsx'
import { selectOrganizerFinanceSummary } from '../helpers/select-organizer-metrics.ts'
import type { OrganizerOrganization, OrganizerOrganizationPatch } from '../types/organizer-organization.ts'
import type { OrganizerWorkspace } from '../types/organizer-workspace.ts'

type Props = {
  organization: OrganizerOrganization
  onDirtyChange: (dirty: boolean) => void
  onUpdateOrganization: (values: OrganizerOrganizationPatch) => void
  workspace: OrganizerWorkspace
}

const money = (value: number) => `${value.toLocaleString('vi-VN')}đ`

export function OrganizerOrganizationSettingsPage({ organization, onDirtyChange, onUpdateOrganization, workspace }: Props) {
  const finance = selectOrganizerFinanceSummary(workspace)
  const payoutSummary: ReadonlyArray<{ readonly status: string; readonly amount: number }> = [
    { status: 'Đang chờ', amount: finance.payoutsByStatus.pending },
    { status: 'Đã lên lịch', amount: finance.payoutsByStatus.scheduled },
    { status: 'Đã chi trả', amount: finance.payoutsByStatus.paid },
  ]

  return <div className="mx-auto max-w-5xl space-y-7">
    <OrganizerPageHeader eyebrow="CÀI ĐẶT TỔ CHỨC" title="Hồ sơ tổ chức"><p>Thông tin được lưu trong bộ nhớ của phiên minh họa và sẽ đặt lại khi tải lại trang.</p></OrganizerPageHeader>
    <OrganizerOrganizationForm organization={organization} onDirtyChange={onDirtyChange} onSave={onUpdateOrganization} />
    <section className="rounded-lg border border-line bg-surface p-5" aria-labelledby="protected-details-heading">
      <h2 id="protected-details-heading" className="m-0 text-xl font-extrabold">Thông tin tài chính được bảo vệ</h2>
      <p className="mt-2 text-sm text-ink-soft">Chỉ hiển thị để nhận diện và theo dõi; không có thao tác thay đổi tài khoản, thanh toán hoặc chi trả.</p>
      <dl className="mt-5 grid gap-5 sm:grid-cols-2">
        <div><dt className="text-sm font-bold text-ink-soft">Tài khoản nhận chi trả</dt><dd className="mt-2 text-lg font-extrabold">{organization.payoutAccountLabel}</dd></div>
        {organization.businessIdentifier && <div><dt className="text-sm font-bold text-ink-soft">Mã số thuế/mã định danh</dt><dd className="mt-2 text-lg font-extrabold">{organization.businessIdentifier}</dd></div>}
      </dl>
      <div className="mt-6 border-t border-line pt-5" aria-label="Tóm tắt chi trả">
        <h3 className="m-0 text-base font-extrabold">Tóm tắt chi trả</h3>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">{payoutSummary.map(({ status, amount }) => <div key={status}><dt className="text-sm font-bold text-ink-soft">{status}</dt><dd className="mt-1 text-lg font-extrabold">{money(amount)}</dd></div>)}</dl>
      </div>
    </section>
  </div>
}
