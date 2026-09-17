import type { AuthMode } from './types/authForm'

type AuthCopy = {
  eyebrow: string
  title: string
  description: string
  submitLabel: string
}

export const AUTH_COPY: Record<AuthMode, AuthCopy> = {
  login: {
    eyebrow: 'RẤT VUI ĐƯỢC GẶP LẠI',
    title: 'Chào mừng bạn trở lại',
    description:
      'Đăng nhập để quản lý phiên Ticketly của bạn. Vé, đơn hàng và hoạt động prototype vẫn là dữ liệu minh họa riêng.',
    submitLabel: 'Đăng nhập',
  },
  register: {
    eyebrow: 'THAM GIA CỘNG ĐỒNG',
    title: 'Bắt đầu hành trình',
    description:
      'Tạo tài khoản Ticketly để xác thực phiên đăng nhập. Dữ liệu vé, đơn hàng và hồ sơ demo chưa được đồng bộ với tài khoản.',
    submitLabel: 'Tạo tài khoản',
  },
}
