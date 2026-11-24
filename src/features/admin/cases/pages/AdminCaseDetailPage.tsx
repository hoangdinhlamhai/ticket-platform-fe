import { useState } from "react";
import {
  adminStatusLabel as statusLabel,
  adminStatusTone as tone,
} from "../../helpers/admin-display.ts";
import type { AdminWorkspaceController } from "../../hooks/admin-workspace-controller.ts";
import { shouldUseClientNavigation } from "../../../../routes/client-navigation.ts";
import type { AdminCase, AdminSubjectType } from "../../types/admin-records.ts";
import {
  AdminPageHeader,
  AdminStatusBadge,
} from "../../components/AdminCommon.tsx";
import {
  AdminSensitiveDecisionDialog,
  type AdminDecision,
} from "../../components/AdminSensitiveDecisionDialog.tsx";
import { AdminMissingRecord } from "../../components/AdminMissingRecord.tsx";

function adminCaseSubjectPath(
  workspace: AdminWorkspaceController["workspace"],
  item: AdminCase,
): string | null {
  const records: Record<AdminSubjectType, readonly { id: string }[]> = {
    event: workspace.events,
    organizer: workspace.organizers,
    user: workspace.users,
    order: workspace.orders,
    ticket: workspace.tickets,
    resale: workspace.resales,
    refund: workspace.refunds,
    payout: workspace.payouts,
  };
  if (!records[item.subjectType].some((record) => record.id === item.subjectId))
    return null;
  if (item.subjectType === "event")
    return `/admin/events/${encodeURIComponent(item.subjectId)}/review`;
  if (item.subjectType === "organizer") return "/admin/users";
  if (item.subjectType === "user") return "/admin/users";
  if (item.subjectType === "order") return "/admin/orders";
  if (item.subjectType === "ticket") return "/admin/tickets";
  if (item.subjectType === "resale") return "/admin/resale";
  if (item.subjectType === "refund") return "/admin/refunds";
  return "/admin/payouts";
}

export function AdminCaseDetailPage({
  controller,
  caseId,
  navigate,
}: {
  readonly controller: AdminWorkspaceController;
  readonly caseId: string;
  readonly navigate: (path: string) => void;
}) {
  const item = controller.workspace.cases.find(
    (caseItem) => caseItem.id === caseId,
  );
  const [decision, setDecision] = useState<AdminDecision | null>(null);
  if (!item)
    return (
      <AdminMissingRecord title="Không tìm thấy vụ việc" navigate={navigate} />
    );
  const terminal = item.status === "resolved" || item.status === "dismissed";
  const subjectPath = adminCaseSubjectPath(controller.workspace, item);
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="VỤ VIỆC / CHI TIẾT"
        title={item.summary}
        actions={
          <button
            className="min-h-11 rounded border border-line px-4 font-bold"
            type="button"
            onClick={() =>
              navigate(
                item.subjectType === "resale"
                  ? "/admin/resale/complaints"
                  : "/admin/cases",
              )
            }
          >
            Quay lại danh sách
          </button>
        }
      >
        Người báo cáo: {item.reporter} · {item.category} ·{" "}
        <AdminStatusBadge
          label={statusLabel(item.severity)}
          tone={tone(item.severity)}
        />
      </AdminPageHeader>
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mt-0 text-xl font-extrabold">Đối tượng liên quan</h2>
        <p>
          {subjectPath ? (
            <a
              className="font-bold text-blue-deep underline"
              href={subjectPath}
              onClick={(event) => {
                if (!shouldUseClientNavigation(event)) return;
                event.preventDefault();
                navigate(subjectPath);
              }}
            >
              {item.subjectType}: {item.subjectId}
            </a>
          ) : (
            "Đối tượng không còn khả dụng"
          )}
        </p>
        <h2 className="text-xl font-extrabold">Bằng chứng</h2>
        <ul>
          {item.evidence.map((evidence) => (
            <li key={evidence}>{evidence}</li>
          ))}
        </ul>
      </section>
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mt-0 text-xl font-extrabold">Timeline</h2>
        <ol>
          {item.timeline.map((entry) => (
            <li key={entry.id}>
              {entry.message} ·{" "}
              {new Date(entry.occurredAt).toLocaleString("vi-VN")}
            </li>
          ))}
        </ol>
      </section>
      {!terminal && (
        <div className="flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded border border-blue px-4 font-bold text-blue-deep"
            type="button"
            onClick={() =>
              controller.updateCaseStatus(item.id, "investigating", "")
            }
          >
            Đang điều tra
          </button>
          <button
            className="min-h-11 rounded border border-blue px-4 font-bold text-blue-deep"
            type="button"
            onClick={() =>
              controller.updateCaseStatus(
                item.id,
                "waiting_for_information",
                "",
              )
            }
          >
            Chờ thông tin
          </button>
          <button
            className="min-h-11 rounded bg-mint px-4 font-extrabold text-success"
            type="button"
            onClick={() =>
              setDecision({
                title: "Giải quyết vụ việc",
                description: "Ghi chú xử lý là bắt buộc.",
                confirm: "Giáº£i quyáº¿t",
                operation: "resolve_case",
                submit: (reason) =>
                  controller.updateCaseStatus(item.id, "resolved", reason),
              })
            }
          >
            Giáº£i quyáº¿t
          </button>
          <button
            className="min-h-11 rounded bg-error px-4 font-extrabold text-paper"
            type="button"
            onClick={() =>
              setDecision({
                title: "Bác bỏ vụ việc",
                description: "Ghi chú xử lý là bắt buộc.",
                confirm: "Bác bỏ",
                operation: "dismiss_case",
                submit: (reason) =>
                  controller.updateCaseStatus(item.id, "dismissed", reason),
              })
            }
          >
            Bác bỏ
          </button>
        </div>
      )}
      <AdminSensitiveDecisionDialog
        decision={decision}
        onClose={() => setDecision(null)}
      />
    </div>
  );
}
