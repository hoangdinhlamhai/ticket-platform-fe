import type { OrderFilters } from "../types/order";

type Props = {
  filters: OrderFilters;
  onChange: (filters: OrderFilters) => void;
};

export function OrderHistoryFilters({ filters, onChange }: Props) {
  return (
    <label className="block max-w-sm text-sm font-bold">
      Trạng thái đơn hàng
      <select
        className="mt-2 min-h-11 w-full rounded-md border border-line bg-paper px-3"
        value={filters.status}
        onChange={(event) =>
          onChange({
            status: event.target.value as OrderFilters["status"],
          })
        }
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="PENDING_PAYMENT">Chờ thanh toán</option>
        <option value="PAID">Đã thanh toán</option>
        <option value="FAILED">Thanh toán thất bại</option>
        <option value="EXPIRED">Đã hết hạn</option>
      </select>
    </label>
  );
}
