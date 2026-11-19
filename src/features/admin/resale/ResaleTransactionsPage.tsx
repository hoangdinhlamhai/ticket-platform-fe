import { useEffect, useState } from "react";
import * as adminApi from "../api/adminApi.ts";
import type { ResaleTransaction } from "../api/adminApi.ts";
import type { AdminPath } from "../../../routes/admin-route.ts";
import {
  canRetryResalePayout,
  resalePayoutFailureReasons,
} from "../../resale/helpers/resale-payout-domain.ts";

type Props = {
  transactionId?: string | null;
  navigate: (path: AdminPath) => void;
};
const statuses = [
  "PENDING_PAYMENT",
  "PAID",
  "COMPLETED",
  "EXPIRED",
  "PAYMENT_FAILED",
];
const statusText: Record<string, string> = {
  PENDING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  COMPLETED: "Hoàn tất",
  EXPIRED: "Hết hạn",
  PAYMENT_FAILED: "Thanh toán thất bại",
};
const statusStyle: Record<string, string> = {
  COMPLETED: "bg-success/10 text-success",
  PAYMENT_FAILED: "bg-error/10 text-error",
  EXPIRED: "bg-surface text-ink-soft",
  PENDING_PAYMENT: "bg-warning/10 text-warning",
  PAID: "bg-info/10 text-info",
};
const money = (value: unknown) =>
  `${Number(value ?? 0).toLocaleString("vi-VN")} ₫`;
const date = (value: unknown) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(String(value)))
    : "—";
const paymentLabels: Record<string, string> = {
  id: "Mã thanh toán",
  status: "Trạng thái",
  amount: "Số tiền",
  currency: "Loại tiền",
  sessionId: "Mã phiên thanh toán",
  providerPaymentId: "Mã thanh toán từ nhà cung cấp",
  paymentRequestId: "Mã yêu cầu thanh toán",
  expiresAt: "Hết hạn lúc",
  paidAt: "Thanh toán lúc",
  createdAt: "Tạo lúc",
  updatedAt: "Cập nhật lúc",
};
const payoutLabels: Record<string, string> = {
  id: "Mã chi trả",
  status: "Trạng thái",
  amount: "Số tiền",
  currency: "Loại tiền",
  providerPayoutId: "Mã chi trả từ nhà cung cấp",
  referenceId: "Mã tham chiếu",
  bankAccountId: "Mã tài khoản ngân hàng",
  failureCode: "Mã lỗi payout",
  paidAt: "Chi trả lúc",
  createdAt: "Tạo lúc",
  updatedAt: "Cập nhật lúc",
};
const renderPaymentValue = (key: string, value: unknown) =>
  key.endsWith("At") ? date(value) : value;
const renderPayoutValue = (key: string, value: unknown) => {
  if (key.endsWith("At")) return date(value);
  if (key === "failureReason" && typeof value === "string") {
    const reasonCode = value.trim().toUpperCase();
    return resalePayoutFailureReasons[reasonCode] ?? value;
  }
  return value;
};
const label = (name: string, value: unknown) => (
  <div>
    <dt className="text-sm text-ink-soft">{name}</dt>
    <dd className="mt-1 break-all font-semibold">
      {value == null || value === ""
        ? "—"
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value)}
    </dd>
  </div>
);

export function ResaleTransactionsPage({ transactionId, navigate }: Props) {
  const [rows, setRows] = useState<readonly ResaleTransaction[]>([]);
  const [detail, setDetail] = useState<ResaleTransaction | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankAccounts, setBankAccounts] = useState<
    adminApi.ResalePayoutBankAccount[]
  >([]);
  const [bankAccountId, setBankAccountId] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await adminApi.findResaleTransactions({
          q,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          pageSize,
        });
        if (active) {
          setRows(result.data.transactions);
          setTotal(result.data.total);
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải giao dịch.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [q, status, from, to, page, pageSize]);
  useEffect(() => {
    let active = true;
    if (transactionId) {
      const load = async () => {
        try {
          const result = await adminApi.findResaleTransaction(transactionId);
          if (active) {
            setDetail(result.data.transaction);
            setDetailId(transactionId);
          }
        } catch (cause) {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : "Không thể tải chi tiết.",
            );
        }
      };
      void load();
    }
    return () => {
      active = false;
    };
  }, [transactionId]);
  const open = (id: string) =>
    navigate(`/admin/resale/transactions/${id}` as AdminPath);
  const canRetryPayout = canRetryResalePayout(
    detail?.payout.status,
    detail?.payout.failureCode,
  );
  const restrictedFailure = ["SLS_SENDER", "SLS_RECIPIENT"].includes(
    detail?.payout.failureCode ?? "",
  );
  useEffect(() => {
    if (!transactionId || !canRetryPayout || restrictedFailure) {
      return;
    }
    let active = true;
    const loadAccounts = async () => {
      try {
        const { data } =
          await adminApi.findResalePayoutBankAccounts(transactionId);
        if (active) {
          setBankAccounts(data.bankAccounts);
          setBankAccountId(
            (current) => current || data.bankAccounts[0]?.id || "",
          );
        }
      } catch {
        if (active)
          setRetryMessage("Không tải được tài khoản ngân hàng của người bán.");
      }
    };
    void loadAccounts();
    return () => {
      active = false;
    };
  }, [transactionId, canRetryPayout, restrictedFailure]);
  const retryPayout = async () => {
    if (!detail || !bankAccountId) return;
    setRetrying(true);
    setRetryMessage("");
    try {
      await adminApi.retryResalePayout(detail.id, bankAccountId);
      const { data } = await adminApi.findResaleTransaction(detail.id);
      setDetail(data.transaction);
      setRetryMessage("Đã gửi yêu cầu retry payout. Đang chờ Xendit xác nhận.");
    } catch (cause) {
      setRetryMessage(
        cause instanceof Error ? cause.message : "Không thể retry payout.",
      );
    } finally {
      setRetrying(false);
    }
  };
  if (transactionId)
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
                        !["recipient", "attempts", "failureReason"].includes(
                          key,
                        ),
                    )
                    .map(([key, value]) =>
                      label(
                        payoutLabels[key] ?? key,
                        renderPayoutValue(key, value),
                      ),
                    )}
                  {label(
                    "Lý do thất bại",
                    resalePayoutFailureReasons[
                      detail.payout.failureCode ?? ""
                    ] ?? detail.payout.failureReason,
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
                        onChange={(event) =>
                          setBankAccountId(event.target.value)
                        }
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
                    <li
                      key={item.id}
                      className="border-l-2 border-primary pl-4"
                    >
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
  return (
    <section className="grid gap-5">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Resale
        </p>
        <h1 className="text-3xl font-extrabold">Giao dịch resale</h1>
      </header>
      {error && (
        <p
          role="alert"
          className="rounded border border-error bg-error/10 p-4 text-error"
        >
          {error}
        </p>
      )}
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          aria-label="Tìm mã giao dịch"
          className="rounded border border-line bg-surface px-3 py-2"
          placeholder="Tìm mã giao dịch"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          aria-label="Lọc trạng thái"
          className="rounded border border-line bg-surface px-3 py-2"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {statusText[s]}
            </option>
          ))}
        </select>
        <label className="text-sm text-ink-soft">
          Từ ngày
          <input
            aria-label="Từ ngày"
            type="date"
            className="mt-1 block w-full rounded border border-line bg-surface px-3 py-2"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-sm text-ink-soft">
          Đến ngày
          <input
            aria-label="Đến ngày"
            type="date"
            className="mt-1 block w-full rounded border border-line bg-surface px-3 py-2"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(1);
            }}
          />
        </label>
      </div>
      <div className="overflow-x-auto rounded-lg border border-line bg-surface">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="border-b border-line text-ink-soft">
            <tr>
              {[
                "Mã giao dịch",
                "Sự kiện",
                "Vé",
                "Người bán",
                "Người mua",
                "Giá bán",
                "Trạng thái",
                "Tạo lúc",
                "",
              ].map((x) => (
                <th key={x} className="px-4 py-3">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">
                  {row.maGiaoDich ?? row.transactionCode ?? row.id}
                </td>
                <td className="px-4 py-3">
                  {row.event?.title ??
                    row.event?.tieuDe ??
                    row.eventTitle ??
                    row.suKien?.tieuDe ??
                    row.listing?.event?.title ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {row.ticket
                    ? `${row.ticket.type}${row.ticket.seat ? ` · ${row.ticket.seat}` : ""}`
                    : (row.listing?.ticket?.ticketCode ?? "—")}
                </td>
                <td className="px-4 py-3">
                  {row.seller?.hoTen ??
                    row.seller?.fullName ??
                    row.listing?.seller?.fullName ??
                    "—"}
                </td>
                <td className="px-4 py-3">
                  {row.buyer?.hoTen ?? row.buyer?.fullName ?? "—"}
                </td>
                <td className="px-4 py-3">{money(row.price)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 font-bold ${statusStyle[row.status] ?? "bg-surface text-ink"}`}
                  >
                    {statusText[row.status] ?? row.status}
                  </span>
                </td>
                <td className="px-4 py-3">{date(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <button
                    className="font-bold text-primary"
                    onClick={() => open(row.id)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-ink-soft">
                  {loading ? "Đang tải…" : "Không có giao dịch."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex items-center justify-between">
        <span className="text-sm text-ink-soft">
          {total} giao dịch · Trang {page} /{" "}
          {Math.max(1, Math.ceil(total / pageSize))}
        </span>
        <div className="flex gap-2">
          <button
            className="rounded border border-line px-3 py-2 disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trước
          </button>
          <button
            className="rounded border border-line px-3 py-2 disabled:opacity-40"
            disabled={page * pageSize >= total}
            onClick={() => setPage(page + 1)}
          >
            Tiếp
          </button>
        </div>
      </footer>
    </section>
  );
}
