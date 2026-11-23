import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarDays, ShoppingCart, UsersRound } from "lucide-react";
import * as adminApi from "../../api/adminApi.ts";
import * as userApi from "../../user/api/adminUserApi.ts";
import * as orderApi from "../../order/api/adminOrderApi.ts";
import * as payoutApi from "../../payout/api/adminPayoutApi.ts";
import * as refundApi from "../../refund/api/refundAdminApi.ts";
import { AdminStatusBadge } from "../../components/AdminCommon.tsx";

type Metrics = {
  userCount: number;
  organizerCount: number;
  eventCount: number;
  pendingReviewCount: number;
  paidOrderCount: number;
  grossRevenue: number | string;
  soldTicketCount: number;
  refundPendingCount: number;
  resaleActiveCount: number;
};
type TimelineRow = {
  date: string;
  revenue: number;
  orders: number;
  tickets: number;
};
type UserRow = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
};
type OrderRow = {
  id: string;
  total: number | string;
  status: string;
  createdAt: string;
  user: { fullName: string; email: string };
};
type SectionState<T> = { data: T | null; error: string; loading: boolean };
const empty = <T,>(): SectionState<T> => ({
  data: null,
  error: "",
  loading: true,
});
const money = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")} ₫`;
const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
const axisMoney = (value: number) => {
  if (value === 0) return "0";
  const formatAmount = (amount: number) =>
    amount.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (value < 1_000) return Math.round(value).toLocaleString("vi-VN");
  if (value < 1_000_000) return `${formatAmount(value / 1_000)} N`;
  if (value < 1_000_000_000) return `${formatAmount(value / 1_000_000)} Tr`;
  return `${formatAmount(value / 1_000_000_000)} Tỷ`;
};
const dateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
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

function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-lg border border-line p-3"
        >
          <span className="size-10 shrink-0 animate-pulse rounded-lg bg-paper-deep" />
          <span className="grid flex-1 gap-2">
            <span className="h-3 w-2/5 animate-pulse rounded bg-paper-deep" />
            <span className="h-3 w-3/5 animate-pulse rounded bg-paper-deep" />
          </span>
          <span className="h-5 w-16 animate-pulse rounded bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}

function ErrorBox({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
    >
      <p className="m-0">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-2 min-h-9 rounded border border-error/30 px-3 font-bold"
      >
        Thử tải lại
      </button>
    </div>
  );
}

function Section<T>({
  state,
  retry,
  children,
}: {
  state: SectionState<T>;
  retry: () => void;
  children: (data: T) => React.ReactNode;
}) {
  if (state.loading) return <LoadingRows />;
  if (state.error) return <ErrorBox message={state.error} retry={retry} />;
  return state.data ? (
    children(state.data)
  ) : (
    <p className="rounded-lg border border-dashed border-line p-5 text-sm text-ink-soft">
      Chưa có dữ liệu.
    </p>
  );
}

export function AdminDashboardPage({
  navigate,
}: {
  readonly navigate: (path: string) => void;
}) {
  const [metrics, setMetrics] = useState(empty<Metrics>());
  const [timeline, setTimeline] = useState(empty<readonly TimelineRow[]>());
  const [users, setUsers] = useState(empty<readonly UserRow[]>());
  const [orders, setOrders] = useState(empty<readonly OrderRow[]>());
  const [payoutCount, setPayoutCount] = useState(empty<number>());
  const [refundCount, setRefundCount] = useState(empty<number>());
  const [range, setRange] = useState(30);
  const [retryKey, setRetryKey] = useState(0);
  const retry = () => setRetryKey((key) => key + 1);

  useEffect(() => {
    let active = true;
    const load = async <T,>(
      request: Promise<{ data: T }>,
      setter: (state: SectionState<T>) => void,
    ) => {
      setter({ data: null, error: "", loading: true });
      try {
        const result = await request;
        if (active) setter({ data: result.data, error: "", loading: false });
      } catch (cause) {
        if (active)
          setter({
            data: null,
            error:
              cause instanceof Error ? cause.message : "Không thể tải dữ liệu.",
            loading: false,
          });
      }
    };
    void load(
      adminApi
        .findMetrics()
        .then(({ data }) => ({ data: data.metrics as Metrics })),
      setMetrics,
    );
    void load(
      adminApi.findTimeline().then(({ data }) => ({ data: data.series })),
      setTimeline,
    );
    void load(
      userApi
        .findUsers({ page: 1, pageSize: 5 })
        .then(({ data }) => ({ data: data.users })),
      setUsers,
    );
    void load(
      orderApi
        .findOrders({ page: 1, pageSize: 6 })
        .then(({ data }) => ({ data: data.orders as readonly OrderRow[] })),
      setOrders,
    );
    void load(
      payoutApi
        .findPending("PENDING_APPROVAL", 1)
        .then(({ data }) => ({ data: data.total })),
      setPayoutCount,
    );
    void load(
      refundApi
        .findRefunds({ status: "PENDING", page: 1, pageSize: 1 })
        .then(({ data }) => ({ data: data.total })),
      setRefundCount,
    );
    return () => {
      active = false;
    };
  }, [retryKey]);

  const chartRows = useMemo(() => {
    if (!timeline.data) return [];
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - range + 1);
    const startKey = dateKey(start);
    const recentRows = timeline.data.filter((row) => row.date >= startKey);
    if (!recentRows.length) return [];
    const rowsByDate = new Map(recentRows.map((row) => [row.date, row]));
    return Array.from({ length: range }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = dateKey(date);
      return (
        rowsByDate.get(key) ?? { date: key, revenue: 0, orders: 0, tickets: 0 }
      );
    });
  }, [timeline.data, range]);
  const maxRevenue = Math.max(1, ...chartRows.map((row) => row.revenue));
  const plot = { left: 65, right: 980, top: 28, bottom: 238 };
  const xFor = (index: number) =>
    chartRows.length < 2
      ? (plot.left + plot.right) / 2
      : plot.left + (index / (chartRows.length - 1)) * (plot.right - plot.left);
  const yFor = (value: number) =>
    plot.bottom - (value / maxRevenue) * (plot.bottom - plot.top);
  const xTickIndexes = [
    ...new Set(
      Array.from({ length: 5 }, (_, index) =>
        Math.round((index * (chartRows.length - 1)) / 4),
      ),
    ),
  ];
  const yTickValues = Array.from(
    { length: 5 },
    (_, index) => (maxRevenue * index) / 4,
  );
  const cards = [
    {
      label: "Tổng người dùng",
      value: metrics.data?.userCount,
      detail: `${metrics.data?.organizerCount.toLocaleString("vi-VN") ?? "—"} organizer`,
      target: "/admin/users",
      icon: UsersRound,
    },
    {
      label: "Tổng sự kiện",
      value: metrics.data?.eventCount,
      detail: `${metrics.data?.pendingReviewCount.toLocaleString("vi-VN") ?? "—"} chờ duyệt`,
      target: "/admin/events",
      icon: CalendarDays,
    },
    {
      label: "Đơn đã thanh toán",
      value: metrics.data?.paidOrderCount,
      detail: `${metrics.data?.soldTicketCount.toLocaleString("vi-VN") ?? "—"} vé đã bán`,
      target: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      label: "GMV đơn đã thanh toán",
      value: metrics.data ? money(metrics.data.grossRevenue) : "—",
      detail: "Tổng tiền đơn PAID",
      target: "/admin/payments",
      icon: Banknote,
    },
  ];

  return (
    <main className="grid min-w-0 gap-5 animate-[transaction-enter_.22s_ease-out] motion-reduce:animate-none sm:gap-6">
      <header>
        <p className="m-0 text-xs font-extrabold uppercase tracking-[.11em] text-coral-dark">
          Admin · Tổng quan
        </p>
        <h1 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-pine sm:text-4xl">
          Dashboard
        </h1>
        <p className="mb-0 mt-2 text-sm text-ink-soft">
          Tổng quan hoạt động và tình hình vận hành nền tảng
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={() => navigate(card.target)}
              className="group min-h-36 rounded-xl border border-line bg-surface p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue hover:shadow-md sm:p-5"
            >
              <span className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-ink-soft">
                  {card.label}
                </span>
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center rounded-lg bg-paper-deep text-blue-deep"
                >
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
              </span>
              <strong className="mt-3 block truncate text-2xl font-extrabold text-pine sm:text-3xl">
                {metrics.loading ? (
                  <span className="inline-block h-8 w-24 animate-pulse rounded bg-paper-deep" />
                ) : metrics.error ? (
                  "—"
                ) : typeof card.value === "number" ? (
                  card.value.toLocaleString("vi-VN")
                ) : (
                  card.value
                )}
              </strong>
              <span className="mt-1 block text-xs text-ink-soft">
                {card.detail}
              </span>
            </button>
          );
        })}
      </div>
      {metrics.error && <ErrorBox message={metrics.error} retry={retry} />}
      <div className="grid min-w-0 gap-5">
        <Panel
          title="Hoạt động nền tảng"
          subtitle="GMV và số đơn thanh toán thành công theo ngày"
          action={
            <select
              aria-label="Khoảng thời gian biểu đồ"
              value={range}
              onChange={(event) => setRange(Number(event.target.value))}
              className="min-h-10 rounded-lg border border-line bg-paper px-3 text-sm"
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={90}>90 ngày</option>
            </select>
          }
        >
          <Section state={timeline} retry={retry}>
            {() =>
              chartRows.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <p className="m-0 rounded-lg bg-paper-deep p-3 text-xs text-ink-soft">
                      GMV · {range} ngày
                      <strong className="mt-1 block text-lg text-pine">
                        {money(
                          chartRows.reduce((sum, row) => sum + row.revenue, 0),
                        )}
                      </strong>
                    </p>
                    <p className="m-0 rounded-lg bg-paper-deep p-3 text-xs text-ink-soft">
                      Đơn đã thanh toán
                      <strong className="mt-1 block text-lg text-pine">
                        {chartRows
                          .reduce((sum, row) => sum + row.orders, 0)
                          .toLocaleString("vi-VN")}
                      </strong>
                    </p>
                  </div>
                  <svg
                    className="mt-5 h-72 w-full"
                    viewBox="0 0 1000 280"
                    role="group"
                    aria-label="Biểu đồ đường GMV theo ngày, trục dọc hiển thị số tiền VND"
                    preserveAspectRatio="none"
                  >
                    {yTickValues.map((value) => {
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
                            x={plot.left - 12}
                            y={y + 4}
                            fill="currentColor"
                            fontSize="12"
                            textAnchor="end"
                          >
                            {axisMoney(value)}
                          </text>
                        </g>
                      );
                    })}
                    <polyline
                      points={chartRows
                        .map(
                          (row, index) =>
                            `${xFor(index).toFixed(1)},${yFor(row.revenue).toFixed(1)}`,
                        )
                        .join(" ")}
                      fill="none"
                      stroke="var(--color-blue)"
                      strokeWidth="4"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    {chartRows.map((row, index) => {
                      if (row.orders === 0) return null;
                      return (
                        <circle
                          key={row.date}
                          cx={xFor(index)}
                          cy={yFor(row.revenue)}
                          r="6"
                          fill="var(--color-blue)"
                          stroke="var(--color-paper)"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          tabIndex={0}
                          aria-label={`${row.date}: ${money(row.revenue)}, ${row.orders} đơn`}
                        >
                          <title>{`${row.date}: ${money(row.revenue)} · ${row.orders} đơn`}</title>
                        </circle>
                      );
                    })}
                    {xTickIndexes.map((index) => (
                      <g key={index}>
                        <line
                          x1={xFor(index)}
                          y1={plot.bottom}
                          x2={xFor(index)}
                          y2={plot.bottom + 5}
                          stroke="currentColor"
                          opacity="0.35"
                        />
                        <text
                          x={xFor(index)}
                          y={plot.bottom + 24}
                          fill="currentColor"
                          fontSize="12"
                          textAnchor={
                            index === 0
                              ? "start"
                              : index === chartRows.length - 1
                                ? "end"
                                : "middle"
                          }
                        >
                          {shortDate(chartRows[index]!.date)}
                        </text>
                      </g>
                    ))}
                  </svg>
                  <p className="mb-0 mt-3 text-xs text-ink-soft">
                    Đường biểu diễn GMV từ các đơn PAID; ngày không có đơn được
                    tính là 0 ₫. Di chuột hoặc focus vào điểm để xem số liệu.
                  </p>
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-line p-6 text-center text-sm text-ink-soft">
                  Chưa có giao dịch thanh toán trong khoảng thời gian này.
                </p>
              )
            }
          </Section>
        </Panel>
      </div>
      <Panel title="Cần xử lý" subtitle="Nghiệp vụ đang chờ admin">
        {metrics.loading || payoutCount.loading || refundCount.loading ? (
          <LoadingRows count={3} />
        ) : (
          <div className="grid gap-3">
            {metrics.data && metrics.data.pendingReviewCount > 0 && (
              <button
                type="button"
                onClick={() => navigate("/admin/events/review")}
                className="flex items-center justify-between gap-2 rounded-lg border border-line p-3 text-left transition hover:border-blue"
              >
                <span>
                  <strong className="block text-sm">Sự kiện chờ duyệt</strong>
                  <span className="text-xs text-ink-soft">
                    Hồ sơ sự kiện cần xét duyệt
                  </span>
                </span>
                <strong className="text-xl text-pine">
                  {metrics.data.pendingReviewCount}
                </strong>
              </button>
            )}
            {payoutCount.data !== null && payoutCount.data > 0 && (
              <button
                type="button"
                onClick={() => navigate("/admin/payouts")}
                className="flex items-center justify-between gap-2 rounded-lg border border-line p-3 text-left transition hover:border-blue"
              >
                <span>
                  <strong className="block text-sm">
                    Payout chờ phê duyệt
                  </strong>
                  <span className="text-xs text-ink-soft">
                    Yêu cầu giải ngân
                  </span>
                </span>
                <strong className="text-xl text-pine">
                  {payoutCount.data}
                </strong>
              </button>
            )}
            {metrics.data && metrics.data.refundPendingCount > 0 && (
              <button
                type="button"
                onClick={() => navigate("/admin/refunds")}
                className="flex items-center justify-between gap-2 rounded-lg border border-line p-3 text-left transition hover:border-blue"
              >
                <span>
                  <strong className="block text-sm">Refund chờ xử lý</strong>
                  <span className="text-xs text-ink-soft">
                    Yêu cầu hoàn tiền
                  </span>
                </span>
                <strong className="text-xl text-pine">
                  {metrics.data.refundPendingCount}
                </strong>
              </button>
            )}
            {metrics.data &&
              metrics.data.pendingReviewCount === 0 &&
              payoutCount.data === 0 &&
              metrics.data.refundPendingCount === 0 && (
                <p className="m-0 rounded-lg border border-dashed border-line p-5 text-sm text-ink-soft">
                  Không có nghiệp vụ cần xử lý.
                </p>
              )}
            {(payoutCount.error || refundCount.error) && (
              <p className="m-0 text-xs text-ink-soft">
                Một số dữ liệu hàng đợi chưa tải được.
              </p>
            )}
          </div>
        )}
      </Panel>
      <div className="grid min-w-0 gap-5 xl:grid-cols-2">
        <Panel
          title="Giao dịch gần đây"
          subtitle="Các đơn hàng mới nhất"
          action={
            <button
              type="button"
              onClick={() => navigate("/admin/orders")}
              className="text-sm font-bold text-blue-deep hover:underline"
            >
              Xem tất cả
            </button>
          }
        >
          <Section state={orders} retry={retry}>
            {(items) =>
              items.length ? (
                <div className="grid gap-2">
                  {items.slice(0, 6).map((order) => (
                    <button
                      type="button"
                      key={order.id}
                      onClick={() => navigate("/admin/orders")}
                      className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-line p-3 text-left transition hover:bg-paper/50"
                    >
                      <span className="min-w-0">
                        <strong className="block truncate text-sm">
                          #{order.id.slice(0, 12)} · {order.user.fullName}
                        </strong>
                        <span className="block truncate text-xs text-ink-soft">
                          {dateTime(order.createdAt)}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <strong className="block text-sm">
                          {money(order.total)}
                        </strong>
                        <AdminStatusBadge
                          label={order.status}
                          tone={order.status === "PAID" ? "mint" : "neutral"}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Chưa có đơn hàng.</p>
              )
            }
          </Section>
        </Panel>
        <Panel
          title="Người dùng mới"
          subtitle="5 tài khoản đăng ký gần nhất"
          action={
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="text-sm font-bold text-blue-deep hover:underline"
            >
              Xem tất cả
            </button>
          }
        >
          <Section state={users} retry={retry}>
            {(items) =>
              items.length ? (
                <div className="grid gap-2">
                  {items.map((user) => (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() =>
                        navigate(`/admin/users/${encodeURIComponent(user.id)}`)
                      }
                      className="flex min-w-0 items-center gap-3 rounded-lg border border-line p-3 text-left transition hover:bg-paper/50"
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-deep font-extrabold text-pine"
                      >
                        {user.fullName.slice(0, 1).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block truncate text-sm">
                          {user.fullName}
                        </strong>
                        <span className="block truncate text-xs text-ink-soft">
                          {user.email}
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xs text-ink-soft">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <AdminStatusBadge
                          label={
                            user.status === "ACTIVE" ? "Hoạt động" : user.status
                          }
                          tone={user.status === "ACTIVE" ? "mint" : "neutral"}
                        />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-soft">Chưa có người dùng.</p>
              )
            }
          </Section>
        </Panel>
      </div>
      <p className="m-0 text-xs text-ink-soft">
        Dữ liệu tài chính sử dụng trạng thái thanh toán PAID. Doanh thu phí nền
        tảng và xếp hạng sự kiện theo vé bán chưa có API hỗ trợ.
      </p>
    </main>
  );
}
