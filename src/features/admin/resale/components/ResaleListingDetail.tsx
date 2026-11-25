import type { AdminResaleListing } from "../../api/adminApi.ts";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { formatAdminMoney } from "../../helpers/admin-display.ts";
import {
  AdminBackButton,
  AdminPageHeader,
  AdminStatusBadge,
} from "../../components/AdminCommon.tsx";

const statusText: Readonly<Record<string, string>> = {
  ACTIVE: "Đang bán",
  RESERVED: "Đang giữ chỗ",
  SOLD: "Đã bán",
  WITHDRAWN: "Đã rút",
};

export function ResaleListingDetail({
  listing,
  navigate,
}: {
  readonly listing: AdminResaleListing;
  readonly navigate: (path: AdminPath) => void;
}) {
  const tone =
    listing.status === "SOLD"
      ? "mint"
      : listing.status === "ACTIVE"
        ? "blue"
        : "neutral";

  return (
    <section className="grid gap-6">
      <AdminPageHeader eyebrow="VẬN HÀNH · RESALE" title="Chi tiết tin đăng">
        Thông tin listing được tải từ hệ thống. Giá niêm yết chỉ đọc.
      </AdminPageHeader>
      <AdminBackButton onClick={() => navigate("/admin/resale")} />
      <article className="grid gap-6 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-7">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-5">
          <div className="min-w-0">
            <p className="m-0 text-sm font-bold text-ink-soft">Mã tin đăng</p>
            <h2 className="mb-0 mt-1 break-all font-mono text-xl font-extrabold">
              {listing.id}
            </h2>
          </div>
          <AdminStatusBadge
            label={statusText[listing.status] ?? listing.status}
            tone={tone}
          />
        </header>
        <dl className="m-0 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-bold text-ink-soft">Mã vé</dt>
            <dd className="mb-0 mt-1 break-words">
              {listing.ticket.ticketCode}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-ink-soft">Sự kiện</dt>
            <dd className="mb-0 mt-1">{listing.event.title}</dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-ink-soft">Người bán</dt>
            <dd className="mb-0 mt-1">
              {listing.seller.fullName}
              <span className="block text-ink-soft">
                {listing.seller.email}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-ink-soft">Giá niêm yết</dt>
            <dd className="mb-0 mt-1 font-extrabold">
              {formatAdminMoney(listing.price)}{" "}
              <span className="font-normal text-ink-soft">· chỉ đọc</span>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-ink-soft">Trạng thái</dt>
            <dd className="mb-0 mt-1">
              {statusText[listing.status] ?? listing.status}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-bold text-ink-soft">Ngày đăng</dt>
            <dd className="mb-0 mt-1">
              {new Date(listing.createdAt).toLocaleString("vi-VN")}
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
