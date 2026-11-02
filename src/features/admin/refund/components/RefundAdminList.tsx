import type { AdminRefund } from "../types/admin-refund.ts";
import { RefundAdminCard } from "./RefundAdminCard.tsx";

type Props = {
  refunds: readonly AdminRefund[];
  onOpen: (id: string) => void;
};

export function RefundAdminList({ refunds, onOpen }: Props) {
  if (!refunds.length) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
        <h2 className="m-0 font-body text-2xl font-extrabold text-pine">
          Không có yêu cầu refund phù hợp.
        </h2>
        <p className="mt-2 mb-0 text-sm text-ink-soft">
          Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4" aria-label="Danh sách yêu cầu refund">
      {refunds.map((refund) => (
        <RefundAdminCard key={refund.id} refund={refund} onOpen={onOpen} />
      ))}
    </div>
  );
}
