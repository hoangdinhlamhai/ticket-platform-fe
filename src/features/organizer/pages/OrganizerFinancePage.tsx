import { useEffect, useMemo, useState } from "react";
import { findMine } from "../api/organizerPayoutApi.ts";
import { OrganizerFinanceSummary } from "../components/OrganizerFinanceSummary.tsx";
import { OrganizerPageHeader } from "../components/OrganizerPageHeader.tsx";
import { OrganizerPayoutTable } from "../components/OrganizerPayoutTable.tsx";
import { selectOrganizerFinanceSummary } from "../helpers/select-organizer-metrics.ts";
import type { OrganizerWorkspace } from "../types/organizer-workspace.ts";

type Props = { workspace: OrganizerWorkspace };

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export function OrganizerFinancePage({ workspace }: Props) {
  const [livePayouts, setLivePayouts] = useState<
    OrganizerWorkspace["payouts"] | null
  >(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadPayouts() {
      try {
        const { data } = await findMine();
        if (!active) return;
        setLivePayouts(
          data.payouts.map((payout) => ({
            id: payout.id,
            eventId: payout.event.id,
            eventTitle: payout.event.title,
            amount: Number(payout.amount),
            status:
              payout.status as OrganizerWorkspace["payouts"][number]["status"],
            scheduledAt: payout.createdAt,
            paidAt: payout.completedAt,
            grossAmount:
              payout.grossAmount === null
                ? undefined
                : Number(payout.grossAmount),
            refundAmount:
              payout.refundAmount === null
                ? undefined
                : Number(payout.refundAmount),
            platformFee:
              payout.platformFee === null
                ? undefined
                : Number(payout.platformFee),
            paymentFee:
              payout.paymentFee === null
                ? undefined
                : Number(payout.paymentFee),
          })),
        );
      } catch {
        if (active) setPayoutError("Không thể tải lịch sử chi trả từ máy chủ.");
      }
    }

    void loadPayouts();
    return () => {
      active = false;
    };
  }, []);

  const summary = useMemo(
    () => selectOrganizerFinanceSummary(workspace),
    [workspace],
  );
  const refunds = [...workspace.refunds].sort(
    (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
  );

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <OrganizerPageHeader eyebrow="TÀI CHÍNH TỔ CHỨC" title="Tài chính">
        <p>
          Tổng quan và hoàn tiền hiện dùng dữ liệu mô phỏng; lịch sử chi trả bên
          dưới lấy từ tài khoản thật và chỉ đọc.
        </p>
      </OrganizerPageHeader>
      <OrganizerFinanceSummary
        summary={summary}
        pendingPayoutAmount={
          livePayouts
            ?.filter(
              (payout) =>
                payout.status === "PENDING_APPROVAL" ||
                payout.status === "PROCESSING",
            )
            .reduce((total, payout) => total + payout.amount, 0) ?? 0
        }
      />
      <section
        className="rounded-lg border border-line bg-surface p-5"
        aria-labelledby="refund-heading"
      >
        <h2 id="refund-heading" className="m-0 text-xl font-extrabold">
          Hoàn tiền đã ghi nhận
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Tổng hoàn tiền: <strong>{money(summary.refundTotal)}</strong>
        </p>
        {refunds.length ? (
          <ul className="mt-4 divide-y divide-line p-0">
            {refunds.map((refund) => (
              <li className="py-4" key={refund.id}>
                <strong>{money(refund.amount)}</strong>
                <span className="ml-2 text-sm text-ink-soft">
                  {refund.reason}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">Chưa có khoản hoàn tiền.</p>
        )}
      </section>
      <OrganizerPayoutTable
        events={workspace.events}
        payouts={livePayouts ?? []}
      />
      {payoutError && (
        <p role="alert" className="text-sm text-error">
          {payoutError}
        </p>
      )}
    </div>
  );
}
