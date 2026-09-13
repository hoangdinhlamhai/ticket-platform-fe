import { MOCK_EVENTS } from './eventData.ts'
import type { MockEvent, MockEventDetail } from '../types/event.ts'

type DetailFields = Omit<MockEventDetail, keyof MockEvent>

const DETAIL_BY_ID: Record<string, DetailFields> = {
  'vong-khuc-thanh-pho': {
    address: '7 Công trường Lam Sơn, Quận 1, TP. Hồ Chí Minh',
    description: 'Một đêm hòa nhạc kể lại nhịp sống Sài Gòn qua giao hưởng, giọng hát và những lát cắt âm thanh đương đại.',
    organizer: 'Saigon Chamber Collective',
    doorsOpen: '18:45',
    duration: '120 phút',
    schedule: [
      { time: '18:45', title: 'Mở cửa', description: 'Kiểm tra vé minh họa và hướng dẫn vào khán phòng.' },
      { time: '19:30', title: 'Chương trình bắt đầu', description: 'Hai chương biểu diễn, có giải lao 15 phút.' },
    ],
    notices: ['Trang phục lịch sự, không sử dụng đèn flash.', 'Khán phòng hạn chế nhận khách sau khi chương trình bắt đầu.'],
    ticketTiers: [
      { id: 'balcony', name: 'Balcony', price: 390000, availabilityLabel: 'Lựa chọn minh họa', note: 'Tầm nhìn toàn sân khấu, không chọn ghế thật.' },
      { id: 'standard', name: 'Standard', price: 590000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu vực tầng trệt, chưa giữ chỗ.' },
    ],
  },
  'midnight-market-live-set': {
    address: 'Đỗ Xuân Hợp, An Phú, TP. Thủ Đức',
    description: 'Không gian chợ đêm kết hợp live set, nghệ thuật thị giác và những gian hàng sáng tạo dành cho một tối cuối tuần nhiều năng lượng.',
    organizer: 'Midnight Market Saigon',
    doorsOpen: '18:30',
    duration: '210 phút',
    schedule: [
      { time: '18:30', title: 'Mở khu trải nghiệm', description: 'Các gian hàng và khu ẩm thực bắt đầu hoạt động.' },
      { time: '20:00', title: 'Live set chính', description: 'Hai nghệ sĩ biểu diễn nối tiếp trên sân khấu trung tâm.' },
    ],
    notices: ['Sự kiện ngoài trời, nên chuẩn bị áo khoác nhẹ.', 'Không mang đồ uống từ bên ngoài vào khu biểu diễn.'],
    ticketTiers: [
      { id: 'standing', name: 'Standing', price: 520000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu đứng chung, chưa tạo quyền vào cửa.' },
      { id: 'fast-lane', name: 'Fast Lane', price: 720000, availabilityLabel: 'Lựa chọn minh họa', note: 'Làn vào riêng chỉ dùng để mô phỏng UI.' },
    ],
  },
  'nguoi-hoa-si-va-thanh-pho': {
    address: '31 Thái Văn Lung, Quận 1, TP. Hồ Chí Minh',
    description: 'Vở kịch về một họa sĩ trẻ đi tìm ngôn ngữ của riêng mình giữa ký ức gia đình và nhịp đổi thay của thành phố.',
    organizer: 'Sân khấu IDECAF',
    doorsOpen: '18:20',
    duration: '105 phút',
    schedule: [
      { time: '18:20', title: 'Đón khách', description: 'Mở cửa sảnh và hướng dẫn khu vực ghế.' },
      { time: '19:00', title: 'Vở diễn bắt đầu', description: 'Biểu diễn liền mạch, không có giải lao.' },
    ],
    notices: ['Không phù hợp với trẻ dưới 12 tuổi.', 'Vui lòng chuyển thiết bị di động sang chế độ im lặng.'],
    ticketTiers: [
      { id: 'section-b', name: 'Hạng B', price: 280000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu ghế phía sau, chưa chọn số ghế.' },
      { id: 'section-a', name: 'Hạng A', price: 420000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu ghế trung tâm, chưa giữ chỗ.' },
    ],
  },
  'saigon-night-run': {
    address: 'Đường N12, Khu đô thị Thủ Thiêm, TP. Thủ Đức',
    description: 'Cung đường chạy đêm 10K dọc bờ sông, kết hợp trạm âm nhạc và khu phục hồi dành cho cộng đồng yêu vận động.',
    organizer: 'Saigon Runners Hub',
    doorsOpen: '16:30',
    duration: '180 phút',
    schedule: [
      { time: '16:30', title: 'Nhận race kit minh họa', description: 'Mở khu gửi đồ và khởi động tập thể.' },
      { time: '18:00', title: 'Xuất phát 10K', description: 'Xuất phát theo nhóm pace tại cổng chính.' },
    ],
    notices: ['Người tham gia tự đánh giá tình trạng sức khỏe.', 'Bib và race kit thật chưa được phát hành trong prototype.'],
    ticketTiers: [
      { id: 'basic-10k', name: '10K Cơ bản', price: 450000, availabilityLabel: 'Lựa chọn minh họa', note: 'Gói chạy và race kit tiêu chuẩn mô phỏng.' },
      { id: 'plus-10k', name: '10K Plus', price: 620000, availabilityLabel: 'Lựa chọn minh họa', note: 'Thêm áo phiên bản mock, chưa phát hành vật phẩm.' },
    ],
  },
  'cham-vao-dat': {
    address: '18 Nguyễn Bá Huân, Thảo Điền, TP. Thủ Đức',
    description: 'Workshop làm gốm chậm rãi cho người mới, từ làm quen với đất đến tạo hình một món đồ nhỏ mang dấu ấn cá nhân.',
    organizer: 'Mây Ceramic Studio',
    doorsOpen: '08:40',
    duration: '150 phút',
    schedule: [
      { time: '08:40', title: 'Đón khách', description: 'Nhận tạp dề và làm quen với bàn dụng cụ.' },
      { time: '09:00', title: 'Bắt đầu workshop', description: 'Hướng dẫn tạo hình, trang trí và hoàn thiện sản phẩm.' },
    ],
    notices: ['Nên mặc trang phục dễ vận động và có thể dính màu.', 'Sản phẩm thật cần thời gian nung; prototype không xử lý giao nhận.'],
    ticketTiers: [
      { id: 'single', name: 'Một người', price: 650000, availabilityLabel: 'Lựa chọn minh họa', note: 'Một bộ nguyên liệu và dụng cụ mô phỏng.' },
      { id: 'pair', name: 'Nhóm hai người', price: 1200000, availabilityLabel: 'Lựa chọn minh họa', note: 'Hai bộ nguyên liệu, chưa giữ chỗ workshop.' },
    ],
  },
  'lofi-in-the-park': {
    address: 'Hoàng Minh Giám, Phường 3, Quận Gò Vấp',
    description: 'Buổi chiều nghe lofi giữa công viên với acoustic set, góc đọc sách và không gian picnic dành cho những cuộc hẹn nhẹ nhàng.',
    organizer: 'Lofi Saigon Sessions',
    doorsOpen: '15:30',
    duration: '180 phút',
    schedule: [
      { time: '15:30', title: 'Mở khu picnic', description: 'Đón khách và phát bản đồ khu trải nghiệm minh họa.' },
      { time: '16:30', title: 'Acoustic & lofi set', description: 'Biểu diễn liên tục đến khi hoàng hôn.' },
    ],
    notices: ['Có thể mang thảm picnic nhỏ, không mang ghế cồng kềnh.', 'Chương trình ngoài trời có thể thay đổi theo thời tiết.'],
    ticketTiers: [
      { id: 'picnic', name: 'Picnic', price: 180000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu ngồi tự do, chưa phát hành quyền vào cửa.' },
      { id: 'front-lawn', name: 'Front Lawn', price: 320000, availabilityLabel: 'Lựa chọn minh họa', note: 'Khu gần sân khấu, chưa giữ vị trí.' },
    ],
  },
}

export const MOCK_EVENT_DETAILS: readonly MockEventDetail[] = MOCK_EVENTS.map((event) => ({
  ...event,
  ...DETAIL_BY_ID[event.id],
}))
