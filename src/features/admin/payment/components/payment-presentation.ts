export const formatPaymentMoney = (value: unknown) =>
  `${Number(value ?? 0).toLocaleString('vi-VN')} ₫`;

export const formatPaymentDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(value))
    : '—';

export const paymentStatusText: Record<string, string> = {
  PAID: 'Thành công',
  COMPLETED: 'Thành công',
  FAILED: 'Thất bại',
  PAYMENT_FAILED: 'Thất bại',
  PENDING: 'Đang xử lý',
  PENDING_PAYMENT: 'Đang xử lý',
  EXPIRED: 'Hết hạn',
  REFUNDED: 'Đã hoàn tiền',
};

export const paymentStatusTone: Record<string, string> = {
  PAID: 'bg-success/10 text-success',
  COMPLETED: 'bg-success/10 text-success',
  FAILED: 'bg-error/10 text-error',
  PAYMENT_FAILED: 'bg-error/10 text-error',
  PENDING: 'bg-warning/10 text-warning',
  PENDING_PAYMENT: 'bg-warning/10 text-warning',
  EXPIRED: 'bg-surface text-ink-soft',
  REFUNDED: 'bg-info/10 text-info',
};
