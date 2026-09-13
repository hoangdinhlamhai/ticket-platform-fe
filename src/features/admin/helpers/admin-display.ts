export function adminStatusLabel(status: string) {
  return ({ pending_review: 'Chờ duyệt', approved: 'Đã duyệt', changes_requested: 'Cần chỉnh sửa', rejected: 'Đã từ chối', pending: 'Chờ xác minh', verified: 'Đã xác minh', not_submitted: 'Chưa nộp', active: 'Hoạt động', restricted: 'Hạn chế', suspended: 'Tạm ngưng', visible: 'Hiển thị', hidden: 'Đã ẩn', requested: 'Đã yêu cầu', under_review: 'Đang xem xét', on_hold: 'Đang giữ', released: 'Đã phát hành', scheduled: 'Đã lên lịch', completed: 'Hoàn tất', paid: 'Đã thanh toán', failed: 'Thất bại', refunded: 'Đã hoàn tiền', primary: 'Mua lần đầu', resale: 'Resale', valid: 'Hợp lệ', checked_in: 'Đã check-in', void: 'Vô hiệu', open: 'Đang mở', investigating: 'Đang điều tra', waiting_for_information: 'Chờ thông tin', resolved: 'Đã giải quyết', dismissed: 'Đã bác bỏ' } as Record<string, string>)[status] ?? status
}

export function adminStatusTone(status: string): 'neutral' | 'blue' | 'mint' | 'coral' | 'critical' {
  if (['approved', 'verified', 'active', 'visible', 'released', 'completed', 'paid', 'valid', 'checked_in', 'resolved'].includes(status)) return 'mint'
  if (['rejected', 'suspended', 'hidden', 'on_hold', 'critical'].includes(status)) return 'critical'
  if (['changes_requested', 'restricted', 'requested', 'open', 'failed'].includes(status)) return 'coral'
  return 'blue'
}

export function formatAdminMoney(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}
