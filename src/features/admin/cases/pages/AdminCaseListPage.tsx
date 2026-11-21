import { useMemo, useState } from 'react';
import { filterAdminCases } from '../../helpers/filter-admin-records.ts';
import { adminStatusLabel as statusLabel, adminStatusTone as tone } from '../../helpers/admin-display.ts';
import type { AdminWorkspaceController } from '../../hooks/admin-workspace-controller.ts';
import type { AdminSubjectType } from '../../types/admin-records.ts';
import { AdminDataTable } from '../../components/AdminDataTable.tsx';
import { AdminFilterToolbar, AdminPageHeader, AdminStatusBadge } from '../../components/AdminCommon.tsx';

const caseStatusOptions = ['open', 'investigating', 'waiting_for_information', 'resolved', 'dismissed'].map((value) => ({ value, label: statusLabel(value) }));
import { AdminSelect } from '../../components/AdminSelect.tsx';

export function AdminCaseListPage({
  controller,
  navigate,
}: {
  readonly controller: AdminWorkspaceController;
  readonly navigate: (path: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [severity, setSeverity] = useState("");
  const [subjectType, setSubjectType] = useState("");
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
      <AdminPageHeader eyebrow="KIá»‚M DUYá»†T" title="BÃ¡o cÃ¡o & vá»¥ viá»‡c">
        Quáº£n lÃ½ hÃ ng Ä‘á»£i chung cho sá»± kiá»‡n, tÃ i khoáº£n, giao dá»‹ch vÃ  resale.
      </AdminPageHeader>
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
          label="Má»©c Ä‘á»™"
          value={severity}
          onChange={setSeverity}
          values={[
            { value: "", label: "Táº¥t cáº£ má»©c Ä‘á»™" },
            ...["low", "medium", "high", "critical"].map((value) => ({
              value,
              label: statusLabel(value),
            })),
          ]}
        />
        <AdminSelect
          label="Loáº¡i Ä‘á»‘i tÆ°á»£ng"
          value={subjectType}
          onChange={setSubjectType}
          values={[
            { value: "", label: "Táº¥t cáº£ Ä‘á»‘i tÆ°á»£ng" },
            ...subjectTypes.map((value) => ({ value, label: value })),
          ]}
        />
      </div>
      <AdminDataTable
        label="Danh sÃ¡ch vá»¥ viá»‡c"
        headers={["TÃ³m táº¯t", "Äá»‘i tÆ°á»£ng", "Má»©c Ä‘á»™", "Tráº¡ng thÃ¡i"]}
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
