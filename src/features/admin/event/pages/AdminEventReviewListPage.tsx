import { useMemo, useState } from 'react';
import { filterAdminEvents } from '../../helpers/filter-admin-records.ts';
import { adminStatusLabel as statusLabel, adminStatusTone as tone } from '../../helpers/admin-display.ts';
import type { AdminWorkspaceController } from '../../hooks/admin-workspace-controller.ts';
import { AdminDataTable } from '../../components/AdminDataTable.tsx';
import { AdminFilterToolbar, AdminPageHeader, AdminStatusBadge } from '../../components/AdminCommon.tsx';
import { AdminSelect } from '../../components/AdminSelect.tsx';
import { eventReviewStatusOptions, ticketPriceRange } from '../components/AdminEventReviewControls.ts';

export function AdminEventReviewListPage({
  controller,
  navigate,
}: {
  readonly controller: AdminWorkspaceController;
  readonly navigate: (path: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("pending_review");
  const [city, setCity] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const events = useMemo(
    () =>
      filterAdminEvents(
        controller.workspace.events,
        controller.workspace.organizers,
        {
          query,
          statuses: status ? [status] : [],
          city,
          categoryId,
          organizerId,
        },
      ).filter(
        (event) =>
          !submittedDate || event.submittedAt.startsWith(submittedDate),
      ),
    [
      categoryId,
      city,
      controller.workspace.events,
      controller.workspace.organizers,
      organizerId,
      query,
      status,
      submittedDate,
    ],
  );
  const cities = [
    ...new Set(controller.workspace.events.map((item) => item.city)),
  ];

  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="KIỂM DUYỆT" title="Duyệt sự kiện">
        Chỉ duyệt trạng thái và ghi lịch sử, không sửa nội dung sự kiện.
      </AdminPageHeader>
      <AdminFilterToolbar
        query={query}
        status={status}
        statusOptions={eventReviewStatusOptions}
        resultCount={events.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminSelect
          label="Thành phố"
          value={city}
          onChange={setCity}
          values={[
            { value: "", label: "Tất cả thành phố" },
            ...cities.map((value) => ({ value, label: value })),
          ]}
        />
        <AdminSelect
          label="Danh mục"
          value={categoryId}
          onChange={setCategoryId}
          values={[
            { value: "", label: "Tất cả danh mục" },
            ...controller.workspace.categories.map((item) => ({
              value: item.id,
              label: item.label,
            })),
          ]}
        />
        <AdminSelect
          label="Organizer"
          value={organizerId}
          onChange={setOrganizerId}
          values={[
            { value: "", label: "Tất cả Organizer" },
            ...controller.workspace.organizers.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
        />
        <label className="text-sm font-bold">
          Ngày gửi
          <input
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            type="date"
            value={submittedDate}
            onChange={(event) => setSubmittedDate(event.target.value)}
          />
        </label>
      </div>
      <AdminDataTable
        label="Danh sách sự kiện đang chờ duyệt"
        headers={[
          "Sự kiện",
          "Organizer",
          "Thời gian",
          "Thành phố",
          "Khoảng giá vé",
          "Lần gửi",
          "Trạng thái",
        ]}
        rows={events.map((event) => {
          const organizer = controller.workspace.organizers.find(
            (item) => item.id === event.organizerId,
          );
          return {
            key: event.id,
            cells: [
              event.title,
              <span key="organizer">
                {organizer?.name ?? "Không còn khả dụng"}
                <span className="block text-xs text-ink-soft">
                  {organizer ? statusLabel(organizer.verificationStatus) : ""}
                </span>
              </span>,
              new Date(event.startsAt).toLocaleString("vi-VN"),
              event.city,
              ticketPriceRange(event),
              `Lần ${event.submissionNumber} · ${new Date(event.submittedAt).toLocaleDateString("vi-VN")}`,
              <AdminStatusBadge
                key="status"
                label={statusLabel(event.reviewStatus)}
                tone={tone(event.reviewStatus)}
              />,
            ],
            onOpen: () =>
              navigate(`/admin/events/${encodeURIComponent(event.id)}/review`),
          };
        })}
      />
    </div>
  );
}
