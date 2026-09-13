import type { OrganizerAttendee } from '../types/organizer-commerce.ts'

type Props = {
  attendees: readonly OrganizerAttendee[]
  selectedAttendeeId: string | null
  onSelect: (attendeeId: string) => void
}

const credentialLabels = { valid: 'Hợp lệ', checked_in: 'Đã check-in', void: 'Đã thu hồi' } as const

export function OrganizerCheckInCandidateList({ attendees, selectedAttendeeId, onSelect }: Props) {
  if (!attendees.length) return null
  return (
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="check-in-candidates-title">
      <h2 id="check-in-candidates-title" className="m-0 text-lg font-extrabold">Kết quả tra cứu</h2>
      <ul className="mt-3 space-y-2 p-0" aria-label="Chọn người giữ vé">
        {attendees.map((attendee) => <li className="list-none" key={attendee.id}><button className={`min-h-12 w-full rounded-md border p-3 text-left ${selectedAttendeeId === attendee.id ? 'border-blue bg-paper-deep' : 'border-line bg-paper'}`} type="button" aria-pressed={selectedAttendeeId === attendee.id} onClick={() => onSelect(attendee.id)}><strong>{attendee.fullName}</strong><span className="block text-sm text-ink-soft">{attendee.email} · {attendee.ticketReference} · {credentialLabels[attendee.credentialStatus]}</span></button></li>)}
      </ul>
    </section>
  )
}
