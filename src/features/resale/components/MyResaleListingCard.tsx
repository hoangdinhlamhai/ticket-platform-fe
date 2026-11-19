import { useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import type { ResaleTransaction } from "../api/resaleApi";
import { formatResalePrice } from "../helpers/format-resale-price";
import type { ResaleListing } from "../types/resale";

type Props = {
  listing: ResaleListing;
  transaction?: ResaleTransaction;
  transactionLoading?: boolean;
  onNavigate: (path: AttendeePath) => void;
  onWithdraw: (id: string) => void;
};

function statusLabel(status: string) {
  switch (status) {
    case "active":
      return "ĐANG BÁN";
    case "reserved":
      return "ĐANG GIỮ CHỖ";
    case "sold":
      return "ĐÃ BÁN";
    default:
      return "ĐÃ RÚT";
  }
}

export function MyResaleListingCard({
  listing,
  transaction,
  transactionLoading = false,
  onNavigate,
  onWithdraw,
}: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const status =
    listing.listingStatus ??
    (listing.availability === "available" ? "active" : "sold");

  return (
    <article className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold tracking-[0.08em] text-coral-dark">
            {statusLabel(status)}
          </span>
          <h2 className="mt-2 font-body text-3xl font-extrabold tracking-[-0.07em]">
            {listing.eventTitle}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">{listing.ticketType}</p>
        </div>
        <div className="flex items-start gap-4">
          <strong className="pt-2 text-xl text-blue-deep">
            {formatResalePrice(listing.price)}
          </strong>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-blue-deep transition hover:bg-paper-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
            type="button"
            aria-expanded={detailsOpen}
            aria-controls={`resale-details-${listing.id}`}
            aria-label={`${detailsOpen ? "Thu gọn" : "Xem"} trạng thái vé resale ${listing.eventTitle}`}
            onClick={() => setDetailsOpen((open) => !open)}
          >
            <svg
              aria-hidden="true"
              className={`h-5 w-5 transition-transform ${detailsOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="m6 9 6 6 6-6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 border-t border-line pt-4">
        {status === "active" ? (
          <button
            className="min-h-11 rounded-md border border-blue-deep/50 px-4 text-sm font-extrabold text-blue-deep"
            type="button"
            onClick={() => onNavigate(`/resale/${listing.id}`)}
          >
            Xem listing
          </button>
        ) : listing.sourceTicketId && status !== "sold" ? (
          <>
            <button
              className="min-h-11 rounded-md border border-blue-deep/50 px-4 text-sm font-extrabold text-blue-deep"
              type="button"
              onClick={() => onNavigate(`/tickets/${listing.sourceTicketId}`)}
            >
              Xem vé
            </button>
            <p className="m-0 self-center text-sm text-ink-soft" role="status">
              {status === "reserved"
                ? "Vé đang được giữ cho giao dịch. Mở chi tiết để theo dõi thanh toán và payout."
                : "Listing đã rút khỏi chợ; vé vẫn thuộc về bạn."}
            </p>
          </>
        ) : (
          <p className="m-0 self-center text-sm text-ink-soft" role="status">
            Vé đã chuyển cho người mua nên không còn trong vé của bạn.
          </p>
        )}
        {status === "active" ? (
          <button
            className="min-h-11 rounded-md bg-coral px-4 text-sm font-extrabold text-paper"
            type="button"
            onClick={() => onWithdraw(listing.id)}
          >
            Rút listing
          </button>
        ) : null}
      </div>
      {detailsOpen ? (
        <div
          className="mt-4 space-y-2 border-t border-line pt-4 text-sm"
          id={`resale-details-${listing.id}`}
        >
          <p className="m-0 font-bold text-ink">
            Trạng thái vé: {statusLabel(status)}
          </p>
          {transaction ? (
            <>
              <p className="m-0 text-ink-soft">
                Giao dịch: {transactionStatusLabel(transaction.status)}
              </p>
              {transaction.payoutStatus ? (
                <p className="m-0 text-ink-soft">
                  Payout Xendit: {transaction.payoutStatus}
                </p>
              ) : null}
              {transaction.payoutError ? (
                <p className="m-0 text-error">{transaction.payoutError}</p>
              ) : null}
              {transaction.refundStatus ? (
                <p className="m-0 font-semibold text-info">
                  {refundStatusLabel(transaction.refundStatus)}
                </p>
              ) : null}
              {transaction.status === "PAID" ? (
                <p className="m-0 text-ink-soft">
                  Vé vẫn thuộc về bạn cho đến khi payout được Xendit xác nhận
                  thành công.
                  {["FAILED", "REVERSED", "REJECTED"].includes(
                    transaction.payoutStatus ?? "",
                  )
                    ? " Vui lòng kiểm tra thông tin nhận tiền trong hồ sơ hoặc liên hệ hỗ trợ."
                    : ""}
                </p>
              ) : null}
            </>
          ) : (
            <p className="m-0 text-ink-soft">
              {transactionLoading
                ? "Đang tải trạng thái giao dịch…"
                : status === "active"
                  ? "Chưa có giao dịch mua vé này."
                  : status === "reserved"
                    ? "Đang chờ người mua thanh toán."
                    : status === "sold"
                      ? "Vé đã được bán."
                      : "Listing đã được rút."}
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}

function transactionStatusLabel(status: string) {
  switch (status) {
    case "PENDING_PAYMENT":
      return "Chờ người mua thanh toán";
    case "PAYMENT_FAILED":
      return "Thanh toán thất bại";
    case "EXPIRED":
      return "Đã hết hạn thanh toán";
    case "PAID":
      return "Người mua đã thanh toán";
    case "COMPLETED":
      return "Hoàn tất, vé đã chuyển cho người mua";
    default:
      return status;
  }
}

function refundStatusLabel(status: string) {
  switch (status) {
    case "PENDING":
      return "Yêu cầu hoàn tiền đang chờ Admin duyệt";
    case "PROCESSING":
      return "Yêu cầu hoàn tiền đang được Xendit xử lý";
    case "SUCCEEDED":
      return "Xendit đã xác nhận hoàn tiền";
    case "REJECTED":
      return "Yêu cầu hoàn tiền đã bị từ chối";
    default:
      return "Yêu cầu hoàn tiền chưa hoàn tất; Admin đang kiểm tra";
  }
}
