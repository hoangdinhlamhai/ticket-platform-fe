import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { findMyResaleListings } from "../api/resaleApi";
import {
  findMyResaleSales,
  requestResalePayout,
  type ResaleTransaction,
} from "../api/resaleApi";
import { MyResaleListingCard } from "../components/MyResaleListingCard";
import type { ResaleListing } from "../types/resale";
import {
  getMyBankAccounts,
  type BankAccount,
} from "../../profile/api/profileApi";

type Props = {
  listings: readonly ResaleListing[];
  onNavigate: (path: AttendeePath) => void;
  onWithdraw: (id: string) => void;
};

function payoutStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Chờ người mua thanh toán";
    case "PAYMENT_FAILED":
    case "EXPIRED":
      return "Thanh toán thất bại hoặc hết hạn";
    case "PAID":
      return "Đã thanh toán, chờ yêu cầu payout";
    case "PAYOUT_PROCESSING":
      return "Xendit đang xử lý payout";
    case "PAYOUT_FAILED":
      return "Payout thất bại, có thể thử lại";
    case "PAYMENT_REVIEW":
      return "Cần Ticketly hỗ trợ giao dịch";
    case "COMPLETED":
      return "Đã payout cho người bán";
    default:
      return status;
  }
}

function hasPayoutDetails(account: BankAccount | undefined) {
  return Boolean(
    account?.bankCode &&
    account.recipientGivenName &&
    account.recipientSurname &&
    account.recipientCity &&
    account.recipientAddress,
  );
}

function SellerTransactions() {
  const [transactions, setTransactions] = useState<ResaleTransaction[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadSales = async () => {
      try {
        const [salesResponse, accountsResponse] = await Promise.all([
          findMyResaleSales(),
          getMyBankAccounts(),
        ]);
        if (!active) return;
        setTransactions(salesResponse.data.transactions);
        setBankAccounts(accountsResponse.data.bankAccounts);
        setSelectedAccountId(
          accountsResponse.data.bankAccounts.find(hasPayoutDetails)?.id ?? "",
        );
      } catch {
        if (active) setError("Không tải được giao dịch resale của bạn.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadSales();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !transactions.some(
        (transaction) => transaction.status === "PAYOUT_PROCESSING",
      )
    ) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      const refreshSales = async () => {
        try {
          const response = await findMyResaleSales();
          setTransactions(response.data.transactions);
        } catch {
          // Keep the last known payout status available while the API is unavailable.
        }
      };
      void refreshSales();
    }, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [transactions]);

  const submitPayout = async (transactionId: string, bankAccountId: string) => {
    if (!bankAccountId || processingId) return;
    setError("");
    setNotice("");
    setProcessingId(transactionId);
    try {
      const response = await requestResalePayout(transactionId, bankAccountId);
      setTransactions((current) =>
        current.map((transaction) =>
          transaction.id === transactionId
            ? response.data.transaction
            : transaction,
        ),
      );
      setNotice("Đã gửi yêu cầu payout cho Xendit.");
    } catch (cause: unknown) {
      const responseData = (
        cause as { response?: { data?: { message?: unknown } } }
      ).response?.data?.message;
      setError(
        typeof responseData === "string"
          ? responseData
          : "Không gửi được yêu cầu payout. Vui lòng thử lại.",
      );
    } finally {
      setProcessingId(null);
    }
  };

  const readyAccounts = bankAccounts.filter(hasPayoutDetails);

  return (
    <section className="mt-10 rounded-lg border border-line bg-surface p-5">
      <header className="mb-5 border-b border-line pb-4">
        <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
          THANH TOÁN NGƯỜI BÁN
        </p>
        <h2 className="mt-2 mb-0 font-body text-3xl font-extrabold tracking-[-0.07em]">
          Giao dịch bán vé
        </h2>
        <p className="mt-2 mb-0 text-sm text-ink-soft">
          Sau khi người mua thanh toán, chọn tài khoản nhận tiền để yêu cầu
          payout.
        </p>
      </header>
      {error ? (
        <p className="text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="text-sm text-green-800" role="status">
          {notice}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-ink-soft">Đang tải giao dịch…</p>
      ) : null}
      {!loading && transactions.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Chưa có giao dịch bán vé resale.
        </p>
      ) : null}
      <div className="space-y-3">
        {transactions.map((transaction) => {
          const canRequestPayout =
            ["PAID", "PAYOUT_FAILED"].includes(transaction.status) ||
            transaction.payoutNeedsConfirmation;
          const payoutAccountId = transaction.payoutNeedsConfirmation
            ? (transaction.payoutBankAccountId ?? "")
            : selectedAccountId;
          const payoutAccount = bankAccounts.find(
            (account) => account.id === payoutAccountId,
          );
          return (
            <article
              key={transaction.id}
              className="rounded-md border border-line p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="m-0 font-extrabold text-ink">
                    {transaction.eventTitle}
                  </h3>
                  <p className="mt-1 mb-0 text-sm text-ink-soft">
                    {transaction.ticketType} ·{" "}
                    {new Date(transaction.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <strong className="text-blue-deep">
                  {new Intl.NumberFormat("vi-VN").format(transaction.amount)}₫
                </strong>
              </div>
              <p className="mt-3 mb-0 text-sm font-bold" role="status">
                {payoutStatusLabel(transaction.status)}
              </p>
              {transaction.payoutError ? (
                <p className="mt-2 mb-0 text-sm text-error">
                  {transaction.payoutError}
                </p>
              ) : null}
              {canRequestPayout ? (
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                  <label className="min-w-64 flex-1 text-sm font-bold text-ink">
                    Tài khoản nhận payout
                    <select
                      className="mt-2 min-h-11 w-full rounded-md border border-line bg-surface px-3 font-normal"
                      value={payoutAccountId}
                      disabled={transaction.payoutNeedsConfirmation}
                      onChange={(event) =>
                        setSelectedAccountId(event.target.value)
                      }
                    >
                      <option value="">
                        Chọn tài khoản đã hoàn thiện hồ sơ
                      </option>
                      {transaction.payoutNeedsConfirmation &&
                      payoutAccountId &&
                      !readyAccounts.some(
                        (account) => account.id === payoutAccountId,
                      ) ? (
                        <option value={payoutAccountId}>
                          Tài khoản đã dùng cho yêu cầu payout đang chờ xác nhận
                        </option>
                      ) : null}
                      {readyAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bankName} · {account.accountHolder} ·{" "}
                          {account.accountNumber}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="min-h-11 rounded-md bg-coral px-4 text-sm font-extrabold text-paper disabled:opacity-50"
                    type="button"
                    disabled={
                      (transaction.payoutNeedsConfirmation
                        ? !payoutAccountId
                        : !hasPayoutDetails(payoutAccount)) ||
                      processingId === transaction.id
                    }
                    onClick={() =>
                      void submitPayout(transaction.id, payoutAccountId)
                    }
                  >
                    {processingId === transaction.id
                      ? "Đang gửi…"
                      : transaction.payoutNeedsConfirmation
                        ? "Kiểm tra / gửi lại yêu cầu"
                        : transaction.status === "PAYOUT_FAILED"
                          ? "Thử payout lại"
                          : "Nhận tiền"}
                  </button>
                </div>
              ) : null}
              {canRequestPayout && readyAccounts.length === 0 ? (
                <p className="mt-3 mb-0 text-sm text-ink-soft">
                  Hãy thêm tài khoản ngân hàng và thông tin người nhận trong{" "}
                  <a
                    className="font-bold text-blue-deep underline"
                    href="/profile"
                  >
                    hồ sơ của bạn
                  </a>{" "}
                  trước khi yêu cầu payout.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function MyResaleListingsPage({
  listings,
  onNavigate,
  onWithdraw,
}: Props) {
  const [savedListings, setSavedListings] = useState<readonly ResaleListing[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      try {
        const { data } = await findMyResaleListings();
        if (active) setSavedListings(data.listings);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadListings();
    return () => {
      active = false;
    };
  }, []);

  const mine =
    savedListings.length > 0
      ? savedListings
      : listings.filter((listing) => listing.ownerLabel === "current-profile");

  return (
    <section className="bg-paper-deep py-[clamp(3.5rem,7vw,6rem)]">
      <div className="attendee-container">
        <header className="mb-7">
          <p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">
            SELLER DASHBOARD
          </p>
          <h1 className="mt-2 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">
            Listing của tôi.
          </h1>
          <p className="mt-4 text-ink-soft">
            Theo dõi listing đang bán, đã bán và đã rút.
          </p>
        </header>
        <div className="space-y-4">
          {isLoading ? (
            <p className="rounded-lg border border-line bg-surface p-6 text-center">
              Đang tải listing…
            </p>
          ) : loadError ? (
            <p className="rounded-lg border border-coral/40 bg-surface p-6 text-center text-coral-dark">
              Không thể tải listing. Vui lòng tải lại trang.
            </p>
          ) : (
            <>
              {mine.map((listing) => (
                <MyResaleListingCard
                  key={listing.id}
                  listing={listing}
                  onNavigate={onNavigate}
                  onWithdraw={onWithdraw}
                />
              ))}
              {mine.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
                  <h2 className="text-2xl font-extrabold">
                    Chưa có listing của bạn.
                  </h2>
                  <button
                    className="mt-5 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper"
                    type="button"
                    onClick={() => onNavigate("/tickets")}
                  >
                    Chọn vé để đăng bán
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <SellerTransactions />
      </div>
    </section>
  );
}
