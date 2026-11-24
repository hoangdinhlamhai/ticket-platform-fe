import type { ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { OrganizerStatusBadge } from "./OrganizerStatusBadge.tsx";
export type TimelinePoint = {
  readonly date: string;
  readonly revenue: number;
  readonly tickets: number;
};
export type Metric = "revenue" | "tickets";
const currency = (amount: number | string) =>
  `${Number(amount).toLocaleString("vi-VN")} ₫`;
const formatShortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
const compactMoney = (value: number) => {
  if (value === 0) return "0";
  const formatted = (amount: number) =>
    amount.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (value < 1_000) return Math.round(value).toLocaleString("vi-VN");
  if (value < 1_000_000) return `${formatted(value / 1_000)} N`;
  if (value < 1_000_000_000) return `${formatted(value / 1_000_000)} Tr`;
  return `${formatted(value / 1_000_000_000)} Tỷ`;
};

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  readonly title: string;
  readonly subtitle?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="m-0 text-base font-extrabold text-pine">{title}</h2>
          {subtitle && (
            <p className="mb-0 mt-1 text-xs text-ink-soft">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function RetryState({
  message,
  retry,
}: {
  readonly message: string;
  readonly retry: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
      role="alert"
    >
      <p className="m-0">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-2 min-h-10 rounded-md border border-error/30 px-3 font-bold"
      >
        Thử tải lại
      </button>
    </div>
  );
}

export function EventStatus({ status }: { readonly status: string }) {
  const map: Record<
    string,
    { label: string; tone: "blue" | "coral" | "mint" | "neutral" }
  > = {
    approved: { label: "Đã duyệt", tone: "mint" },
    published: { label: "Đã xuất bản", tone: "mint" },
    pending_review: { label: "Chờ duyệt", tone: "blue" },
    rejected: { label: "Bị từ chối", tone: "coral" },
    draft: { label: "Bản nháp", tone: "neutral" },
  };
  const value = map[status] ?? { label: status, tone: "neutral" as const };
  return <OrganizerStatusBadge label={value.label} tone={value.tone} />;
}

export function EmptyState({
  title,
  detail,
  action,
}: {
  readonly title: string;
  readonly detail: string;
  readonly action?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-dashed border-line p-6 text-center">
      <CalendarDays
        className="mx-auto size-8 text-ink-soft"
        aria-hidden="true"
      />
      <p className="mb-0 mt-3 font-bold">{title}</p>
      <p className="mb-0 mt-1 text-sm text-ink-soft">{detail}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ActivityChart({
  rows,
  metric,
  onMetricChange,
  range,
  onRangeChange,
}: {
  readonly rows: readonly TimelinePoint[];
  readonly metric: Metric;
  readonly onMetricChange: (metric: Metric) => void;
  readonly range: number;
  readonly onRangeChange: (range: number) => void;
}) {
  const selected = rows.map((row) =>
    metric === "revenue" ? row.revenue : row.tickets,
  );
  const maxValue = Math.max(1, ...selected);
  const plot = { left: 72, right: 980, top: 24, bottom: 225 };
  const xFor = (index: number) =>
    rows.length < 2
      ? (plot.left + plot.right) / 2
      : plot.left + (index / (rows.length - 1)) * (plot.right - plot.left);
  const yFor = (value: number) =>
    plot.bottom - (value / maxValue) * (plot.bottom - plot.top);
  const yTicks = [
    ...new Set(
      Array.from({ length: 5 }, (_, index) =>
        metric === "revenue"
          ? (maxValue * index) / 4
          : Math.round((maxValue * index) / 4),
      ),
    ),
  ];
  const xTicks = [
    ...new Set(
      Array.from({ length: 5 }, (_, index) =>
        Math.round((index * (rows.length - 1)) / 4),
      ),
    ),
  ];
  const tooltip = (row: TimelinePoint) =>
    metric === "revenue"
      ? currency(row.revenue)
      : `${row.tickets.toLocaleString("vi-VN")} vé`;
  if (!rows.some((row) => row.revenue > 0 || row.tickets > 0))
    return (
      <EmptyState
        title="Chưa có dữ liệu bán vé"
        detail="Biểu đồ sẽ cập nhật khi có đơn hàng đã thanh toán."
      />
    );
  return (
    <div
      key={`${metric}-${range}`}
      className="animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2" aria-label="Chọn chỉ số biểu đồ">
          {(["revenue", "tickets"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={metric === item}
              onClick={() => onMetricChange(item)}
              className={`min-h-10 rounded-lg px-3 text-sm font-bold transition ${metric === item ? "bg-pine text-paper" : "border border-line text-ink-soft hover:bg-paper-deep"}`}
            >
              {item === "revenue" ? "Doanh thu" : "Vé bán"}
            </button>
          ))}
        </div>
        <select
          aria-label="Khoảng thời gian biểu đồ"
          value={range}
          onChange={(event) => onRangeChange(Number(event.target.value))}
          className="min-h-10 rounded-lg border border-line bg-paper px-3 text-sm"
        >
          <option value={7}>7 ngày</option>
          <option value={30}>30 ngày</option>
          <option value={90}>90 ngày</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <p className="m-0 rounded-lg bg-paper-deep p-3 text-xs text-ink-soft">
          {metric === "revenue" ? "Doanh thu" : "Vé bán"} · {range} ngày
          <strong className="mt-1 block text-lg text-pine">
            {metric === "revenue"
              ? currency(rows.reduce((sum, row) => sum + row.revenue, 0))
              : `${rows.reduce((sum, row) => sum + row.tickets, 0).toLocaleString("vi-VN")} vé`}
          </strong>
        </p>
        <p className="m-0 rounded-lg bg-paper-deep p-3 text-xs text-ink-soft">
          Ngày có giao dịch
          <strong className="mt-1 block text-lg text-pine">
            {rows.filter((row) => row.revenue > 0 || row.tickets > 0).length}
          </strong>
        </p>
      </div>
      <svg
        className="mt-5 h-64 w-full"
        viewBox="0 0 1000 270"
        role="group"
        aria-label={`Biểu đồ ${metric === "revenue" ? "doanh thu VND" : "số vé bán"} theo ngày`}
        preserveAspectRatio="none"
      >
        {yTicks.map((value) => {
          const y = yFor(value);
          return (
            <g key={value}>
              <line
                x1={plot.left}
                y1={y}
                x2={plot.right}
                y2={y}
                stroke="currentColor"
                opacity={value === 0 ? 0.3 : 0.12}
              />
              <text
                x={plot.left - 10}
                y={y + 4}
                fill="currentColor"
                fontSize="12"
                textAnchor="end"
              >
                {metric === "revenue"
                  ? compactMoney(value)
                  : Math.round(value).toLocaleString("vi-VN")}
              </text>
            </g>
          );
        })}
        <polyline
          points={selected
            .map(
              (value, index) =>
                `${xFor(index).toFixed(1)},${yFor(value).toFixed(1)}`,
            )
            .join(" ")}
          fill="none"
          stroke="var(--color-blue)"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {rows.map((row, index) => {
          const value = selected[index] ?? 0;
          if (value === 0) return null;
          return (
            <circle
              key={row.date}
              cx={xFor(index)}
              cy={yFor(value)}
              r="5"
              fill="var(--color-blue)"
              stroke="var(--color-paper)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              tabIndex={0}
              aria-label={`${row.date}: ${tooltip(row)}`}
            >
              <title>{`${row.date}: ${tooltip(row)}`}</title>
            </circle>
          );
        })}
        {xTicks.map((index) => (
          <g key={index}>
            <line
              x1={xFor(index)}
              y1={plot.bottom}
              x2={xFor(index)}
              y2={plot.bottom + 5}
              stroke="currentColor"
              opacity=".35"
            />
            <text
              x={xFor(index)}
              y={plot.bottom + 23}
              fill="currentColor"
              fontSize="12"
              textAnchor={
                index === 0
                  ? "start"
                  : index === rows.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {formatShortDate(rows[index]?.date ?? "")}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
