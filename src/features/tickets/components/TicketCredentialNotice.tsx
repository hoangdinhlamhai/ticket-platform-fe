import { TicketIcon } from '../../../components/icons/TicketlyIcons'

export function TicketCredentialNotice() {
  return (
    <aside className="mt-10 rounded-lg bg-blue p-6 text-paper" aria-label="Giải thích credential trong prototype">
      <TicketIcon className="h-10 w-10 text-poster-yellow" />
      <p className="mt-6 mb-0 text-xs font-extrabold tracking-[0.1em] text-mint">CREDENTIAL / LUỒNG TƯƠNG LAI</p>
      <h2 className="mt-3 mb-0 font-body text-[clamp(2.1rem,4vw,3.2rem)] leading-[0.9] font-extrabold tracking-[-0.07em]">QR đang được ẩn có chủ đích.</h2>
      <p className="mt-5 mb-0 max-w-2xl text-sm leading-[1.7] text-story-copy">Prototype không tạo QR, không thực hiện check-in và không xác minh quyền vào cửa. Credential thật chỉ được phát hành và kiểm tra bởi backend an toàn.</p>
    </aside>
  )
}
