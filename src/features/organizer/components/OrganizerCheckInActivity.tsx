import { sortOrganizerCheckInActivities } from '../helpers/organizer-check-in-transitions.ts'
import type { OrganizerCheckInActivity, OrganizerAttendee } from '../types/organizer-commerce.ts'

type Props = {
  activities: readonly OrganizerCheckInActivity[]
  attendees: readonly OrganizerAttendee[]
}

const formatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' })

export function OrganizerCheckInActivity({ activities, attendees }: Props) {
  const attendeesById = new Map(attendees.map((attendee) => [attendee.id, attendee]))
  const recentActivities = sortOrganizerCheckInActivities(activities).slice(0, 6)

  return (
    <section className="rounded-lg border border-line bg-surface p-4" aria-labelledby="check-in-activity-title">
      <h2 id="check-in-activity-title" className="m-0 text-lg font-extrabold">Hoạt động check-in gần đây</h2>
      {recentActivities.length ? <ol className="mt-3 space-y-2 p-0">{recentActivities.map((activity) => { const attendee = attendeesById.get(activity.attendeeId); return <li className="list-none border-t border-line pt-2 text-sm" key={activity.id}><strong>{attendee?.fullName ?? 'Người giữ vé không còn trong dữ liệu'}</strong><span className="block text-ink-soft">{attendee?.ticketReference ?? 'Không có mã vé'} · {formatter.format(new Date(activity.checkedInAt))}</span></li> })}</ol> : <p className="mt-3 text-sm text-ink-soft">Chưa có lượt check-in mô phỏng nào.</p>}
    </section>
  )
}
