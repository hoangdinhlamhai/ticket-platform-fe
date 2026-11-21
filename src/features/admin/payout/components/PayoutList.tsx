import type { AdminPath } from "../../../../routes/admin-route.ts";
import type { AdminPayout } from "../types/admin-payout.ts";

type Props = {
  payouts: readonly AdminPayout[];
  navigate: (path: AdminPath) => void;
};

function formatMoney(amount: string | number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function payoutStatusLabel(status: string) {
  if (status === "PENDING_APPROVAL") return "Chờ duyệt";
  if (status === "PROCESSING") return "Đang xử lý";
  if (status === "APPROVED" || status === "COMPLETED") return "Đã hoàn tất";
  if (status === "REJECTED") return "Đã từ chối";
  if (status === "FAILED") return "Thất bại";
  return status;
}

function payoutStatusClass(status: string) {
  if (status === "PENDING_APPROVAL") {
    return "border-warning/30 bg-warning/10 text-warning";
  }
  if (status === "PROCESSING") {
    return "border-blue-deep/30 bg-google-hover text-blue-deep";
  }
  if (status === "APPROVED" || status === "COMPLETED") {
    return "border-success/30 bg-mint text-success";
  }
  return "border-error/30 bg-error/10 text-error";
}

export function PayoutList({ payouts, navigate }: Props) {
  if (!payouts.length) {
    return (
      <div className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-paper-deep text-xl text-ink-soft">
            ⌕
          </span>
          <h3 className="mb-0 mt-3 text-base font-extrabold text-pine">
            Không tìm thấy payout
          </h3>
          <p className="mb-0 mt-1 text-sm text-ink-soft">
            Thử chọn trạng thái khác.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px] text-left text-sm">
        <thead className="bg-paper/70 text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="px-4 py-3 font-bold">Sự kiện</th>
            <th className="px-4 py-3 font-bold">Organizer</th>
            <th className="px-4 py-3 font-bold">Số tiền</th>
            <th className="px-4 py-3 font-bold">Trạng thái</th>
            <th className="px-4 py-3 font-bold">Ngày tạo</th>
            <th className="px-4 py-3 font-bold">
              <span className="sr-only">Chi tiết</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr
              className="border-t border-line transition-colors hover:bg-paper/40"
              key={payout.id}
            >
              <td className="px-4 py-4 font-bold text-ink">
                {payout.event.title}
              </td>
              <td className="px-4 py-4">
                <span className="block font-bold text-ink">
                  {payout.organizer.fullName}
                </span>
                <span className="text-xs text-ink-soft">
                  {payout.organizer.email}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 font-extrabold text-ink">
                {formatMoney(payout.amount, payout.currency)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-extrabold ${payoutStatusClass(payout.status)}`}
                >
                  {payoutStatusLabel(payout.status)}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-ink-soft">
                {formatDate(payout.createdAt)}
              </td>
              <td className="px-4 py-4 text-right">
                <button
                  className="min-h-10 whitespace-nowrap rounded-lg border border-blue-deep/30 px-3 font-bold text-blue-deep transition hover:bg-google-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
                  type="button"
                  onClick={() =>
                    navigate(`/admin/payouts/${encodeURIComponent(payout.id)}`)
                  }
                >
                  Xem chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
