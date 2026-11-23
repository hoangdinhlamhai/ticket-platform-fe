import { useState } from 'react';
import { adminStatusLabel as statusLabel, adminStatusTone as tone } from '../../helpers/admin-display.ts';
import type { AdminWorkspaceController } from '../../hooks/admin-workspace-controller.ts';
import { shouldUseClientNavigation } from '../../../../routes/client-navigation.ts';
import type { AdminCase, AdminSubjectType } from '../../types/admin-records.ts';
import { AdminPageHeader, AdminStatusBadge } from '../../components/AdminCommon.tsx';
import { AdminSensitiveDecisionDialog, type AdminDecision } from '../../components/AdminSensitiveDecisionDialog.tsx';
import { AdminMissingRecord } from '../../components/AdminMissingRecord.tsx';

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
      <AdminMissingRecord title="KhÃ´ng tÃ¬m tháº¥y vá»¥ viá»‡c" navigate={navigate} />
    );
  const terminal = item.status === "resolved" || item.status === "dismissed";
  const subjectPath = adminCaseSubjectPath(controller.workspace, item);
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="Vá»¤ VIá»†C / CHI TIáº¾T"
        title={item.summary}
        actions={
          <button
            className="min-h-11 rounded border border-line px-4 font-bold"
            type="button"
            onClick={() => navigate("/admin/cases")}
          >
            Quay láº¡i danh sÃ¡ch
          </button>
        }
      >
        NgÆ°á»i bÃ¡o cÃ¡o: {item.reporter} Â· {item.category} Â·{" "}
        <AdminStatusBadge
          label={statusLabel(item.severity)}
          tone={tone(item.severity)}
        />
      </AdminPageHeader>
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mt-0 text-xl font-extrabold">Äá»‘i tÆ°á»£ng liÃªn quan</h2>
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
            "Äá»‘i tÆ°á»£ng khÃ´ng cÃ²n kháº£ dá»¥ng"
          )}
        </p>
        <h2 className="text-xl font-extrabold">Báº±ng chá»©ng</h2>
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
              {entry.message} Â·{" "}
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
            Äang Ä‘iá»u tra
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
            Chá» thÃ´ng tin
          </button>
          <button
            className="min-h-11 rounded bg-mint px-4 font-extrabold text-success"
            type="button"
            onClick={() =>
              setDecision({
                title: "Giáº£i quyáº¿t vá»¥ viá»‡c",
                description: "Ghi chÃº xá»­ lÃ½ lÃ  báº¯t buá»™c.",
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
                title: "BÃ¡c bá» vá»¥ viá»‡c",
                description: "Ghi chÃº xá»­ lÃ½ lÃ  báº¯t buá»™c.",
                confirm: "BÃ¡c bá»",
                operation: "dismiss_case",
                submit: (reason) =>
                  controller.updateCaseStatus(item.id, "dismissed", reason),
              })
            }
          >
            BÃ¡c bá»
          </button>
        </div>
      )}
      <AdminSensitiveDecisionDialog decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}
