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
      'Bản xem trước giao diện đăng nhập Ticketly. Tính năng theo dõi vé và đơn hàng sẽ được kết nối ở bước tiếp theo.',
    submitLabel: 'Đăng nhập',
  },
  register: {
    eyebrow: 'THAM GIA CỘNG ĐỒNG',
    title: 'Bắt đầu hành trình',
    description:
      'Bản xem trước giao diện tạo tài khoản Ticketly. Thông tin bạn nhập chưa được gửi hoặc lưu lại.',
    submitLabel: 'Tạo tài khoản',
  },
}
