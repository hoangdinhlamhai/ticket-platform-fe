import { useCallback, useEffect, useMemo, useState } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import type { AdminEventListItem } from "../types/admin-event.ts";
import {
  adminStatusLabel,
  adminStatusTone,
} from "../../helpers/admin-display.ts";

const pageSize = 10;
const dateTime = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function normalizedStatus(status: string) {
  return status.toLowerCase();
}

function formatDate(value: string | null) {
  return value ? dateTime.format(new Date(value)) : "—";
}

const statusTone: Record<string, string> = {
  blue: "bg-blue/10 text-blue-deep",
  mint: "bg-mint text-success",
  critical: "bg-error/10 text-error",
  coral: "bg-coral/15 text-ink",
  neutral: "bg-paper-deep text-ink-soft",
};

export function AdminEventsPage({
  navigate,
}: {
  readonly navigate: (path: string) => void;
}) {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [category, setCategory] = useState("all");
  const [time, setTime] = useState("all");
  const [page, setPage] = useState(1);
  const [referenceTime, setReferenceTime] = useState(0);

  const loadEvents = useCallback(async () => {
    try {
      const { data } = await adminEventApi.findAll();
      setEvents(data.events);
      setReferenceTime(Date.now());
      setError("");
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể tải danh sách sự kiện. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => void loadEvents(), 0);
    return () => window.clearTimeout(request);
  }, [loadEvents]);

  const categories = useMemo(
    () => [...new Set(events.map((event) => event.category.name))].sort(),
    [events],
  );
  const statuses = useMemo(
    () =>
      [
        ...new Set(events.map((event) => normalizedStatus(event.status))),
      ].sort(),
    [events],
  );
  const counts = useMemo(() => {
    const count = (key: string) =>
      events.filter((event) => normalizedStatus(event.status) === key).length;
    return {
      total: events.length,
      pending: count("pending_review"),
      approved: count("approved"),
      rejected: count("rejected"),
    };
  }, [events]);

  const filteredEvents = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("vi");
    return events.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLocaleLowerCase("vi").includes(search) ||
        event.organizer.fullName.toLocaleLowerCase("vi").includes(search) ||
        event.organizer.email.toLocaleLowerCase("vi").includes(search);
      const matchesStatus =
        status === "all" || normalizedStatus(event.status) === status;
      const matchesCategory =
        category === "all" || event.category.name === category;
      const start = new Date(event.startAt).getTime();
      const matchesTime =
        time === "all" ||
        (time === "upcoming" && start >= referenceTime) ||
        (time === "past" && start < referenceTime);
      return matchesSearch && matchesStatus && matchesCategory && matchesTime;
    });
  }, [category, events, query, referenceTime, status, time]);

  const pageCount = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const visibleEvents = filteredEvents.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <section className="grid gap-6" aria-labelledby="admin-events-title">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-xs font-extrabold uppercase tracking-[.16em] text-ink-soft">
            Không gian quản trị · Sự kiện
          </p>
          <h1
            id="admin-events-title"
            className="mb-0 mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl"
          >
            Quản lý và kiểm duyệt sự kiện
          </h1>
          <p className="mb-0 mt-2 max-w-2xl text-sm text-ink-soft">
            Theo dõi hồ sơ sự kiện và xử lý các yêu cầu kiểm duyệt.
          </p>
        </div>
        <div className="rounded-lg border border-line bg-surface px-4 py-3 text-sm">
          <span className="text-ink-soft">Cập nhật từ hệ thống</span>
          <span className="ml-2 font-bold text-pine">Dữ liệu trực tiếp</span>
        </div>
      </header>

      <div
        className="grid grid-cols-2 gap-3 xl:grid-cols-4"
        aria-label="Thống kê sự kiện"
      >
        {[
          {
            label: "Tổng sự kiện",
            value: counts.total,
            mark: "Tất cả hồ sơ",
          },
          {
            label: "Chờ duyệt",
            value: counts.pending,
            mark: "Cần xử lý",
          },
          {
            label: "Đã duyệt",
            value: counts.approved,
            mark: "Đủ điều kiện",
          },
          {
            label: "Từ chối",
            value: counts.rejected,
            mark: "Có phản hồi",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-lg border border-line bg-surface px-4 py-3.5"
          >
            <p className="m-0 text-sm font-semibold text-ink-soft">
              {stat.label}
            </p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <strong className="text-3xl font-extrabold tabular-nums text-pine">
                {loading ? "—" : stat.value}
              </strong>
              <span className="pb-1 text-xs text-ink-soft">{stat.mark}</span>
            </div>
          </article>
        ))}
      </div>

      <section
        className="overflow-hidden rounded-xl border border-line bg-surface"
        aria-label="Danh sách sự kiện"
      >
        <div className="border-b border-line p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="m-0 text-lg font-extrabold">Danh sách sự kiện</h2>
              <p className="mb-0 mt-1 text-sm text-ink-soft">
                Tìm kiếm, lọc và mở hồ sơ để xem chi tiết.
              </p>
            </div>
            <span className="rounded-full bg-paper-deep px-3 py-1.5 text-xs font-bold text-ink-soft">
              {loading ? "Đang đồng bộ" : `${filteredEvents.length} kết quả`}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.6fr)_repeat(3,minmax(9rem,1fr))]">
            <label className="grid content-start gap-1 text-xs font-bold text-ink-soft">
              <span className="block">Tìm kiếm</span>
              <span className="relative block">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft"
                >
                  <circle
                    cx="8.7"
                    cy="8.7"
                    r="5.7"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="m13 13 4 4"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
                <input
                  className="min-h-11 w-full rounded-md border border-line bg-paper pl-10 pr-3 text-base font-normal text-ink outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
                  value={query}
                  onChange={(event) => setFilter(setQuery)(event.target.value)}
                  placeholder="Tên sự kiện hoặc Organizer"
                />
              </span>
            </label>
            <label className="grid gap-1 text-xs font-bold text-ink-soft">
              <span>Trạng thái</span>
              <select
                className="min-h-11 rounded-md border border-line bg-paper px-3 text-sm font-medium text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                value={status}
                onChange={(event) => setFilter(setStatus)(event.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                {statuses.map((key) => (
                  <option key={key} value={key}>
                    {adminStatusLabel(key)}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-ink-soft">
              <span>Danh mục</span>
              <select
                className="min-h-11 rounded-md border border-line bg-paper px-3 text-sm font-medium text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                value={category}
                onChange={(event) => setFilter(setCategory)(event.target.value)}
              >
                <option value="all">Tất cả danh mục</option>
                {categories.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs font-bold text-ink-soft">
              <span>Thời gian tổ chức</span>
              <select
                className="min-h-11 rounded-md border border-line bg-paper px-3 text-sm font-medium text-ink outline-none focus:border-pine focus:ring-2 focus:ring-pine/15"
                value={time}
                onChange={(event) => setFilter(setTime)(event.target.value)}
              >
                <option value="all">Mọi thời gian</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="past">Đã diễn ra</option>
              </select>
            </label>
          </div>
        </div>

        {error ? (
          <div
            className="grid justify-items-center gap-3 px-5 py-12 text-center"
            role="alert"
          >
            <p className="m-0 text-sm text-error">{error}</p>
            <button
              className="min-h-10 rounded-md bg-pine px-4 text-sm font-bold text-paper hover:bg-pine/90"
              type="button"
              onClick={() => {
                setLoading(true);
                setError("");
                void loadEvents();
              }}
            >
              Thử tải lại
            </button>
          </div>
        ) : loading ? (
          <div
            className="grid gap-3 p-5"
            role="status"
            aria-label="Đang tải danh sách sự kiện"
          >
            <span className="sr-only">Đang tải danh sách sự kiện...</span>
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="h-12 animate-pulse rounded bg-paper-deep"
              />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="grid justify-items-center gap-2 px-5 py-14 text-center">
            <span
              className="grid h-12 w-12 place-items-center rounded-full bg-paper-deep text-pine"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M4 6.5h16M7 12h10m-7 5.5h4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <h3 className="mb-0 mt-2 text-base font-extrabold">
              Không tìm thấy sự kiện phù hợp
            </h3>
            <p className="m-0 max-w-md text-sm text-ink-soft">
              Thử đổi từ khóa hoặc điều chỉnh bộ lọc để xem thêm kết quả.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] border-collapse text-left text-sm">
                <thead className="bg-paper-deep/70 text-xs font-bold uppercase tracking-wide text-ink-soft">
                  <tr>
                    <th className="px-5 py-3.5">Tên sự kiện</th>
                    <th className="px-4 py-3.5">Organizer</th>
                    <th className="px-4 py-3.5">Danh mục</th>
                    <th className="px-4 py-3.5">Ngày tổ chức</th>
                    <th className="px-4 py-3.5">Ngày gửi duyệt</th>
                    <th className="px-4 py-3.5">Trạng thái</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {visibleEvents.map((event) => {
                    const key = normalizedStatus(event.status);
                    const detailPath = `/admin/events/${encodeURIComponent(event.id)}/${key === "pending_review" ? "review" : "details"}`;
                    return (
                      <tr
                        key={event.id}
                        className="group transition-colors hover:bg-paper/70"
                      >
                        <td className="max-w-[19rem] px-5 py-4 align-top">
                          <button
                            type="button"
                            className="text-left font-bold leading-5 text-pine decoration-pine/40 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                            onClick={() => navigate(detailPath)}
                          >
                            {event.title}
                          </button>
                          {key === "rejected" && event.rejectionReason && (
                            <p className="mb-0 mt-1.5 line-clamp-2 text-xs leading-5 text-error">
                              <span className="font-bold">Lý do từ chối:</span>{" "}
                              {event.rejectionReason}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="m-0 font-semibold">
                            {event.organizer.fullName}
                          </p>
                          <p className="mb-0 mt-1 text-xs text-ink-soft">
                            {event.organizer.email}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-ink-soft">
                          {event.category.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-top tabular-nums">
                          {formatDate(event.startAt)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-top tabular-nums text-ink-soft">
                          {formatDate(event.submittedAt)}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <span
                            className={`inline-flex min-h-7 items-center rounded-full px-2.5 text-xs font-bold ${statusTone[adminStatusTone(key)]}`}
                          >
                            <span
                              className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"
                              aria-hidden="true"
                            />
                            {adminStatusLabel(key)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right align-top">
                          <button
                            type="button"
                            className="min-h-9 rounded-md border border-line px-3 text-xs font-bold text-pine transition hover:border-pine hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                            onClick={() => navigate(detailPath)}
                          >
                            {key === "pending_review"
                              ? "Kiểm duyệt"
                              : "Chi tiết"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3.5 sm:px-5">
              <p className="m-0 text-sm text-ink-soft">
                Hiển thị{" "}
                <strong className="text-ink">
                  {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filteredEvents.length)}
                </strong>{" "}
                trong{" "}
                <strong className="text-ink">{filteredEvents.length}</strong> sự
                kiện
              </p>
              <nav
                className="flex items-center gap-2"
                aria-label="Phân trang sự kiện"
              >
                <button
                  type="button"
                  className="min-h-10 rounded-md border border-line px-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Trước
                </button>
                <span className="min-w-20 text-center text-sm font-semibold tabular-nums">
                  {page} / {pageCount}
                </span>
                <button
                  type="button"
                  className="min-h-10 rounded-md border border-line px-3 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={page >= pageCount}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Sau
                </button>
              </nav>
            </footer>
          </>
        )}
      </section>
    </section>
  );
}
