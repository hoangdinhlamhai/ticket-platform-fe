import type { AttendeePath } from "../../../routes/attendee-route";
import { formatResalePrice } from "../helpers/format-resale-price";
import type { ResaleListing } from "../types/resale";

type Props = {
  listing: ResaleListing;
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
  onNavigate,
  onWithdraw,
}: Props) {
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
        <strong className="text-xl text-blue-deep">
          {formatResalePrice(listing.price)}
        </strong>
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
                ? "Vé đang được giữ cho giao dịch. Theo dõi payout trong mục Giao dịch bán vé bên dưới."
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
    </article>
  );
}
