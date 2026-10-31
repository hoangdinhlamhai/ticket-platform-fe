import { useState } from "react";
import type { AdminRefund } from "../types/admin-refund.ts";

type RefundAction = "APPROVED" | "REJECTED" | "RETRY";

type Props = {
  refund: AdminRefund;
  actionError: string;
  isWorking: boolean;
  onBack: () => void;
  onAction: (action: RefundAction, reason: string) => Promise<void>;
};

function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(value: string | null) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function RefundAdminDetailCard({
  refund,
  actionError,
  isWorking,
  onBack,
  onAction,
}: Props) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState("");
  const canDecide = refund.status === "PENDING";
  const canRetry = refund.status === "FAILED";

  const submitAction = (action: RefundAction) => {
    if (!reason.trim()) {
      setValidationError("Nhập lý do xử lý trước khi tiếp tục.");
      return;
    }
    setValidationError("");
    void onAction(action, reason.trim());
  };

  return (
    <section className="grid gap-5" aria-labelledby="refund-detail-title">
      <button
        className="min-h-11 justify-self-start font-bold text-blue-deep underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
        type="button"
        onClick={onBack}
      >
        ← Quay lại danh sách
      </button>

      <article className="rounded-lg border border-line bg-surface p-5 sm:p-7">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-extrabold uppercase tracking-[0.1em] text-coral-dark">
              Chi tiết refund
            </p>
            <h1
              id="refund-detail-title"
              className="mt-2 mb-0 break-all font-body text-3xl font-extrabold tracking-[-0.06em] text-pine"
            >
              {refund.id}
            </h1>
          </div>
          <span className="rounded-sm border border-line bg-paper-deep px-3 py-2 text-sm font-extrabold">
            {refund.status}
          </span>
        </header>

        <div className="mt-6 grid gap-5 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <h2 className="m-0 text-sm font-extrabold">Đơn hàng và sự kiện</h2>
            <p className="mt-2 mb-0 text-sm leading-6">
              {refund.order.event.title}
            </p>
            <p className="mt-1 mb-0 break-all text-xs text-ink-soft">
              Order {refund.order.id} · trạng thái {refund.order.status}
            </p>
          </div>
          <div>
            <h2 className="m-0 text-sm font-extrabold">Khách hàng</h2>
            <p className="mt-2 mb-0 text-sm">{refund.order.user.fullName}</p>
            <p className="mt-1 mb-0 break-all text-xs text-ink-soft">
              {refund.order.user.email}
            </p>
          </div>
          <div>
            <h2 className="m-0 text-sm font-extrabold">Số tiền hoàn</h2>
            <p className="mt-2 mb-0 text-xl font-extrabold text-blue-deep">
              {formatMoney(refund.amount)}
            </p>
          </div>
          <div>
            <h2 className="m-0 text-sm font-extrabold">Thời gian</h2>
            <p className="mt-2 mb-0 text-sm text-ink-soft">
              Gửi: {formatDate(refund.createdAt)}
            </p>
            <p className="mt-1 mb-0 text-sm text-ink-soft">
              Quyết định: {formatDate(refund.decidedAt)}
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-md bg-paper-deep p-4">
          <h2 className="m-0 text-sm font-extrabold">Lý do khách yêu cầu</h2>
          <p className="mt-2 mb-0 text-sm leading-6">{refund.reason}</p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <p className="m-0 text-sm leading-6">
            <span className="font-bold">Kênh thanh toán: </span>
            {refund.payment?.provider ?? "Không có dữ liệu"}
          </p>
          <p className="m-0 break-all text-sm leading-6">
            <span className="font-bold">Payment request ID: </span>
            {refund.payment?.paymentRequestId ?? "Không có dữ liệu"}
          </p>
          <p className="m-0 break-all text-sm leading-6">
            <span className="font-bold">Xendit refund ID: </span>
            {refund.providerRefundId ?? "Chưa có"}
          </p>
          <p className="m-0 text-sm leading-6">
            <span className="font-bold">Thanh toán lúc: </span>
            {formatDate(refund.payment?.paidAt ?? null)}
          </p>
        </div>

        {refund.decisionReason || refund.failureReason ? (
          <div className="mt-5 rounded-md border border-line p-4">
            <h2 className="m-0 text-sm font-extrabold">Ghi chú xử lý</h2>
            {refund.decisionReason ? (
              <p className="mt-2 mb-0 text-sm leading-6">
                {refund.decisionReason}
              </p>
            ) : null}
            {refund.failureReason ? (
              <p className="mt-2 mb-0 text-sm leading-6 text-error">
                {refund.failureReason}
              </p>
            ) : null}
          </div>
        ) : null}
      </article>

      {canDecide || canRetry ? (
        <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
          <h2 className="m-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-pine">
            {canRetry ? "Thử lại refund" : "Quyết định yêu cầu"}
          </h2>
          <label
            className="mt-4 block text-sm font-bold"
            htmlFor="refund-admin-reason"
          >
            Lý do xử lý
          </label>
          <textarea
            id="refund-admin-reason"
            className="mt-2 min-h-24 w-full rounded-md border border-line bg-paper px-3 py-3 text-base leading-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
            maxLength={1000}
            value={reason}
            disabled={isWorking}
            aria-invalid={Boolean(validationError || actionError)}
            aria-describedby={
              validationError || actionError ? "refund-admin-error" : undefined
            }
            onChange={(event) => setReason(event.target.value)}
          />
          {validationError || actionError ? (
            <p
              id="refund-admin-error"
              className="mt-2 mb-0 text-sm font-semibold text-error"
              role="alert"
            >
              {validationError || actionError}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3">
            {canDecide ? (
              <>
                <button
                  className="min-h-11 rounded-md bg-mint px-4 text-sm font-extrabold text-success disabled:opacity-50"
                  type="button"
                  disabled={isWorking}
                  onClick={() => submitAction("APPROVED")}
                >
                  {isWorking ? "Đang xử lý…" : "Duyệt và gửi Xendit"}
                </button>
                <button
                  className="min-h-11 rounded-md border border-error/40 bg-error/10 px-4 text-sm font-extrabold text-error disabled:opacity-50"
                  type="button"
                  disabled={isWorking}
                  onClick={() => submitAction("REJECTED")}
                >
                  Từ chối yêu cầu
                </button>
              </>
            ) : (
              <button
                className="min-h-11 rounded-md bg-coral px-4 text-sm font-extrabold text-paper disabled:opacity-50"
                type="button"
                disabled={isWorking}
                onClick={() => submitAction("RETRY")}
              >
                {isWorking ? "Đang gửi lại…" : "Gửi lại tới Xendit"}
              </button>
            )}
          </div>
        </section>
      ) : null}
    </section>
  );
}
