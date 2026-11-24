import type { AdminPath } from "../../../../routes/admin-route.ts";
import type {
  ResaleTransaction,
  ResalePayoutBankAccount,
} from "../../api/adminApi.ts";
import {
  date,
  money,
  paymentLabels,
  payoutLabels,
  renderPaymentValue,
  renderPayoutValue,
  statusStyle,
  statusText,
} from "../helpers/resale-transaction-format.ts";
import { resalePayoutFailureReasons } from "../../../resale/helpers/resale-payout-domain.ts";

const label = (name: string, value: unknown) => (
  <div>
    <dt className="text-sm text-ink-soft">{name}</dt>
    <dd className="mt-1 break-all font-semibold">
      {value == null || value === ""
        ? "\u2014"
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value)}
    </dd>
  </div>
);

type Props = {
  transactionId: string;
  detail: ResaleTransaction | null;
  detailId: string | null;
  error: string;
  navigate: (path: AdminPath) => void;
  bankAccounts: ResalePayoutBankAccount[];
  bankAccountId: string;
  setBankAccountId: (id: string) => void;
  retrying: boolean;
  retryMessage: string;
  retryPayout: () => Promise<void>;
  restrictedFailure: boolean;
};

export function ResaleTransactionDetail({
  transactionId,
  detail,
  detailId,
  error,
  navigate,
  bankAccounts,
  bankAccountId,
  setBankAccountId,
  retrying,
  retryMessage,
  retryPayout,
  restrictedFailure,
}: Props) {
  return (
    <section className="grid gap-5">
      <button
        className="w-fit text-sm font-bold text-primary"
        onClick={() => navigate("/admin/resale/transactions")}
      >
        ← Danh sách giao dịch
      </button>
      <h1 className="text-3xl font-extrabold">Chi tiết giao dịch resale</h1>
      {error && (
        <p
          role="alert"
          className="rounded border border-error bg-error/10 p-4 text-error"
        >
          {error}
        </p>
      )}
      {!detail || detailId !== transactionId ? (
        <p role="status">
          {error ? "Không tải được dữ liệu." : "Đang tải chi tiết…"}
        </p>
      ) : (
        <>
          <section className="grid gap-5 rounded-lg border border-line bg-surface p-5">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-ink-soft">Mã giao dịch</p>
                <h2 className="font-mono text-xl font-bold">
                  {detail.maGiaoDich}
                </h2>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-sm font-bold ${statusStyle[detail.status] ?? "bg-surface text-ink"}`}
              >
                {statusText[detail.status] ?? detail.status}
              </span>
            </header>
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {label(
                "Sự kiện",
                detail.event?.title ??
                  detail.event?.tieuDe ??
                  detail.eventTitle ??
                  detail.suKien?.tieuDe ??
                  detail.listing?.event?.title,
              )}
              {label(
                "Mã vé",
                detail.ticket?.code ??
                  detail.ticket?.id ??
                  detail.listing?.ticket?.ticketCode,
              )}
              {label(
                "Loại vé / ghế",
                detail.ticket
                  ? `${detail.ticket.type}${detail.ticket.seat ? ` · ${detail.ticket.seat}` : ""}`
                  : undefined,
              )}
              {label(
                "Người bán",
                `${detail.seller?.hoTen ?? detail.seller?.fullName ?? detail.listing?.seller?.fullName ?? "—"} · ${detail.seller?.email ?? detail.listing?.seller?.email ?? "—"}`,
              )}
              {label(
                "Người mua",
                `${detail.buyer?.hoTen ?? detail.buyer?.fullName ?? "—"} · ${detail.buyer?.email ?? "—"}`,
              )}
              {label("Giá bán", money(detail.price))}
              {label("Tổng thanh toán", money(detail.amount))}
              {label("Tạo lúc", date(detail.createdAt))}
            </dl>
          </section>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border border-line bg-surface p-5">
              <h2 className="mb-4 text-lg font-bold">Thanh toán</h2>
              <dl className="grid gap-4">
                {Object.entries(detail.payment).map(([key, value]) =>
                  label(
                    paymentLabels[key] ?? key,
                    renderPaymentValue(key, value),
                  ),
                )}
              </dl>
            </section>
            <section className="rounded-lg border border-line bg-surface p-5">
              <h2 className="mb-4 text-lg font-bold">Chi trả</h2>
              <dl className="grid gap-4">
                {Object.entries(detail.payout)
                  .filter(
                    ([key]) =>
                      !["recipient", "attempts", "failureReason"].includes(key),
                  )
                  .map(([key, value]) =>
                    label(
                      payoutLabels[key] ?? key,
                      renderPayoutValue(key, value),
                    ),
                  )}
                {label(
                  "Lý do thất bại",
                  resalePayoutFailureReasons[detail.payout.failureCode ?? ""] ??
                    detail.payout.failureReason,
                )}
              </dl>
            </section>
          </div>
          {detail.payout.status === "FAILED" ||
          detail.payout.status === "REVERSED" ? (
            <section className="grid gap-3 rounded-lg border border-line bg-surface p-5">
              <h2 className="m-0 text-lg font-bold">Xử lý payout thất bại</h2>
              <p className="m-0 text-sm text-ink-soft">
                {detail.payout.failureCode
                  ? `Mã lỗi: ${detail.payout.failureCode}. `
                  : ""}
                {typeof detail.payout.failureReason === "string"
                  ? detail.payout.failureReason
                  : "Không có chi tiết từ Xendit."}
              </p>
              {detail.payout.updatedAt ? (
                <p className="m-0 text-sm text-ink-soft">
                  Cập nhật lúc: {date(detail.payout.updatedAt)}
                </p>
              ) : null}
              {restrictedFailure ? (
                <p className="m-0 font-semibold text-error">
                  Payout cần Admin xử lý theo quy trình tuân thủ; không thể
                  retry hoặc đổi tài khoản.
                </p>
              ) : (
                <div className="flex flex-wrap items-end gap-3">
                  <label className="grid gap-1 text-sm font-semibold">
                    Tài khoản nhận payout
                    <select
                      className="min-h-11 min-w-64 rounded border border-line bg-surface px-3"
                      value={bankAccountId}
                      onChange={(event) => setBankAccountId(event.target.value)}
                    >
                      {bankAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} · {account.accountNumber} ·{" "}
                          {account.accountHolder}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="min-h-11 rounded-md bg-coral px-4 font-extrabold text-paper disabled:opacity-50"
                    type="button"
                    disabled={retrying || !bankAccountId}
                    onClick={() => void retryPayout()}
                  >
                    {retrying ? "Đang gửi…" : "Retry payout"}
                  </button>
                </div>
              )}
              {retryMessage ? (
                <p className="m-0 text-sm" role="status">
                  {retryMessage}
                </p>
              ) : null}
            </section>
          ) : null}
          <section className="rounded-lg border border-line bg-surface p-5">
            <h2 className="mb-4 text-lg font-bold">
              Lịch sử chuyển quyền sở hữu vé
            </h2>
            {detail.ownershipHistory.length ? (
              <ol className="grid gap-3">
                {detail.ownershipHistory.map((item) => (
                  <li key={item.id} className="border-l-2 border-primary pl-4">
                    <p className="font-semibold">
                      {item.owner.hoTen} · {item.owner.email}
                    </p>
                    <p className="text-sm text-ink-soft">
                      Nhận: {date(item.receivedAt)} · Trả:{" "}
                      {date(item.returnedAt)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-ink-soft">Chưa có lịch sử.</p>
            )}
          </section>
        </>
      )}
    </section>
  );
}
