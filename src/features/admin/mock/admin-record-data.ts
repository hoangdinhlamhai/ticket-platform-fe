import type { AdminWorkspace } from '../types/admin-workspace.ts'

const rawWorkspace: AdminWorkspace = {
  categories: [{ id: 'cat-music', label: 'Âm nhạc', slug: 'am-nhac', active: true }, { id: 'cat-community', label: 'Cộng đồng', slug: 'cong-dong', active: true }, { id: 'cat-business', label: 'Kinh doanh', slug: 'kinh-doanh', active: true }],
  moderationChecklist: ['Kiểm tra chính sách hoàn vé', 'Kiểm tra thông tin địa điểm', 'Kiểm tra hạng vé và sức chứa'],
  moderationReasons: ['Thiếu bằng chứng hoặc giấy tờ', 'Thông tin sự kiện chưa nhất quán', 'Vi phạm quy định nền tảng'],
  organizers: [
    { id: 'org-green', name: 'Sự kiện Xanh', contactName: 'Ngọc Anh', email: 'contact@sukienxanh.demo', city: 'TP. Hồ Chí Minh', verificationStatus: 'pending', accountStatus: 'active', documents: ['Giấy phép kinh doanh demo', 'Tài khoản ngân hàng demo'], grossSales: 12600000, refundRate: 0.03 },
    { id: 'org-rhythm', name: 'Rhythm Studio', contactName: 'Minh Khang', email: 'hello@rhythm.demo', city: 'Hà Nội', verificationStatus: 'verified', accountStatus: 'active', documents: ['Hồ sơ đã xác minh'], grossSales: 24600000, refundRate: 0.01 },
    { id: 'org-creative', name: 'Creative Hub', contactName: 'Thanh Hà', email: 'team@creative.demo', city: 'Đà Nẵng', verificationStatus: 'changes_requested', accountStatus: 'active', documents: ['Giấy tờ cần bổ sung'], grossSales: 8400000, refundRate: 0.05 },
    { id: 'org-restricted', name: 'Đêm Phố', contactName: 'Quang Vũ', email: 'contact@dempho.demo', city: 'Hà Nội', verificationStatus: 'rejected', accountStatus: 'restricted', documents: ['Hồ sơ bị từ chối'], grossSales: 3200000, refundRate: 0.12 },
  ],
  users: [
    { id: 'user-linh', name: 'Linh Trần', email: 'linh@example.demo', city: 'TP. Hồ Chí Minh', accountStatus: 'active' },
    { id: 'user-nam', name: 'Nam Nguyễn', email: 'nam@example.demo', city: 'Hà Nội', accountStatus: 'restricted' },
    { id: 'user-huong', name: 'Hương Lê', email: 'huong@example.demo', city: 'Đà Nẵng', accountStatus: 'active' },
  ],
  events: [
    { id: 'event-music', organizerId: 'org-rhythm', title: 'Đêm Âm nhạc Thành phố', categoryId: 'cat-music', city: 'Hà Nội', venue: 'Nhà hát Lớn', startsAt: '2026-09-12T19:00:00+07:00', policy: 'Hoàn vé trước 72 giờ.', reviewStatus: 'pending_review', submittedAt: '2026-08-28T08:00:00.000Z', submissionNumber: 2, ticketTiers: [{ id: 'tier-music-standard', name: 'Tiêu chuẩn', price: 450000, capacity: 500, soldCount: 0 }], riskFlags: ['Sự kiện sắp diễn ra'], reviewHistory: [{ id: 'review-music-1', submittedAt: '2026-08-12T08:00:00.000Z', reviewedAt: '2026-08-14T09:00:00.000Z', decision: 'changes_requested', reason: 'Bổ sung sơ đồ chỗ ngồi.' }] },
    { id: 'event-green', organizerId: 'org-green', title: 'Ngày hội Sống Xanh', categoryId: 'cat-community', city: 'TP. Hồ Chí Minh', venue: 'Công viên Bờ sông', startsAt: '2026-10-02T08:00:00+07:00', policy: 'Đổi vé theo điều kiện demo.', reviewStatus: 'pending_review', submittedAt: '2026-08-30T05:00:00.000Z', submissionNumber: 1, ticketTiers: [{ id: 'tier-green', name: 'Vé tham dự', price: 180000, capacity: 1200, soldCount: 0 }], riskFlags: [], reviewHistory: [] },
    { id: 'event-design', organizerId: 'org-creative', title: 'Tuần lễ Thiết kế Trẻ', categoryId: 'cat-business', city: 'Đà Nẵng', venue: 'Creative Hub', startsAt: '2026-10-20T09:00:00+07:00', policy: 'Không hoàn vé sau khi xác nhận.', reviewStatus: 'approved', submittedAt: '2026-08-10T09:00:00.000Z', submissionNumber: 1, ticketTiers: [{ id: 'tier-design', name: 'Chuyên môn', price: 650000, capacity: 300, soldCount: 123 }], riskFlags: [], reviewHistory: [] },
    { id: 'event-street', organizerId: 'org-restricted', title: 'Lễ hội Đường phố', categoryId: 'cat-community', city: 'Hà Nội', venue: 'Phố đi bộ', startsAt: '2026-11-05T16:00:00+07:00', policy: 'Chính sách chưa đạt yêu cầu.', reviewStatus: 'rejected', submittedAt: '2026-08-06T09:00:00.000Z', submissionNumber: 1, ticketTiers: [{ id: 'tier-street', name: 'Vé ngày', price: 120000, capacity: 700, soldCount: 0 }], riskFlags: ['Organizer bị hạn chế'], reviewHistory: [] },
  ],
  orders: [
    { id: 'order-001', eventId: 'event-design', organizerId: 'org-creative', userId: 'user-linh', source: 'primary', status: 'completed', amount: 650000, createdAt: '2026-09-05T04:00:00.000Z', paymentStatus: 'Đã thanh toán', ticketIds: ['ticket-001'] },
    { id: 'order-002', eventId: 'event-design', organizerId: 'org-creative', userId: 'user-huong', source: 'resale', status: 'completed', amount: 720000, createdAt: '2026-09-05T03:00:00.000Z', paymentStatus: 'Đã thanh toán', ticketIds: ['ticket-002'] },
    { id: 'order-003', eventId: 'event-music', organizerId: 'org-rhythm', userId: 'user-nam', source: 'primary', status: 'failed', amount: 450000, createdAt: '2026-09-04T03:00:00.000Z', paymentStatus: 'Thất bại', ticketIds: [] },
  ],
  tickets: [
    { id: 'ticket-001', orderId: 'order-001', eventId: 'event-design', userId: 'user-linh', reference: 'TLY-2026-001', credentialCode: 'DEMO-001', credentialStatus: 'valid', checkedInAt: null, resaleListingId: null },
    { id: 'ticket-002', orderId: 'order-002', eventId: 'event-design', userId: 'user-huong', reference: 'TLY-2026-002', credentialCode: 'DEMO-002', credentialStatus: 'valid', checkedInAt: null, resaleListingId: 'resale-001' },
  ],
  resales: [{ id: 'resale-001', ticketId: 'ticket-002', eventId: 'event-design', sellerId: 'user-nam', buyerId: 'user-huong', visibility: 'visible', listingStatus: 'sold', amount: 720000, reported: true, createdAt: '2026-09-02T10:00:00.000Z' }, { id: 'resale-002', ticketId: 'ticket-001', eventId: 'event-design', sellerId: 'user-linh', buyerId: null, visibility: 'hidden', listingStatus: 'active', amount: 700000, reported: false, createdAt: '2026-09-01T10:00:00.000Z' }],
  refunds: [{ id: 'refund-001', orderId: 'order-001', userId: 'user-linh', eventId: 'event-design', organizerId: 'org-creative', amount: 650000, reason: 'Không thể tham dự.', requestedAt: '2026-09-04T08:00:00.000Z', status: 'requested' }, { id: 'refund-002', orderId: 'order-003', userId: 'user-nam', eventId: 'event-music', organizerId: 'org-rhythm', amount: 450000, reason: 'Thanh toán lỗi.', requestedAt: '2026-09-03T08:00:00.000Z', status: 'rejected' }],
  payouts: [{ id: 'payout-001', organizerId: 'org-creative', eventId: 'event-design', grossAmount: 12600000, refundAmount: 650000, netAmount: 11950000, scheduledAt: '2026-09-08T00:00:00.000Z', status: 'scheduled', caseId: 'case-001' }, { id: 'payout-002', organizerId: 'org-rhythm', eventId: 'event-music', grossAmount: 4000000, refundAmount: 0, netAmount: 4000000, scheduledAt: '2026-09-07T00:00:00.000Z', status: 'on_hold', caseId: 'case-002' }, { id: 'payout-003', organizerId: 'org-green', eventId: 'event-green', grossAmount: 3200000, refundAmount: 0, netAmount: 3200000, scheduledAt: '2026-09-09T00:00:00.000Z', status: 'paid', caseId: null }],
  cases: [
    { id: 'case-001', subjectType: 'payout', subjectId: 'payout-001', reporter: 'Hệ thống demo', category: 'Payout', summary: 'Payout có yêu cầu refund đang mở.', evidence: ['Lịch sử refund demo'], severity: 'high', status: 'open', createdAt: '2026-08-26T08:00:00.000Z', timeline: [] },
    { id: 'case-002', subjectType: 'organizer', subjectId: 'org-rhythm', reporter: 'Người tham dự', category: 'Xác minh', summary: 'Cần đối chiếu credential.', evidence: ['Ảnh giấy tờ demo'], severity: 'critical', status: 'open', createdAt: '2026-08-20T08:00:00.000Z', timeline: [] },
    { id: 'case-003', subjectType: 'resale', subjectId: 'resale-001', reporter: 'Người tham dự', category: 'Listing', summary: 'Listing bị báo cáo.', evidence: ['Nội dung báo cáo demo'], severity: 'medium', status: 'investigating', createdAt: '2026-08-24T08:00:00.000Z', timeline: [] },
    { id: 'case-004', subjectType: 'user', subjectId: 'user-nam', reporter: 'Hệ thống demo', category: 'Tài khoản', summary: 'Tài khoản có hoạt động cần xem xét.', evidence: [], severity: 'low', status: 'resolved', createdAt: '2026-08-18T08:00:00.000Z', timeline: [] },
    { id: 'case-005', subjectType: 'event', subjectId: 'event-street', reporter: 'Admin', category: 'Kiểm duyệt', summary: 'Hồ sơ sự kiện bị từ chối.', evidence: ['Chính sách chưa đầy đủ'], severity: 'high', status: 'dismissed', createdAt: '2026-08-16T08:00:00.000Z', timeline: [] },
  ],
  dailyMetrics: Array.from({ length: 30 }, (_, index) => {
    const date = new Date(Date.UTC(2026, 7, 7 + index))
    return { date: date.toISOString().slice(0, 10), primary: 2500000 + index * 100000, resale: 300000 + index * 50000, successfulTransactions: 8 + (index % 5) }
  }),
  auditEntries: [{ id: 'audit-initial', actorLabel: 'Admin demo', action: 'Khởi tạo workspace', targetType: 'category', targetId: 'system', reason: null, occurredAt: '2026-09-01T08:00:00.000Z', metadata: 'Dữ liệu minh họa được nạp.' }],
}

export const ADMIN_RECORD_FIXTURES = rawWorkspace
