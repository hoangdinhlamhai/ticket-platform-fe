import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { TicketIcon } from "../../../components/icons/TicketlyIcons";
import { formatTicketPrice } from "../../events";
import {
  createResaleRefundRequest,
  findResaleTransaction,
  type ResaleTransaction,
} from "../api/resaleApi";
import { ResaleCheckoutSteps } from "../components/ResaleCheckoutSteps";

type Props = {
  listingId: string;
  onNavigate: (path: AttendeePath) => void;
};

const ticketTransferredStatuses = new Set(["COMPLETED"]);

const transactionIsPendingTransfer = (status: string) => status === "PAID";
const payoutFailureStatuses = new Set(["FAILED", "REVERSED", "REJECTED"]);

const transactionStatusLabel: Record<string, string> = {
  PENDING_PAYMENT: "Đang chờ thanh toán",
  PAID: "Đã thanh toán",
  PAYOUT_PROCESSING: "Đã thanh toán · Đang xử lý payout",
  PAYOUT_FAILED: "Đã thanh toán · Payout chưa thành công",
  PAYMENT_REVIEW: "Giao dịch cần được hỗ trợ",
  COMPLETED: "Đã chuyển vé",
  REFUNDED: "Đã hoàn tiền",
  EXPIRED: "Đã hết hạn",
  PAYMENT_FAILED: "Thanh toán thất bại",
};

export function ResaleResultPage({ listingId, onNavigate }: Props) {
  const transactionId = new URLSearchParams(window.location.search).get(
    "transactionId",
  );
  const [transaction, setTransaction] = useState<ResaleTransaction | null>(
    null,
  );
  const [loadError, setLoadError] = useState(false);
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundError, setRefundError] = useState("");

  useEffect(() => {
    if (!transactionId) return;
    let active = true;
    let timeoutId: number;
    const loadTransaction = async () => {
      try {
        const { data } = await findResaleTransaction(transactionId);
        if (!active) return;
        if (data.transaction.listingId !== listingId) {
          setLoadError(true);
          return;
        }
        setTransaction(data.transaction);
        if (
          ["PENDING_PAYMENT", "PAID", "PAYOUT_PROCESSING"].includes(
            data.transaction.status,
          ) ||
          ["PENDING", "PROCESSING"].includes(
            data.transaction.refundStatus ?? "",
          )
        ) {
          timeoutId = window.setTimeout(loadTransaction, 2500);
        }
      } catch {
        if (active) setLoadError(true);
      }
    };
    void loadTransaction();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
    };
  }, [listingId, transactionId]);

  const transferred =
    transaction !== null && ticketTransferredStatuses.has(transaction.status);
  const payoutFailed =
    transaction !== null &&
    (transaction.status === "PAYOUT_FAILED" ||
      payoutFailureStatuses.has(transaction.payoutStatus ?? ""));
  const waitingForPayout =
    transaction !== null &&
    (transactionIsPendingTransfer(transaction.status) ||
      transaction.status === "PAYOUT_PROCESSING");
  const payoutSucceededWithoutTransfer =
    transaction?.status === "PAID" && transaction.payoutStatus === "SUCCEEDED";
  const title = transferred
    ? "Vé resale đã thuộc về bạn."
    : transaction?.status === "PENDING_PAYMENT"
      ? "Đang xác nhận thanh toán."
      : payoutFailed
        ? "Thanh toán đã nhận, payout chưa thành công."
        : payoutSucceededWithoutTransfer
          ? "Thanh toán đã xong, cần hỗ trợ chuyển vé."
          : waitingForPayout
            ? "Đã thanh toán, đang chờ hoàn tất chuyển vé."
            : transaction?.status === "PAYMENT_REVIEW"
              ? "Giao dịch đang được Ticketly hỗ trợ."
              : transaction
                ? "Thanh toán chưa hoàn tất."
                : "Đang tải giao dịch.";

  const requestRefund = async () => {
    if (!transaction) return;
    setRefundSubmitting(true);
    setRefundError("");
    try {
      await createResaleRefundRequest(transaction.id, "");
      const { data } = await findResaleTransaction(transaction.id);
      setTransaction(data.transaction);
    } catch {
      setRefundError(
        "Không thể gửi yêu cầu hoàn tiền. Vui lòng tải lại giao dịch và thử lại.",
      );
    } finally {
      setRefundSubmitting(false);
    }
  };

  return (
    <div className="px-6 py-[clamp(3.5rem,7vw,6.5rem)] mobile:px-5">
      <div className="mx-auto max-w-[68rem]">
        <ResaleCheckoutSteps current={transferred ? "complete" : "payment"} />
        <header className="mt-10 text-center">
          <TicketIcon className="mx-auto h-12 w-12 text-coral" />
          <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-success">
            {transferred
              ? "ĐÃ CHUYỂN VÉ"
              : payoutFailed
                ? "PAYOUT CHƯA THÀNH CÔNG"
                : payoutSucceededWithoutTransfer
                  ? "PAYOUT THÀNH CÔNG · ĐANG KIỂM TRA CHUYỂN VÉ"
                  : waitingForPayout
                    ? "ĐÃ THANH TOÁN · ĐANG CHỜ PAYOUT"
                    : "TRẠNG THÁI GIAO DỊCH"}
          </p>
          <h1 className="mt-4 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.84] font-extrabold tracking-[-0.1em]">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-[42rem] leading-[1.7] text-ink-soft">
            {transaction?.status === "PENDING_PAYMENT"
              ? "Xendit đang gửi kết quả thanh toán. Trang sẽ tự cập nhật khi nhận được xác nhận."
              : payoutFailed
                ? (transaction?.buyerPayoutMessage ??
                  "Thanh toán đã được ghi nhận nhưng payout chưa thành công. Vé vẫn thuộc về người bán cho đến khi payout được xử lý.")
                : payoutSucceededWithoutTransfer
                  ? "Xendit đã xác nhận payout nhưng hệ thống chưa thể hoàn tất chuyển vé tự động. Ticketly đang kiểm tra giao dịch."
                  : waitingForPayout
                    ? "Thanh toán của bạn đã được xác nhận. Hệ thống đang chờ Xendit chuyển tiền thành công cho người bán; vé sẽ được chuyển sang tài khoản của bạn ngay sau đó. Trang sẽ tự cập nhật trạng thái."
                    : transferred
                      ? "Quyền sở hữu vé đã được cập nhật sau khi Xendit xác nhận khoản thanh toán."
                      : transaction?.status === "PAYMENT_REVIEW"
                        ? "Giao dịch cần được Ticketly hỗ trợ. Vui lòng liên hệ bộ phận hỗ trợ để được cập nhật."
                        : transaction
                          ? "Thanh toán chưa được xác nhận. Listing sẽ được mở lại nếu phiên thanh toán thất bại hoặc hết hạn."
                          : "Đang truy vấn trạng thái giao dịch từ máy chủ."}
          </p>
        </header>

        {transaction ? (
          <section className="mt-10 overflow-hidden rounded-lg border border-line bg-surface">
            <div className="bg-pine p-6 text-paper">
              <p className="text-xs font-extrabold tracking-[0.1em] text-mint">
                {transferred
                  ? "VÉ RESALE ĐÃ ĐƯỢC CHUYỂN"
                  : payoutFailed
                    ? "PAYOUT CHƯA THÀNH CÔNG"
                    : waitingForPayout
                      ? "ĐANG CHỜ XÁC NHẬN PAYOUT"
                      : "GIAO DỊCH RESALE"}
              </p>
              <h2 className="mt-3 font-body text-5xl font-extrabold tracking-[-0.09em]">
                {transaction.eventTitle}
              </h2>
              <p className="mt-4 text-story-copy">{transaction.ticketType}</p>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-line mobile:grid-cols-1">
              {[
                ["Mã giao dịch", transaction.id],
                [
                  "Trạng thái",
                  transaction.status === "PAID" && transaction.payoutStatus
                    ? payoutFailureStatuses.has(transaction.payoutStatus)
                      ? "Đã thanh toán · Payout chưa thành công"
                      : `Đã thanh toán · Payout ${transaction.payoutStatus}`
                    : (transactionStatusLabel[transaction.status] ??
                      "Đang xử lý"),
                ],
                ["Giá thanh toán", formatTicketPrice(transaction.amount)],
                ["Thời gian thanh toán", transaction.paidAt ?? "Đang chờ"],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface p-5">
                  <dt className="text-xs font-extrabold text-ink-soft">
                    {label.toUpperCase()}
                  </dt>
                  <dd className="m-0 mt-2 break-words font-extrabold">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {transaction?.buyerPayoutMessage || transaction?.refundStatus ? (
          <section className="mt-6 rounded-lg border border-warning/40 bg-warning/10 p-5">
            {transaction.buyerPayoutMessage ? (
              <p className="m-0 text-sm leading-6 text-ink">
                {transaction.buyerPayoutMessage}
              </p>
            ) : null}
            {transaction.refundStatus ? (
              <p className="mt-3 mb-0 font-bold" role="status">
                {transaction.refundStatus === "PENDING"
                  ? "Yêu cầu hoàn tiền đang chờ Admin duyệt. Vé vẫn được giữ cho bạn trong thời gian xử lý."
                  : transaction.refundStatus === "PROCESSING"
                    ? "Yêu cầu hoàn tiền đang được Xendit xử lý. Vé vẫn được giữ cho bạn đến khi Xendit xác nhận."
                    : transaction.refundStatus === "SUCCEEDED"
                      ? "Xendit đã xác nhận hoàn tiền thành công."
                      : transaction.refundStatus === "REJECTED"
                        ? "Admin đã từ chối yêu cầu hoàn tiền. Vé vẫn được giữ cho bạn."
                        : "Yêu cầu hoàn tiền chưa hoàn tất; Admin đang kiểm tra."}
              </p>
            ) : null}
            {transaction.canRequestRefund && !transaction.refundStatus ? (
              <div className="mt-4 grid gap-3">
                {refundError ? (
                  <p className="m-0 text-sm text-error" role="alert">
                    {refundError}
                  </p>
                ) : null}
                <button
                  className="min-h-11 w-fit rounded-md bg-coral px-4 font-extrabold text-paper disabled:opacity-50"
                  type="button"
                  disabled={refundSubmitting}
                  onClick={() => void requestRefund()}
                >
                  {refundSubmitting ? "Đang gửi yêu cầu…" : "Yêu cầu hoàn tiền"}
                </button>
                <p className="m-0 text-xs text-ink-soft">
                  Vé sẽ được giữ cho bạn cho đến khi Xendit xác nhận hoàn tiền
                  thành công.
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {loadError ? (
          <p
            className="mt-5 text-center text-sm font-bold text-error"
            role="alert"
          >
            Không tải được trạng thái giao dịch.
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {transferred && transaction ? (
            <button
              className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
              type="button"
              onClick={() => onNavigate(`/tickets/${transaction.ticketId}`)}
            >
              Mở vé của tôi
            </button>
          ) : null}
          <button
            className="min-h-12 rounded-md border border-blue-deep/50 px-5 font-extrabold text-blue-deep"
            type="button"
            onClick={() => onNavigate("/resale")}
          >
            Tiếp tục xem chợ resale
          </button>
        </div>
      </div>
    </div>
  );
}
