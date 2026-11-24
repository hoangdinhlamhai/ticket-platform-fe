import { useMemo, useState } from "react";
import { filterAdminCases } from "../../helpers/filter-admin-records.ts";
import {
  adminStatusLabel as statusLabel,
  adminStatusTone as tone,
} from "../../helpers/admin-display.ts";
import type { AdminWorkspaceController } from "../../hooks/admin-workspace-controller.ts";
import type { AdminSubjectType } from "../../types/admin-records.ts";
import { AdminDataTable } from "../../components/AdminDataTable.tsx";
import {
  AdminFilterToolbar,
  AdminPageHeader,
  AdminStatusBadge,
} from "../../components/AdminCommon.tsx";

const caseStatusOptions = [
  "open",
  "investigating",
  "waiting_for_information",
  "resolved",
  "dismissed",
].map((value) => ({ value, label: statusLabel(value) }));
import { AdminSelect } from "../../components/AdminSelect.tsx";
import { ResaleSectionTabs } from "../../resale/components/ResaleSectionTabs.tsx";
import { ResaleStatsCards } from "../../resale/components/ResaleStatsCards.tsx";

export function AdminCaseListPage({
  controller,
  navigate,
  subjectTypeFilter,
}: {
  readonly controller: AdminWorkspaceController;
  readonly navigate: (path: string) => void;
  readonly subjectTypeFilter?: AdminSubjectType;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [subjectType, setSubjectType] = useState(subjectTypeFilter ?? "");
  const cases = useMemo(
    () =>
      filterAdminCases(controller.workspace.cases, {
        query,
        statuses: status ? [status] : [],
        severities: severity ? [severity] : [],
        subjectTypes: subjectType ? [subjectType as AdminSubjectType] : [],
      }),
    [controller.workspace.cases, query, severity, status, subjectType],
  );
  const resaleCases = subjectTypeFilter
    ? controller.workspace.cases.filter(
        (item) => item.subjectType === subjectTypeFilter,
      )
    : [];
  const resaleCards = [
    {
      label: "Tổng khiếu nại",
      value: resaleCases.length,
      icon: "▤",
      tone: "text-pine",
      sub: "Vụ việc liên quan đến resale",
    },
    {
      label: "Chờ xử lý",
      value: resaleCases.filter((item) => item.status === "open").length,
      icon: "◷",
      tone: "text-blue-deep",
      sub: "Chưa được tiếp nhận",
    },
    {
      label: "Đang xử lý",
      value: resaleCases.filter((item) =>
        ["investigating", "waiting_for_information"].includes(item.status),
      ).length,
      icon: "↻",
      tone: "text-warning",
      sub: "Đang điều tra hoặc chờ thông tin",
    },
    {
      label: "Đã giải quyết",
      value: resaleCases.filter((item) => item.status === "resolved").length,
      icon: "✓",
      tone: "text-success",
      sub: "Đã có kết luận xử lý",
    },
  ];
  const subjectTypes: readonly AdminSubjectType[] = [
    "event",
    "organizer",
    "user",
    "order",
    "ticket",
    "resale",
    "refund",
    "payout",
  ];
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow={subjectTypeFilter ? "RESALE" : "KIỂM DUYỆT"}
        title={subjectTypeFilter ? "Khiếu nại resale" : "Báo cáo & vụ việc"}
      >
        {subjectTypeFilter
          ? "Tiếp nhận và xử lý khiếu nại liên quan đến tin đăng, vé và giao dịch resale."
          : "Quản lý hàng đợi chung cho sự kiện, tài khoản, giao dịch và resale."}
      </AdminPageHeader>
      {subjectTypeFilter === "resale" ? (
        <>
          <ResaleSectionTabs
            activeTab="complaints"
            navigate={(path) => navigate(path)}
          />
          <ResaleStatsCards cards={resaleCards} loading={false} />
        </>
      ) : null}
      <AdminFilterToolbar
        query={query}
        status={status}
        statusOptions={caseStatusOptions}
        resultCount={cases.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2">
        <AdminSelect
          label="Mức độ"
          value={severity}
          onChange={setSeverity}
          values={[
            { value: "", label: "Tất cả mức độ" },
            ...["low", "medium", "high", "critical"].map((value) => ({
              value,
              label: statusLabel(value),
            })),
          ]}
        />
        {subjectTypeFilter ? null : (
          <AdminSelect
            label="Loại đối tượng"
            value={subjectType}
            onChange={setSubjectType}
            values={[
              { value: "", label: "Tất cả đối tượng" },
              ...subjectTypes.map((value) => ({ value, label: value })),
            ]}
          />
        )}
      </div>
      <AdminDataTable
        label={
          subjectTypeFilter ? "Danh sách khiếu nại resale" : "Danh sách vụ việc"
        }
        headers={["Tóm tắt", "Đối tượng", "Mức độ", "Trạng thái"]}
        rows={cases.map((item) => ({
          key: item.id,
          cells: [
            item.summary,
            item.subjectType,
            <AdminStatusBadge
              key="severity"
              label={statusLabel(item.severity)}
              tone={tone(item.severity)}
            />,
            <AdminStatusBadge
              key="status"
              label={statusLabel(item.status)}
              tone={tone(item.status)}
            />,
          ],
          onOpen: () => navigate(`/admin/cases/${encodeURIComponent(item.id)}`),
        }))}
      />
    </div>
  );
}
