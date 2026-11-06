import type { AdminPayout } from "../types/admin-payout.ts";

type Props = {
  payout: AdminPayout;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  isWorking: boolean;
};

function formatMoney(amount: string | number, currency: string) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("vi-VN");
}

function payoutStatusLabel(status: string) {
  return status === "PENDING_APPROVAL" ? "Chờ duyệt" : status;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="m-0 mt-1 font-bold">{value || "—"}</dd>
    </div>
  );
}

export function PayoutDetail({
  payout,
  onBack,
  onApprove,
  onReject,
  isWorking,
}: Props) {
  const canApprove = Boolean(
    payout.bankAccount?.accountNumber &&
    payout.bankAccount.recipientCity &&
    payout.bankAccount.recipientAddress &&
    payout.bankAccount.bankCode &&
    (/^[A-Z0-9]{8}([A-Z0-9]{3})?$/i.test(payout.bankAccount.bankCode) ||
      payout.bankAccount.bankCode.toUpperCase() === "VCB"),
  );

  return (
    <section className="grid gap-6">
      <header>
        <button
          className="min-h-10 font-bold text-blue-deep underline"
          type="button"
          onClick={onBack}
        >
          ← Danh sách payout
        </button>
        <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-coral-dark">
          Chi tiết payout
        </p>
        <h1 className="mt-1 break-all text-3xl font-extrabold">{payout.id}</h1>
      </header>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="m-0 text-xl font-extrabold">Thông tin payout</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail
            label="Số tiền"
            value={formatMoney(payout.amount, payout.currency)}
          />
          <Detail label="Trạng thái" value={payoutStatusLabel(payout.status)} />
          <Detail label="Ngày tạo" value={formatDate(payout.createdAt)} />
        </dl>
      </section>

      {payout.breakdown?.grossAmount !== null &&
        payout.breakdown?.grossAmount !== undefined && (
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="m-0 text-xl font-extrabold">Đối soát payout</h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              <Detail
                label="Doanh thu thanh toán thành công"
                value={formatMoney(
                  payout.breakdown.grossAmount ?? 0,
                  payout.currency,
                )}
              />
              <Detail
                label="Refund đã hoàn tất"
                value={formatMoney(
                  payout.breakdown.refundAmount ?? 0,
                  payout.currency,
                )}
              />
              <Detail
                label="Phí nền tảng (5%)"
                value={formatMoney(
                  payout.breakdown.platformFee ?? 0,
                  payout.currency,
                )}
              />
              <Detail
                label="Phí thanh toán (1%)"
                value={formatMoney(
                  payout.breakdown.paymentFee ?? 0,
                  payout.currency,
                )}
              />
              <Detail
                label="Thực nhận"
                value={formatMoney(payout.amount, payout.currency)}
              />
            </dl>
          </section>
        )}

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="m-0 text-xl font-extrabold">Sự kiện</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Tên sự kiện" value={payout.event.title} />
          <Detail label="Mã sự kiện" value={payout.event.id} />
          <Detail label="Trạng thái sự kiện" value={payout.event.status} />
          <Detail label="Bắt đầu" value={formatDate(payout.event.startAt)} />
          <Detail label="Kết thúc" value={formatDate(payout.event.endAt)} />
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="m-0 text-xl font-extrabold">Organizer</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Họ tên" value={payout.organizer.fullName} />
          <Detail label="Email" value={payout.organizer.email} />
          <Detail label="Mã organizer" value={payout.organizer.id} />
        </dl>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="m-0 text-xl font-extrabold">Tài khoản nhận tiền</h2>
        {payout.bankAccount ? (
          <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <Detail
              label="Chủ tài khoản"
              value={payout.bankAccount.accountHolder}
            />
            <Detail
              label="Số tài khoản"
              value={payout.bankAccount.accountNumber}
            />
            <Detail label="Ngân hàng" value={payout.bankAccount.bankName} />
            <Detail
              label="Mã SWIFT/BIC"
              value={payout.bankAccount.bankCode ?? ""}
            />
            <Detail label="Chi nhánh" value={payout.bankAccount.branch} />
            <Detail
              label="Thành phố người nhận"
              value={payout.bankAccount.recipientCity ?? ""}
            />
            <Detail
              label="Địa chỉ người nhận"
              value={payout.bankAccount.recipientAddress ?? ""}
            />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            Chưa có thông tin tài khoản.
          </p>
        )}
      </section>

      {payout.status === "PENDING_APPROVAL" && (
        <section className="rounded-lg border border-line bg-surface p-5">
          {payout.failureReason && (
            <p className="mb-4 rounded border border-error/40 bg-error/10 p-3 text-sm text-error">
              Lần gửi trước thất bại: {payout.failureReason}
            </p>
          )}
          {!canApprove && (
            <p className="mb-4 text-sm text-error">
              Chưa thể gửi lệnh chi: cần số tài khoản, mã SWIFT/BIC hợp lệ và
              địa chỉ người nhận (thành phố, địa chỉ đường).
            </p>
          )}
          <div className="flex flex-wrap justify-end gap-3">
            <button
              className="min-h-11 rounded border border-error/40 px-4 font-extrabold text-error disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isWorking}
              onClick={onReject}
            >
              Từ chối payout
            </button>
            <button
              className="min-h-11 rounded bg-pine px-4 font-extrabold text-paper disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={isWorking || !canApprove}
              onClick={onApprove}
            >
              {isWorking ? "Đang gửi lệnh…" : "Gửi lệnh chi"}
            </button>
          </div>
        </section>
      )}
    </section>
  );
}
