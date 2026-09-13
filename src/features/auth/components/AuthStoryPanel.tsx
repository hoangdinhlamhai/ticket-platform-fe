import { AuthBrand } from './AuthBrand'

export function AuthStoryPanel() {
  return (
    <aside
      className="relative flex min-h-dvh flex-col overflow-hidden bg-pine p-[clamp(1.5rem,3.5vw,3.75rem)] text-paper before:pointer-events-none before:absolute before:-top-[9rem] before:-right-[8rem] before:h-[19rem] before:w-[19rem] before:rounded-full before:border-[1.5rem] before:border-coral before:content-[''] after:pointer-events-none after:absolute after:right-[8%] after:bottom-[11%] after:h-36 after:w-36 after:bg-mint after:[clip-path:polygon(50%_0,_100%_100%,_0_100%)] after:content-[''] mobile:hidden"
      aria-label="Giới thiệu Ticketly"
    >
      <AuthBrand />
      <div
        className="relative z-[1] mt-[clamp(2.25rem,4vw,3.75rem)] ml-[clamp(1.5rem,7vw,9rem)] aspect-[0.78] w-[clamp(13.25rem,23vw,18.75rem)] -rotate-[7deg] overflow-hidden bg-poster-yellow p-5 text-pine shadow-[0.75rem_0.75rem_0_var(--color-blue)]"
        aria-hidden="true"
      >
        <span className="mb-[1.3rem] block text-[0.61rem] font-extrabold tracking-[0.08em]">
          TICKETLY PRESENTS
        </span>
        <strong className="relative z-[1] font-body text-[clamp(2.45rem,4.2vw,4rem)] leading-[0.77] font-bold tracking-[-0.1em]">
          ĐI<br />XEM<br />THÔI
        </strong>
        <span className="absolute bottom-[1.1rem] left-5 block max-w-36 text-[0.61rem] font-extrabold tracking-[0.08em]">
          MỖI TUẦN · MỘT KỶ NIỆM
        </span>
        <div className="absolute top-[3.25rem] -right-[4.5rem] h-44 w-44 rounded-full border-[1rem] border-coral" />
        <div className="absolute right-5 bottom-[1.1rem] bg-blue p-[0.35rem] text-[1.1rem] font-extrabold text-paper">
          01
        </div>
      </div>
      <div className="relative z-[1] mt-auto mb-6 max-w-[32rem]">
        <p className="m-0 mb-[0.7rem] text-[0.72rem] font-extrabold tracking-[0.11em] text-mint">
          VÉ TRONG TAY, VUI LÊN NGAY
        </p>
        <h2 className="m-0 max-w-[29rem] font-body text-[clamp(2.2rem,3.7vw,4.15rem)] leading-[0.92] font-bold tracking-[-0.075em]">
          Nơi mọi cuộc hẹn đáng nhớ bắt đầu.
        </h2>
        <p className="mt-4 mb-0 max-w-[28rem] text-[0.98rem] leading-[1.7] text-story-copy">
          Khám phá concert, sân khấu và những trải nghiệm đang làm thành phố sôi động hơn mỗi ngày.
        </p>
      </div>
      <p className="relative z-[1] m-0 text-[0.66rem] font-extrabold tracking-[0.1em] text-mint">
        CÙNG TICKETLY TẠO KỶ NIỆM MỚI
      </p>
    </aside>
  )
}
