import type { AttendeePath } from '../../../app/routing/attendee-route'
import type { OwnedTicket } from '../../tickets'
import { CustomerProfileForm } from '../components/CustomerProfileForm'
import { ProfileAvatar } from '../components/ProfileAvatar'
import { ProfileTicketOverview } from '../components/ProfileTicketOverview'
import { useCustomerProfile } from '../hooks/use-customer-profile'
import type { CustomerProfile } from '../types/customer-profile'

type CustomerProfilePageProps = {
  onNavigate: (path: AttendeePath) => void
  onNoticeChange: (notice: string) => void
  onSaveProfile: (profile: CustomerProfile) => void
  profile: CustomerProfile
  tickets: readonly OwnedTicket[]
}

export function CustomerProfilePage({ onNavigate, onNoticeChange, onSaveProfile, profile, tickets }: CustomerProfilePageProps) {
  const saveProfile = (nextProfile: CustomerProfile) => {
    onSaveProfile(nextProfile)
    onNoticeChange('Đã cập nhật thông tin hồ sơ trong phiên minh họa.')
  }
  const { draft, errors, handleChange, handleSubmit, isDirty } = useCustomerProfile({ profile, onSave: saveProfile })

  return (
    <div className="bg-paper-deep py-[clamp(2.5rem,6vw,5rem)]">
      <div className="attendee-container">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-line bg-paper p-6 mobile:p-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar fullName={draft.fullName} />
            <div>
              <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">HỒ SƠ DEMO CỦA PROTOTYPE</p>
              <h1 className="mt-2 mb-0 font-body text-[clamp(2rem,4vw,3.8rem)] leading-[0.9] font-extrabold tracking-[-0.08em] text-ink">{draft.fullName || 'Khách hàng Ticketly'}</h1>
              <p className="mt-2 mb-0 text-sm text-ink-soft">{draft.email}</p>
            </div>
          </div>
          <span className="rounded-sm border border-blue/40 bg-google-hover px-3 py-2 text-[0.7rem] font-extrabold tracking-[0.08em] text-blue-deep">KHÔNG ĐỒNG BỘ TÀI KHOẢN</span>
        </header>
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] items-start gap-6 max-[1100px]:grid-cols-1">
          <CustomerProfileForm profile={draft} errors={errors} isDirty={isDirty} onChange={handleChange} onSubmit={handleSubmit} />
          <ProfileTicketOverview tickets={tickets} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  )
}
