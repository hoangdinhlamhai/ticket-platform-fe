import { useState } from 'react';
import { adminStatusLabel as statusLabel, adminStatusTone as tone, formatAdminMoney as money } from '../../helpers/admin-display.ts';
import type { AdminSensitiveOperation } from '../../helpers/admin-transitions.ts';
import type { AdminWorkspaceController } from '../../hooks/admin-workspace-controller.ts';
import type { AdminReviewDecision } from '../../types/admin-records.ts';
import { AdminPageHeader, AdminStatusBadge } from '../../components/AdminCommon.tsx';
import { AdminSensitiveDecisionDialog, type AdminDecision } from '../../components/AdminSensitiveDecisionDialog.tsx';
import { AdminMissingRecord } from '../../components/AdminMissingRecord.tsx';

export function AdminEventReviewDetailPage({
  controller,
  eventId,
  navigate,
}: {
  readonly controller: AdminWorkspaceController;
  readonly eventId: string;
  readonly navigate: (path: string) => void;
}) {
  const event = controller.workspace.events.find((item) => item.id === eventId);
  const [decision, setDecision] = useState<AdminDecision | null>(null);
  if (!event)
    return (
      <AdminMissingRecord title="Không tìm thấy sự kiện" navigate={navigate} />
    );
  const organizer = controller.workspace.organizers.find(
    (item) => item.id === event.organizerId,
  );
  const decide = (review: AdminReviewDecision) => {
    const config =
      review === "approved"
        ? [
            "Duyệt sự kiện",
            "Sự kiện sẽ chuyển sang trạng thái đã duyệt.",
            "Duyệt",
            "approve_event",
          ]
        : review === "changes_requested"
          ? [
              "Yêu cầu chỉnh sửa",
              "Organizer cần nhận lý do chỉnh sửa cụ thể.",
              "Gửi yêu cầu",
              "request_event_changes",
            ]
          : [
              "Từ chối sự kiện",
              "Quyết định từ chối cần lý do rõ ràng.",
              "Từ chối",
              "reject_event",
            ];
    setDecision({
      title: config[0],
      description: config[1],
      confirm: config[2],
      operation: config[3] as AdminSensitiveOperation,
      submit: (reason) => controller.reviewEvent(event.id, review, reason),
    });
  };
  return (
    <div className="grid gap-6">
      <AdminPageHeader
        eyebrow="KIỂM DUYỆT / CHI TIẾT"
        title={event.title}
        actions={
          <button
            className="min-h-11 rounded border border-line px-4 font-bold"
            type="button"
            onClick={() => navigate("/admin/events/review")}
          >
            Quay lại danh sách
          </button>
        }
      >
        Organizer: {organizer?.name ?? "Đối tượng không còn khả dụng"} ·{" "}
        {event.city} · {new Date(event.startsAt).toLocaleString("vi-VN")}
      </AdminPageHeader>
      <section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2">
        <div>
          <h2 className="mt-0 text-xl font-extrabold">
            Tổng quan & chính sách
          </h2>
          <p>{event.policy}</p>
          <p>
            <strong>Địa điểm:</strong> {event.venue}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            <AdminStatusBadge
              label={statusLabel(event.reviewStatus)}
              tone={tone(event.reviewStatus)}
            />
          </p>
        </div>
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Organizer & rủi ro</h2>
          <p>
            <strong>Xác minh:</strong>{" "}
            {organizer
              ? statusLabel(organizer.verificationStatus)
              : "Không còn khả dụng"}
          </p>
          <p>
            <strong>Tài khoản:</strong>{" "}
            {organizer
              ? statusLabel(organizer.accountStatus)
              : "Không còn khả dụng"}
          </p>
          <ul>
            {event.riskFlags.length ? (
              event.riskFlags.map((flag) => <li key={flag}>{flag}</li>)
            ) : (
              <li>Không có cờ rủi ro trong fixture.</li>
            )}
          </ul>
        </div>
      </section>
      <section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2">
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Hạng vé & sức chứa</h2>
          <ul>
            {event.ticketTiers.map((tier) => (
              <li key={tier.id}>
                {tier.name}: {tier.soldCount}/{tier.capacity} ·{" "}
                {money(tier.price)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Checklist xét duyệt</h2>
          <ul>
            <li>Đối chiếu chính sách hoàn vé.</li>
            <li>Kiểm tra thời gian, địa điểm và sức chứa.</li>
            <li>Rà soát trạng thái xác minh Organizer và cờ rủi ro.</li>
          </ul>
        </div>
      </section>
      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mt-0 text-xl font-extrabold">Lịch sử xét duyệt</h2>
        <ol>
          {event.reviewHistory.map((item) => (
            <li key={item.id}>
              {item.decision
                ? `${statusLabel(item.decision)} — ${item.reason ?? "Không có ghi chú"}`
                : "Đã gửi xét duyệt"}{" "}
              ·{" "}
              {new Date(item.reviewedAt ?? item.submittedAt).toLocaleString(
                "vi-VN",
              )}
            </li>
          ))}
        </ol>
      </section>
      {event.reviewStatus === "pending_review" && (
        <div className="sticky bottom-3 flex flex-wrap gap-3 rounded-lg border border-line bg-paper p-4 shadow-lg">
          <button
            className="min-h-11 rounded bg-mint px-4 font-extrabold text-success"
            type="button"
            onClick={() => decide("approved")}
          >
            Duyệt
          </button>
          <button
            className="min-h-11 rounded border border-coral px-4 font-extrabold text-coral-dark"
            type="button"
            onClick={() => decide("changes_requested")}
          >
            Yêu cầu chỉnh sửa
          </button>
          <button
            className="min-h-11 rounded bg-error px-4 font-extrabold text-paper"
            type="button"
            onClick={() => decide("rejected")}
          >
            Từ chối
          </button>
        </div>
      )}
      <AdminSensitiveDecisionDialog decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}
