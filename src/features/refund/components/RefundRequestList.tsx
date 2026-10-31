import { useState } from "react";
import type { RefundRequest } from "../types/refund";
import { RefundRequestCard } from "./RefundRequestCard";

type Filter = "ALL" | "ACTIVE" | "SUCCEEDED" | "ATTENTION";

type Props = {
  requests: readonly RefundRequest[];
};

const filters: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Tất cả" },
  { id: "ACTIVE", label: "Đang xử lý" },
  { id: "SUCCEEDED", label: "Đã hoàn" },
  { id: "ATTENTION", label: "Cần xem lại" },
];

function matchesFilter(request: RefundRequest, filter: Filter) {
  if (filter === "ACTIVE") {
    return request.status === "PENDING" || request.status === "PROCESSING";
  }
  if (filter === "SUCCEEDED") return request.status === "SUCCEEDED";
  if (filter === "ATTENTION") {
    return request.status === "FAILED" || request.status === "REJECTED";
  }
  return true;
}

export function RefundRequestList({ requests }: Props) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const visibleRequests = requests.filter((request) =>
    matchesFilter(request, filter),
  );

  return (
    <section aria-labelledby="refund-history-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
            THEO DÕI
          </p>
          <h2
            id="refund-history-title"
            className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em] text-pine sm:text-4xl"
          >
            Yêu cầu của bạn
          </h2>
        </div>
        <p className="m-0 text-sm text-ink-soft" aria-live="polite">
          {visibleRequests.length} yêu cầu
        </p>
      </div>

      <div
        className="mt-5 flex flex-wrap gap-2"
        role="group"
        aria-label="Lọc yêu cầu hoàn tiền"
      >
        {filters.map((item) => (
          <button
            key={item.id}
            className={`min-h-11 rounded-md border px-4 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep ${filter === item.id ? "border-pine bg-pine text-paper" : "border-line bg-surface text-ink hover:border-pine/60"}`}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4" aria-live="polite">
        {visibleRequests.length ? (
          visibleRequests.map((request) => (
            <RefundRequestCard key={request.id} request={request} />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-12 text-center">
            <h3 className="m-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-pine">
              {requests.length
                ? "Không có yêu cầu trong mục này."
                : "Bạn chưa gửi yêu cầu hoàn tiền nào."}
            </h3>
            <p className="mt-2 mb-0 text-sm leading-6 text-ink-soft">
              {requests.length
                ? "Chọn bộ lọc khác để xem các yêu cầu còn lại."
                : "Khi cần hỗ trợ một đơn hàng đã thanh toán, yêu cầu sẽ xuất hiện tại đây."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
