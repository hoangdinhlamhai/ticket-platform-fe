import { SearchIcon, TicketIcon } from '../../../components/icons/TicketlyIcons'

export function ResaleMarketplaceHero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-pine py-[clamp(4rem,9vw,8rem)] text-paper">
      <div className="absolute -top-24 right-[7%] h-64 w-64 rounded-full border-[2rem] border-coral" aria-hidden="true" />
      <div className="absolute -bottom-20 left-[43%] h-44 w-44 rotate-12 bg-poster-yellow" aria-hidden="true" />
      <div className="relative attendee-container grid grid-cols-[minmax(0,1.25fr)_minmax(17rem,0.75fr)] items-end gap-10 max-[1100px]:block">
        <div>
          <p className="m-0 flex items-center gap-2 text-xs font-extrabold tracking-[0.12em] text-poster-yellow">
            <TicketIcon className="h-5 w-5" /> CHỢ VÉ GIỮA CỘNG ĐỒNG
          </p>
          <h1 className="mt-5 mb-0 max-w-[54rem] font-body text-[clamp(3.4rem,7vw,7.4rem)] leading-[0.78] font-extrabold tracking-[-0.105em]">
            Chỗ ngồi hay vẫn còn người chờ.
          </h1>
        </div>
        <div className="relative max-[1100px]:mt-10">
          <SearchIcon className="h-10 w-10 text-mint" />
          <p className="mt-5 mb-0 max-w-[29rem] text-base leading-[1.7] text-story-copy">
            Tìm listing từ người bán trong cộng đồng, xem rõ ghế và giá trọn gói trước khi bước vào luồng thanh toán minh họa.
          </p>
          <p className="mt-5 mb-0 inline-flex rounded-sm border border-mint/50 bg-mint px-3 py-2 text-xs font-extrabold tracking-[0.07em] text-pine">
            MOCK ONLY · KHÔNG GIAO DỊCH THẬT
          </p>
        </div>
      </div>
    </section>
  )
}
