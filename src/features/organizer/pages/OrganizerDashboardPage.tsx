import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Banknote,
  CalendarDays,
  Clock3,
  Plus,
  TicketCheck,
  WalletCards,
  XCircle,
} from "lucide-react";
import * as eventApi from "../../events/api/eventApi.ts";
import { OrganizerStatusBadge } from "../components/OrganizerStatusBadge.tsx";
import {
  ActivityChart,
  EmptyState,
  EventStatus,
  Panel,
  RetryState,
  type Metric,
} from "../components/OrganizerDashboardPrimitives.tsx";
import { OrganizerDashboardSkeleton } from "../components/OrganizerDashboardSkeleton.tsx";
import * as payoutApi from "../api/organizerPayoutApi.ts";
import type { OrganizerPayoutRecord } from "../api/organizerPayoutApi.ts";
import type { OrganizerEventReport } from "../../../types/event.ts";
import type { OrganizerEvent } from "../types/organizer-event.ts";
import type { OrganizerWorkspace } from "../types/organizer-workspace.ts";

type Props = {
  readonly onOpenEvent: (eventId: string) => void;
  readonly onOpenEvents: () => void;
  readonly onOpenFinance: () => void;
  readonly onCreateEvent: () => void;
  readonly workspace: Pick<OrganizerWorkspace, "events">;
  readonly loading: boolean;
  readonly loadError: string | null;
  readonly onRetry: () => void;
};
type ReportMap = Readonly<Record<string, OrganizerEventReport>>;
type ReportsState = DataState<ReportMap> & { readonly requestKey: string };
type DataState<T> = {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: string;
};
const emptyState = <T,>(): DataState<T> => ({
  data: null,
  loading: true,
  error: "",
});
const currency = (amount: number | string) =>
  `${Number(amount).toLocaleString("vi-VN")} ₫`;
const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

export function OrganizerDashboardPage({
  onOpenEvent,
  onOpenEvents,
  onOpenFinance,
  onCreateEvent,
  workspace,
  loading,
  loadError,
  onRetry,
}: Props) {
  const [reports, setReports] = useState<ReportsState>({
    ...emptyState<ReportMap>(),
    requestKey: "",
  });
  const [payouts, setPayouts] =
    useState<DataState<readonly OrganizerPayoutRecord[]>>(emptyState());
  const [range, setRange] = useState(30);
  const [metric, setMetric] = useState<Metric>("revenue");
  const [retryKey, setRetryKey] = useState(0);
  const reportRequestKey = `${retryKey}:${loading ? "loading" : "ready"}:${loadError ?? ""}:${workspace.events.map((event) => event.id).join(",")}`;
  const retry = () => {
    onRetry();
    setRetryKey((value) => value + 1);
  };

  useEffect(() => {
    let active = true;
    async function loadReports() {
      if (loading) return;
      if (loadError) {
        setReports({
          data: null,
          loading: false,
          error: loadError,
          requestKey: reportRequestKey,
        });
        return;
      }
      if (!workspace.events.length) {
        setReports({
          data: {},
          loading: false,
          error: "",
          requestKey: reportRequestKey,
        });
        return;
      }
      try {
        const outcomes = await Promise.allSettled(
          workspace.events.map(async (event) => {
            const response = await eventApi.reporting(event.id);
            return [event.id, response.data.report] as const;
          }),
        );
        if (!active) return;
        const resolved = outcomes.flatMap((outcome) =>
          outcome.status === "fulfilled" ? [outcome.value] : [],
        );
        const failedCount = outcomes.length - resolved.length;
        setReports({
          data: Object.fromEntries(resolved),
          loading: false,
          requestKey: reportRequestKey,
          error: failedCount
            ? `Không tải được báo cáo của ${failedCount} sự kiện.`
            : "",
        });
      } catch (cause) {
        if (active)
          setReports({
            data: null,
            loading: false,
            requestKey: reportRequestKey,
            error:
              cause instanceof Error
                ? cause.message
                : "Không thể tải báo cáo sự kiện.",
          });
      }
    }
    async function loadPayouts() {
      try {
        const { data } = await payoutApi.findMine();
        if (active)
          setPayouts({ data: data.payouts, loading: false, error: "" });
      } catch (cause) {
        if (active)
          setPayouts({
            data: null,
            loading: false,
            error:
              cause instanceof Error ? cause.message : "Không thể tải payout.",
          });
      }
    }
    void loadReports();
    void loadPayouts();
    return () => {
      active = false;
    };
  }, [retryKey, loading, loadError, workspace.events, reportRequestKey]);

  const [now] = useState(() => Date.now());
  const reportLoading =
    reports.loading || reports.requestKey !== reportRequestKey;
  const activeReports =
    reports.requestKey === reportRequestKey ? reports.data : null;
  const reportError =
    reports.requestKey === reportRequestKey ? reports.error : "";
  const organizerEvents = workspace.events;
  const upcoming = useMemo(
    () =>
      organizerEvents
        .filter(
          (event) =>
            ["approved", "published"].includes(event.status) &&
            Date.parse(event.startAt) >= now,
        )
        .toSorted((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt))
        .slice(0, 5),
    [organizerEvents, now],
  );
  const reportValues = Object.values(activeReports ?? {});
  const totalRevenue = reportValues.reduce(
    (sum, report) => sum + report.summary.revenue,
    0,
  );
  const totalTickets = reportValues.reduce(
    (sum, report) => sum + report.summary.soldTicketCount,
    0,
  );
  const pendingPayouts = (payouts.data ?? []).filter((payout) =>
    ["PENDING_APPROVAL", "PROCESSING", "PENDING"].includes(payout.status),
  );
  const pendingPayoutTotal = pendingPayouts.reduce(
    (sum, payout) => sum + Number(payout.amount),
    0,
  );
  const attention = [
    {
      id: "review",
      label: "Sự kiện chờ duyệt",
      description: "Đang chờ Admin xét duyệt",
      count: organizerEvents.filter(
        (event) => event.status === "pending_review",
      ).length,
      icon: Clock3,
      open: onOpenEvents,
    },
    {
      id: "rejected",
      label: "Sự kiện bị từ chối",
      description: "Kiểm tra phản hồi và cập nhật hồ sơ",
      count: organizerEvents.filter((event) => event.status === "rejected")
        .length,
      icon: XCircle,
      open: onOpenEvents,
    },
    {
      id: "payout",
      label: "Payout đang xử lý",
      description: "Khoản chi trả chưa hoàn tất",
      count: pendingPayouts.length,
      icon: WalletCards,
      open: onOpenFinance,
    },
    {
      id: "upcoming",
      label: "Sắp diễn ra trong 7 ngày",
      description: "Kiểm tra khâu chuẩn bị sự kiện",
      count: organizerEvents.filter(
        (event) =>
          ["approved", "published"].includes(event.status) &&
          Date.parse(event.startAt) >= now &&
          Date.parse(event.startAt) <= now + 7 * 86_400_000,
      ).length,
      icon: CalendarDays,
      open: onOpenEvents,
    },
  ].filter((item) => item.count > 0);
  const chartRows = useMemo(() => {
    if (!activeReports) return [];
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(start.getDate() - range + 1);
    const from = localDateKey(start);
    const aggregates = new Map<string, { revenue: number; tickets: number }>();
    for (const report of Object.values(activeReports))
      for (const bucket of report.timeline) {
        const date = bucket.startAt.slice(0, 10);
        if (date < from || date > localDateKey(end)) continue;
        const current = aggregates.get(date) ?? { revenue: 0, tickets: 0 };
        current.revenue += bucket.revenue;
        current.tickets += bucket.soldTicketCount;
        aggregates.set(date, current);
      }
    if (
      ![...aggregates.values()].some(
        (row) => row.revenue > 0 || row.tickets > 0,
      )
    )
      return [];
    return Array.from({ length: range }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = localDateKey(date);
      const row = aggregates.get(key) ?? { revenue: 0, tickets: 0 };
      return { date: key, ...row };
    });
  }, [activeReports, range]);
  const performanceEvents = organizerEvents
    .map((event) => ({ event, report: activeReports?.[event.id] }))
    .filter(
      (
        item,
      ): item is {
        event: OrganizerEvent;
        report: OrganizerEventReport;
      } => Boolean(item.report),
    )
    .toSorted((a, b) => b.report.summary.revenue - a.report.summary.revenue)
    .slice(0, 5);
  const recentPayouts = [...(payouts.data ?? [])]
    .toSorted((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, 5);

  if (loading || reportLoading || payouts.loading)
    return <OrganizerDashboardSkeleton />;

  const statCards = [
    {
      label: "Tổng sự kiện",
      value: loadError ? "—" : organizerEvents.length.toLocaleString("vi-VN"),
      detail: `${upcoming.length} sự kiện sắp diễn ra`,
      icon: CalendarDays,
      open: onOpenEvents,
    },
    {
      label: "Vé đã bán",
      value: reportError ? "—" : totalTickets.toLocaleString("vi-VN"),
      detail: "Vé thuộc đơn đã thanh toán",
      icon: TicketCheck,
      open: onOpenEvents,
    },
    {
      label: "Tổng doanh thu",
      value: reportError ? "—" : currency(totalRevenue),
      detail: "Tổng giá trị đơn đã thanh toán",
      icon: Banknote,
      open: onOpenFinance,
    },
    {
      label: "Payout chờ xử lý",
      value: payouts.error ? "—" : currency(pendingPayoutTotal),
      detail: `${pendingPayouts.length} khoản đang chờ hoặc xử lý`,
      icon: WalletCards,
      open: onOpenFinance,
    },
  ];

  return (
    <main className="mx-auto grid max-w-7xl gap-5 animate-[transaction-enter_.22s_ease-out] motion-reduce:animate-none sm:gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-[.11em] text-coral-dark">
            KHÔNG GIAN TỔ CHỨC
          </p>
          <h1 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-pine sm:text-4xl">
            Tổng quan
          </h1>
          <p className="mb-0 mt-2 text-sm text-ink-soft">
            Theo dõi hiệu quả hoạt động và quản lý các sự kiện của bạn
          </p>
        </div>
        <button
          type="button"
          onClick={onCreateEvent}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-coral px-5 font-extrabold text-paper transition hover:bg-coral-dark"
        >
          <Plus className="size-5" aria-hidden="true" />
          Tạo sự kiện
        </button>
      </header>
      {loadError && <RetryState message={loadError} retry={retry} />}
      <section
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        aria-label="Chỉ số tổng quan"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.open}
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
                {card.value}
              </strong>
              <span className="mt-1 block text-xs text-ink-soft">
                {card.detail}
              </span>
            </button>
          );
        })}
      </section>
      {(reportError || payouts.error) && (
        <div
          className="rounded-lg border border-blue/30 bg-google-hover p-3 text-sm text-blue-deep"
          role="status"
        >
          {reportError && (
            <p className="m-0">
              {reportError} Một số tổng số liệu có thể chưa đầy đủ.
            </p>
          )}
          {payouts.error && (
            <p className="m-0">
              Không tải được payout; thử tải lại để cập nhật thẻ payout và hoạt
              động gần đây.
            </p>
          )}
          <button
            type="button"
            onClick={retry}
            className="mt-2 font-bold underline"
          >
            Thử tải lại dữ liệu
          </button>
        </div>
      )}
      <Panel
        title="Bán vé & doanh thu"
        subtitle="Theo dõi hoạt động bán vé từ đơn đã thanh toán"
      >
        <ActivityChart
          rows={chartRows}
          metric={metric}
          onMetricChange={setMetric}
          range={range}
          onRangeChange={setRange}
        />
      </Panel>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel
          title="Sự kiện sắp diễn ra"
          subtitle="Các sự kiện đã duyệt gần nhất"
          action={
            <button
              type="button"
              onClick={onOpenEvents}
              className="text-sm font-bold text-blue-deep hover:underline"
            >
              Xem tất cả
            </button>
          }
        >
          {upcoming.length ? (
            <div className="grid gap-3">
              {upcoming.map((event) => {
                const report = activeReports?.[event.id];
                const sold = report?.summary.soldTicketCount ?? 0;
                const capacity = report?.summary.capacity ?? 0;
                const ratio = capacity
                  ? Math.min(100, (sold / capacity) * 100)
                  : 0;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onOpenEvent(event.id)}
                    className="flex min-w-0 gap-3 rounded-lg border border-line p-3 text-left transition hover:border-blue hover:bg-paper/30"
                  >
                    <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-paper-deep">
                      {event.thumbnail ? (
                        <img
                          src={event.thumbnail}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <CalendarDays
                          className="size-6 text-ink-soft"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm">
                        {event.title}
                      </strong>
                      <span className="mt-1 block truncate text-xs text-ink-soft">
                        {dateTime(event.startAt)} ·{" "}
                        {[event.venue, event.city].filter(Boolean).join(", ") ||
                          "Chưa cập nhật địa điểm"}
                      </span>
                      <span className="mt-2 flex items-center justify-between gap-2 text-xs">
                        <span className="text-ink-soft">
                          {report
                            ? `${sold} / ${capacity} vé`
                            : "Chưa có báo cáo vé"}
                        </span>
                        <EventStatus status={event.status} />
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper-deep">
                        <span
                          className="block h-full rounded-full bg-blue transition-[width]"
                          style={{ width: `${ratio}%` }}
                        />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : loadError ? (
            <p className="text-sm text-ink-soft">Sự kiện chưa tải được.</p>
          ) : (
            <EmptyState
              title="Chưa có sự kiện sắp tới"
              detail="Tạo sự kiện mới để bắt đầu lên lịch chương trình."
              action={
                <button
                  type="button"
                  onClick={onCreateEvent}
                  className="min-h-10 rounded-md bg-coral px-4 font-bold text-paper"
                >
                  Tạo sự kiện
                </button>
              }
            />
          )}
        </Panel>
        <Panel title="Cần chú ý" subtitle="Các trạng thái cần theo dõi">
          <div className="grid gap-3">
            {attention.length ? (
              attention.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.open}
                    className="flex items-center justify-between gap-3 rounded-lg border border-line p-3 text-left transition hover:border-blue"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-paper-deep text-blue-deep">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <strong className="block truncate text-sm">
                          {item.label}
                        </strong>
                        <span className="text-xs text-ink-soft">
                          {item.description}
                        </span>
                      </span>
                    </span>
                    <strong className="text-xl text-pine">{item.count}</strong>
                  </button>
                );
              })
            ) : loadError || payouts.error ? (
              <p className="m-0 text-sm text-ink-soft">
                Không thể tải đầy đủ trạng thái cần chú ý.
              </p>
            ) : (
              <EmptyState
                title="Không có mục cần chú ý"
                detail="Các sự kiện và khoản chi trả hiện không cần xử lý."
              />
            )}
            {(loadError || payouts.error) && (
              <button
                type="button"
                onClick={retry}
                className="text-left text-xs font-bold text-blue-deep underline"
              >
                Không thể tải đầy đủ trạng thái. Thử lại.
              </button>
            )}
          </div>
        </Panel>
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <Panel
          title="Hiệu quả sự kiện"
          subtitle="Tối đa 5 sự kiện, xếp theo doanh thu"
          action={
            <button
              type="button"
              onClick={onOpenEvents}
              className="text-sm font-bold text-blue-deep hover:underline"
            >
              Xem tất cả
            </button>
          }
        >
          {reportError ? (
            <p className="text-sm text-ink-soft">
              Chưa thể tải đủ báo cáo để xếp hạng sự kiện.
            </p>
          ) : performanceEvents.length ? (
            <div className="grid gap-3">
              {performanceEvents.map(({ event, report }) => {
                const ratio = report.summary.capacity
                  ? Math.min(
                      100,
                      (report.summary.soldTicketCount /
                        report.summary.capacity) *
                        100,
                    )
                  : 0;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => onOpenEvent(event.id)}
                    className="grid min-w-0 gap-2 rounded-lg border border-line p-3 text-left transition hover:border-blue sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <span className="min-w-0">
                      <strong className="block truncate text-sm">
                        {event.title}
                      </strong>
                      <span className="mt-1 block text-xs text-ink-soft">
                        {new Date(event.startAt).toLocaleDateString("vi-VN")} ·{" "}
                        {report.summary.soldTicketCount}/
                        {report.summary.capacity} vé ({Math.round(ratio)}%)
                      </span>
                      <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-paper-deep">
                        <span
                          className="block h-full rounded-full bg-blue"
                          style={{ width: `${ratio}%` }}
                        />
                      </span>
                    </span>
                    <span className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
                      <EventStatus status={event.status} />
                      <strong className="text-sm text-pine">
                        {currency(report.summary.revenue)}
                      </strong>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Chưa có dữ liệu hiệu quả"
              detail="Báo cáo sẽ xuất hiện khi sự kiện có đơn hàng đã thanh toán."
            />
          )}
        </Panel>
        <Panel
          title="Hoạt động gần đây"
          subtitle="Các khoản payout gần nhất"
          action={
            <button
              type="button"
              onClick={onOpenFinance}
              className="text-sm font-bold text-blue-deep hover:underline"
            >
              Xem tài chính
            </button>
          }
        >
          {payouts.error ? (
            <RetryState
              message="Không tải được hoạt động payout."
              retry={retry}
            />
          ) : recentPayouts.length ? (
            <ul className="m-0 grid list-none gap-2 p-0">
              {recentPayouts.map((payout) => (
                <li key={payout.id}>
                  <button
                    type="button"
                    onClick={onOpenFinance}
                    className="flex w-full min-w-0 items-center gap-3 rounded-lg border border-line p-3 text-left transition hover:bg-paper/40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-deep text-blue-deep">
                      <Activity className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm">
                        Payout · {payout.event.title}
                      </strong>
                      <span className="block text-xs text-ink-soft">
                        {dateTime(payout.createdAt)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <strong className="block text-sm">
                        {currency(payout.amount)}
                      </strong>
                      <OrganizerStatusBadge
                        label={payout.status}
                        tone={
                          payout.status === "COMPLETED"
                            ? "mint"
                            : ["FAILED", "REJECTED"].includes(payout.status)
                              ? "coral"
                              : "blue"
                        }
                      />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Chưa có hoạt động payout"
              detail="Các khoản chi trả của sự kiện sẽ xuất hiện tại đây."
            />
          )}
        </Panel>
      </div>
    </main>
  );
}
