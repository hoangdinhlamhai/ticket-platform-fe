import { refundStatusPresentation } from "../helpers/refund-status.ts";
import type { AdminRefund } from "../types/admin-refund.ts";

type Props = {
  refunds: readonly AdminRefund[];
  onOpen: (id: string) => void;
};

const formatMoney = (amount: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export function RefundAdminList({ refunds, onOpen }: Props) {
  if (!refunds.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
        <h2 className="m-0 font-body text-2xl font-extrabold text-pine">
          Không có yêu cầu refund phù hợp.
        </h2>
        <p className="mb-0 mt-2 text-sm text-ink-soft">
          Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="border-b border-line text-ink-soft">
          <tr>
            {[
              "Mã Refund",
              "Đơn / Giao dịch",
              "Khách hàng",
              "Sự kiện",
              "Số tiền",
              "Trạng thái",
              "Thời gian gửi",
              "Thao tác",
            ].map((label) => (
              <th key={label} className="px-4 py-3 font-semibold">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {refunds.map((refund) => {
            const status = refundStatusPresentation[refund.status];
            const resale = refund.targetType === "RESALE";
            const subjectId = refund.orderId ?? refund.resaleTransaction?.id;
            const customer = resale
              ? refund.resaleTransaction?.buyer
              : refund.order?.user;
            const customerName = customer
              ? "fullName" in customer
                ? customer.fullName
                : customer.hoTen
              : "—";
            const eventTitle =
              refund.order?.event.title ??
              refund.resaleTransaction?.event.tieuDe ??
              "—";

            return (
              <tr
                key={refund.id}
                className="border-b border-line last:border-0"
              >
                <td
                  className="max-w-48 truncate px-4 py-4 font-mono text-xs font-bold"
                  title={refund.id}
                >
                  {refund.id}
                </td>
                <td className="px-4 py-4">
                  <span className="block text-xs font-bold text-ink-soft">
                    {resale ? "Resale" : "Order"}
                  </span>
                  <span
                    className="block max-w-48 truncate font-mono text-xs"
                    title={subjectId ?? ""}
                  >
                    {subjectId ?? "—"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="block font-bold">{customerName}</span>
                  <span className="block max-w-48 truncate text-xs text-ink-soft">
                    {customer?.email ?? "—"}
                  </span>
                </td>
                <td className="max-w-48 truncate px-4 py-4" title={eventTitle}>
                  {eventTitle}
                </td>
                <td className="whitespace-nowrap px-4 py-4 font-bold">
                  {formatMoney(refund.amount)}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex min-h-8 items-center rounded-full border px-2.5 text-xs font-bold ${status.className}`}
                  >
                    {status.label}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-xs text-ink-soft">
                  {formatDate(refund.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <button
                    className="min-h-10 whitespace-nowrap font-bold text-blue-deep underline underline-offset-4"
                    type="button"
                    onClick={() => onOpen(refund.id)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
