import { useCallback, useEffect, useMemo, useState } from "react";
import { adminEventApi } from "../api/adminEventApi.ts";
import type { AdminEvent } from "../types/adminEventTypes.ts";
import { AdminDataTable } from "../../components/AdminDataTable.tsx";
import {
  AdminFilterToolbar,
  AdminPageHeader,
  AdminStatusBadge,
} from "../../components/AdminCommon.tsx";
import {
  adminStatusLabel,
  adminStatusTone,
} from "../../helpers/admin-display.ts";

type Props = {
  readonly mode: "all" | "pending";
  readonly navigate: (path: string) => void;
};

function dateLabel(value: string | null) {
  if (!value) return "Chưa có lịch";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Chưa có lịch"
    : date.toLocaleString("vi-VN");
}

export function AdminEventListPage({ mode, navigate }: Props) {
  const [events, setEvents] = useState<readonly AdminEvent[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setEvents(
        await (mode === "pending"
          ? adminEventApi.findPending()
          : adminEventApi.findAll()),
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể tải danh sách sự kiện.",
      );
    } finally {
      setLoading(false);
    }
  }, [mode]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const filtered = useMemo(
    () =>
      events.filter((event) => {
        const search = query.trim().toLowerCase();
        const matchesQuery =
          !search ||
          [
            event.title,
            event.organizer.fullName,
            event.organizer.email,
            event.location.province,
          ].some((value) => value.toLowerCase().includes(search));
        return matchesQuery && (!status || event.status === status);
      }),
    [events, query, status],
  );
  const statuses = [...new Set(events.map((event) => event.status))];
  return (
    <section className="grid gap-5">
      <AdminPageHeader
        eyebrow="Quản lý sự kiện"
        title={mode === "pending" ? "Chờ duyệt" : "Tất cả sự kiện"}
      >
        <p>
          {mode === "pending"
            ? "Kiểm tra và xử lý các sự kiện Organizer gửi lên."
            : "Theo dõi toàn bộ sự kiện trong hệ thống."}
        </p>
      </AdminPageHeader>
      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          <span>{error}</span>
          <button
            className="min-h-11 rounded border border-error px-3 font-bold"
            type="button"
            onClick={() => void load()}
          >
            Thử lại
          </button>
        </div>
      )}
      <AdminFilterToolbar
        query={query}
        status={status}
        resultCount={filtered.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        statusOptions={statuses.map((value) => ({
          value,
          label: adminStatusLabel(value),
        }))}
      />
      {loading ? (
        <p
          className="rounded-lg border border-line bg-surface p-6"
          role="status"
        >
          Đang tải danh sách sự kiện...
        </p>
      ) : (
        <AdminDataTable
          label="Danh sách sự kiện"
          headers={[
            "Sự kiện",
            "Organizer",
            "Địa điểm",
            "Thời gian",
            "Trạng thái",
          ]}
          rows={filtered.map((event) => ({
            key: event.id,
            cells: [
              <strong key="title">{event.title}</strong>,
              <span key="organizer">
                {event.organizer.fullName ||
                  event.organizer.email ||
                  "Chưa cập nhật"}
              </span>,
              <span key="location">
                {event.location.province ||
                  event.location.address ||
                  "Chưa cập nhật"}
              </span>,
              <span key="date">{dateLabel(event.startAt)}</span>,
              <AdminStatusBadge
                key="status"
                label={adminStatusLabel(event.status)}
                tone={adminStatusTone(event.status)}
              />,
            ],
            onOpen: () =>
              navigate(`/admin/events/${encodeURIComponent(event.id)}/review`),
          }))}
        />
      )}
    </section>
  );
}
