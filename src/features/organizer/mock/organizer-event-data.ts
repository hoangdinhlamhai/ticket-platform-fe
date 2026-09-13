import type { OrganizerEvent } from '../types/organizer-event.ts'

export const ORGANIZER_EVENT_FIXTURES: readonly OrganizerEvent[] = [
  { id: 'org-event-draft', title: 'Lễ hội Âm thanh Đương đại', startsAt: '2026-11-12T19:30:00+07:00', endsAt: '2026-11-12T22:30:00+07:00', venue: 'Nhà hát Thành phố', city: 'TP. Hồ Chí Minh', status: 'draft', reviewFeedback: null },
  { id: 'org-event-pending', title: 'Hội thảo Sáng tạo Việt', startsAt: '2026-11-18T08:30:00+07:00', endsAt: '2026-11-18T17:00:00+07:00', venue: 'Trung tâm Hội nghị', city: 'Hà Nội', status: 'pending_review', reviewFeedback: null },
  { id: 'org-event-changes', title: 'Đêm thơ Bên sông Hàn', startsAt: '2026-11-21T19:00:00+07:00', endsAt: '2026-11-21T21:30:00+07:00', venue: 'Cung Văn hóa', city: 'Đà Nẵng', status: 'changes_requested', reviewFeedback: 'Vui lòng bổ sung chính sách hoàn vé và sơ đồ chỗ ngồi.' },
  { id: 'org-event-approved', title: 'Tuần lễ Thiết kế Trẻ', startsAt: '2026-12-03T09:00:00+07:00', endsAt: '2026-12-05T18:00:00+07:00', venue: 'Nhà triển lãm', city: 'TP. Hồ Chí Minh', status: 'approved', reviewFeedback: null },
  { id: 'org-event-published', title: 'Chạy vì Thành phố Xanh', startsAt: '2026-10-25T05:30:00+07:00', endsAt: '2026-10-25T10:30:00+07:00', venue: 'Công viên Bờ sông', city: 'TP. Hồ Chí Minh', status: 'published', reviewFeedback: null },
  { id: 'org-event-ongoing', title: 'Triển lãm Nét Việt', startsAt: '2026-09-02T08:00:00+07:00', endsAt: '2026-09-04T18:00:00+07:00', venue: 'Bảo tàng Mỹ thuật', city: 'Hà Nội', status: 'ongoing', reviewFeedback: null },
  { id: 'org-event-ended', title: 'Đêm nhạc Giai điệu Phố', startsAt: '2026-08-15T19:00:00+07:00', endsAt: '2026-08-15T22:00:00+07:00', venue: 'Nhà Văn hóa Thanh niên', city: 'TP. Hồ Chí Minh', status: 'ended', reviewFeedback: null },
  { id: 'org-event-cancelled', title: 'Ngày hội Ẩm thực Bốn Mùa', startsAt: '2026-10-12T09:00:00+07:00', endsAt: '2026-10-12T21:00:00+07:00', venue: 'Công viên Trung tâm', city: 'Cần Thơ', status: 'cancelled', reviewFeedback: 'Sự kiện tạm dừng do điều kiện tổ chức thay đổi.' },
  { id: 'org-event-rejected', title: 'Liên hoan Nghệ thuật Đường phố', startsAt: '2026-11-28T16:00:00+07:00', endsAt: '2026-11-28T22:00:00+07:00', venue: 'Phố đi bộ', city: 'Hà Nội', status: 'rejected', reviewFeedback: 'Hồ sơ chưa đáp ứng yêu cầu thông tin an toàn sự kiện.' },
]
