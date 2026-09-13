import type { ResaleSeller } from '../types/resale'

type ResaleSellerCardProps = {
  seller: ResaleSeller
}

export function ResaleSellerCard({ seller }: ResaleSellerCardProps) {
  const joinedAt = new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(new Date(seller.joinedAt))

  return (
    <section className="mt-8 rounded-lg border border-line/70 bg-surface p-5" aria-labelledby="resale-seller-title">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-blue-deep">NGƯỜI NHƯỜNG LẠI VÉ</p>
          <h2 id="resale-seller-title" className="mt-2 mb-0 text-2xl font-extrabold tracking-[-0.06em]">{seller.name}</h2>
        </div>
        <span className={`rounded-sm border px-3 py-2 text-xs font-extrabold ${seller.verified ? 'border-success/40 bg-mint text-success' : 'border-poster-yellow bg-poster-yellow text-pine'}`}>
          {seller.verified ? 'ĐÃ XÁC MINH' : 'HỒ SƠ MỚI'}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 border-t border-line/70 pt-5 mobile:grid-cols-1">
        <p className="m-0 text-sm text-ink-soft">Tham gia từ <strong className="block pt-1 text-ink">{joinedAt}</strong></p>
        <p className="m-0 text-sm text-ink-soft">Giao dịch mock hoàn tất <strong className="block pt-1 text-ink">{seller.completedSales}</strong></p>
      </div>
    </section>
  )
}
