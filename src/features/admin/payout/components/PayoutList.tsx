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
  return status === "PENDING_APPROVAL" ? "Chờ duyệt" : status;
}

export function PayoutList({ payouts, navigate }: Props) {
  if (!payouts.length) {
    return (
      <p className="rounded-lg border border-line bg-surface p-6 text-center text-ink-soft">
        Hiện không có payout nào đang chờ duyệt.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-paper-deep text-ink-soft">
          <tr>
            <th className="p-4 font-bold">Sự kiện</th>
            <th className="p-4 font-bold">Organizer</th>
            <th className="p-4 font-bold">Số tiền</th>
            <th className="p-4 font-bold">Trạng thái</th>
            <th className="p-4 font-bold">Ngày tạo</th>
            <th className="p-4 font-bold">
              <span className="sr-only">Chi tiết</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr className="border-t border-line" key={payout.id}>
              <td className="p-4 font-bold">{payout.event.title}</td>
              <td className="p-4">
                <span className="block font-bold">
                  {payout.organizer.fullName}
                </span>
                <span className="text-xs text-ink-soft">
                  {payout.organizer.email}
                </span>
              </td>
              <td className="p-4 font-extrabold">
                {formatMoney(payout.amount, payout.currency)}
              </td>
              <td className="p-4">
                <span className="rounded-full border border-blue/40 bg-google-hover px-3 py-1 text-xs font-extrabold text-blue-deep">
                  {payoutStatusLabel(payout.status)}
                </span>
              </td>
              <td className="p-4 text-ink-soft">
                {formatDate(payout.createdAt)}
              </td>
              <td className="p-4 text-right">
                <button
                  className="min-h-10 rounded border border-blue-deep/40 px-3 font-bold text-blue-deep hover:bg-google-hover"
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
