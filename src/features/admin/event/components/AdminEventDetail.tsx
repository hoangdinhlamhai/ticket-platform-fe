import { useEffect, useState, type ReactNode } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import { AdminEventSeatMap } from "./AdminEventSeatMap.tsx";
import { adminStatusLabel } from "../../helpers/admin-display.ts";
import type { AdminEventDetail as EventDetail } from "../types/admin-event.ts";
import { AdminBackButton } from "../../components/AdminCommon.tsx";
import { AdminDetailSkeleton } from "../../components/AdminDetailSkeleton.tsx";

type Props = {
  readonly eventId: string;
  readonly reviewMode: boolean;
  readonly navigate: (path: string) => void;
};

const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN");

function DetailField({
  label,
  children,
  className = "",
}: {
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={`min-w-0 ${className}`}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="mb-0 mt-1 break-words text-sm leading-6 text-ink">
        {children}
      </dd>
    </div>
  );
}

export function AdminEventDetail({ eventId, navigate }: Props) {
  return (
    <AdminEventDetailLoader
      key={eventId}
      eventId={eventId}
      navigate={navigate}
    />
  );
}

function AdminEventDetailLoader({
  eventId,
  navigate,
}: Pick<Props, "eventId" | "navigate">) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const backPath = "/admin/events";

  useEffect(() => {
    let active = true;
    void adminEventApi
      .findById(eventId)
      .then(({ data }) => {
        if (active) setEvent(data.event);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải chi tiết sự kiện.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId]);

  async function decide(decision: "APPROVED" | "REJECTED") {
    if (!event) return;
    setBusy(true);
    setError("");
    try {
      await adminEventApi.review(event.id, decision, reason.trim());
      navigate(backPath);
    } catch (cause: unknown) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể cập nhật quyết định xét duyệt.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <AdminDetailSkeleton label="Đang tải chi tiết sự kiện" />;
  if (error && !event)
    return (
      <section className="grid gap-4 rounded-lg border border-line bg-surface p-5">
        <AdminBackButton onClick={() => navigate(backPath)} />
        <p className="text-error" role="alert">
          {error}
        </p>
      </section>
    );
  if (!event)
    return (
      <p className="rounded-lg border border-line bg-surface p-5">
        Không tìm thấy sự kiện.
      </p>
    );

  const location = [
    event.location.address,
    event.location.ward?.name,
    event.location.province.name,
  ]
    .filter(Boolean)
    .join(", ");
  const payout = event.payoutInfo;
  const isPendingReview = event.status.toUpperCase() === "PENDING_REVIEW";

  return (
    <div className="mx-auto grid w-full max-w-[1600px] gap-5">
      <AdminBackButton onClick={() => navigate(backPath)} />

      <header
        className="grid min-w-0 gap-2 rounded-xl bg-pine text-paper"
        style={{ padding: "1.5rem", minHeight: "7rem" }}
      >
        <p className="m-0 text-xs font-bold uppercase tracking-[.14em] text-mint">
          Chi tiết sự kiện · {adminStatusLabel(event.status)}
        </p>
        <h1 className="m-0 break-words text-2xl font-extrabold sm:text-3xl">
          {event.title}
        </h1>
        <p className="m-0 break-words text-sm text-paper/85 sm:text-base">
          {event.venueName ?? "Chưa có địa điểm"} · {formatDate(event.startAt)}
          {" – "}
          {formatDate(event.endAt)}
        </p>
      </header>

      {error && (
        <p
          className="m-0 rounded-lg border border-error bg-error/10 p-4 text-sm text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {event.coverImage && (
        <section
          className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:p-5"
          aria-labelledby="event-cover-heading"
        >
          <h2 id="event-cover-heading" className="m-0 text-base font-extrabold">
            Ảnh cover
          </h2>
          <figure className="m-0 w-full overflow-hidden rounded-lg bg-paper-deep">
            <img
              className="block w-full object-cover"
              style={{ height: "clamp(12rem, 28vw, 22rem)" }}
              src={event.coverImage}
              alt={`Ảnh cover: ${event.title}`}
            />
          </figure>
        </section>
      )}

      <div className="grid items-stretch gap-4 xl:grid-cols-2">
        <section
          className="grid content-start gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
          aria-labelledby="event-information-heading"
        >
          <h2
            id="event-information-heading"
            className="m-0 text-lg font-extrabold"
          >
            Thông tin sự kiện
          </h2>

          <div className="grid gap-4 sm:grid-cols-[5rem_minmax(0,1fr)]">
            {event.thumbnail && (
              <figure className="m-0 grid content-start gap-2">
                <figcaption className="text-xs font-semibold text-ink-soft">
                  Ảnh thumbnail
                </figcaption>
                <img
                  className="shrink-0 rounded-lg border border-line bg-paper-deep object-contain"
                  style={{ width: "6rem", height: "6rem" }}
                  src={event.thumbnail}
                  alt={`Thumbnail: ${event.title}`}
                />
              </figure>
            )}
            <dl className="m-0 grid content-start grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
              <DetailField label="Danh mục">{event.category.name}</DetailField>
              <DetailField label="Chế độ hiển thị">
                {event.visibility}
              </DetailField>
              <DetailField label="Địa điểm" className="sm:col-span-2">
                {location || "Chưa có địa chỉ"}
              </DetailField>
              <DetailField label="Bắt đầu">
                {formatDate(event.startAt)}
              </DetailField>
              <DetailField label="Kết thúc">
                {formatDate(event.endAt)}
              </DetailField>
            </dl>
          </div>

          <DetailField label="Mô tả" className="border-t border-line pt-3">
            <span className="whitespace-pre-wrap">
              {event.description || "Chưa có mô tả."}
            </span>
          </DetailField>

          {event.rejectionReason && (
            <div className="rounded-lg border border-error/30 bg-error/5 p-3">
              <p className="m-0 text-xs font-bold uppercase tracking-wide text-error">
                Lý do từ chối
              </p>
              <p className="mb-0 mt-1 whitespace-pre-wrap text-sm leading-6 text-ink">
                {event.rejectionReason}
              </p>
            </div>
          )}
        </section>

        <section
          className="grid content-start gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
          aria-labelledby="organizer-information-heading"
        >
          <div className="flex min-w-0 items-center gap-3">
            {event.organizerLogo && (
              <img
                className="shrink-0 rounded-lg border border-line bg-paper p-1 object-contain"
                style={{ width: "6rem", height: "6rem" }}
                src={event.organizerLogo}
                alt={`Logo ${event.organizerName ?? event.organizer.fullName}`}
              />
            )}
            <div className="min-w-0">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Organizer
              </p>
              <h2
                id="organizer-information-heading"
                className="m-0 break-words text-lg font-extrabold"
              >
                {event.organizerName || event.organizer.fullName}
              </h2>
            </div>
          </div>
          <dl className="m-0 grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">
            <DetailField label="Tên hiển thị">
              {event.organizerName || "Chưa thiết lập"}
            </DetailField>
            <DetailField label="Tài khoản">{event.organizer.email}</DetailField>
            <DetailField label="Gửi duyệt">
              {event.submittedAt
                ? formatDate(event.submittedAt)
                : "Chưa gửi duyệt"}
            </DetailField>
            <DetailField label="Tạo lúc">
              {formatDate(event.createdAt)}
            </DetailField>
            <DetailField label="Người xét duyệt">
              {event.reviewedBy
                ? `${event.reviewedBy.fullName} (${event.reviewedBy.email})`
                : "Chưa xét duyệt"}
            </DetailField>
            <DetailField label="Thời điểm duyệt">
              {event.reviewedAt
                ? formatDate(event.reviewedAt)
                : "Chưa xét duyệt"}
            </DetailField>
            <DetailField label="Giới thiệu" className="sm:col-span-2">
              <span className="whitespace-pre-wrap">
                {event.organizerBio || "Chưa có giới thiệu."}
              </span>
            </DetailField>
          </dl>
        </section>
      </div>

      <section
        className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
        aria-labelledby="ticket-types-heading"
      >
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="ticket-types-heading" className="m-0 text-lg font-extrabold">
            Các loại vé
          </h2>
          <span className="text-sm text-ink-soft">
            {event.ticketTypes.length} loại vé
          </span>
        </div>
        {event.ticketTypes.length ? (
          <div className="grid grid-cols-1 gap-3">
            {event.ticketTypes.map((ticket) => (
              <article
                className="grid content-start gap-3 rounded-lg border border-line bg-paper/60 p-4"
                key={ticket.id}
              >
                {ticket.image && (
                  <img
                    className="h-36 w-full rounded-md bg-paper-deep object-contain"
                    src={ticket.image}
                    alt={`Ảnh hạng vé ${ticket.name}`}
                  />
                )}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="m-0 text-base font-bold">{ticket.name}</h3>
                  <strong className="text-sm font-extrabold text-pine">
                    {money(ticket.price)}
                  </strong>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-md bg-paper-deep/70 p-3 text-sm">
                  <p className="m-0">
                    <span className="block text-xs text-ink-soft">
                      Số lượng
                    </span>
                    <strong>{ticket.quantity}</strong>
                  </p>
                  <p className="m-0">
                    <span className="block text-xs text-ink-soft">Mỗi đơn</span>
                    <strong>
                      {ticket.minPerOrder}–{ticket.maxPerOrder}
                    </strong>
                  </p>
                </div>
                <p className="m-0 whitespace-pre-wrap text-sm leading-5 text-ink-soft">
                  {ticket.description || "Không có mô tả."}
                </p>
                <p className="m-0 text-xs leading-5 text-ink-soft">
                  Mở bán:{" "}
                  {ticket.saleStartAt
                    ? formatDate(ticket.saleStartAt)
                    : "Không giới hạn"}
                  {" – "}
                  {ticket.saleEndAt
                    ? formatDate(ticket.saleEndAt)
                    : "Không giới hạn"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="m-0 rounded-lg bg-paper-deep/60 p-4 text-sm text-ink-soft">
            Chưa có loại vé.
          </p>
        )}
      </section>

      <section
        className="grid gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
        aria-label="Sơ đồ chỗ ngồi"
      >
        <AdminEventSeatMap eventId={event.id} />
      </section>

      <section
        className="grid content-start gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5"
        aria-labelledby="payout-information-heading"
      >
        <div>
          <h2
            id="payout-information-heading"
            className="m-0 text-lg font-extrabold"
          >
            Thông tin thanh toán
          </h2>
          <p className="mb-0 mt-1 text-sm text-ink-soft">
            Thông tin nhận thanh toán và xuất hóa đơn của Organizer.
          </p>
        </div>
        {payout ? (
          <dl className="m-0 grid grid-cols-1 gap-x-6 gap-y-4 rounded-lg bg-paper/60 p-4 sm:grid-cols-2 xl:grid-cols-4">
            <DetailField label="Chủ tài khoản">
              {payout.accountHolder || "—"}
            </DetailField>
            <DetailField label="Số tài khoản">
              {payout.accountNumber || "—"}
            </DetailField>
            <DetailField label="Ngân hàng">
              {payout.bankName || "—"}
            </DetailField>
            <DetailField label="Chi nhánh">{payout.branch || "—"}</DetailField>
            <DetailField label="Loại hình kinh doanh">
              {payout.businessType || "—"}
            </DetailField>
            <DetailField label="Tên xuất hóa đơn">
              {payout.invoiceName || "—"}
            </DetailField>
            <DetailField label="Địa chỉ hóa đơn">
              {payout.invoiceAddress || "—"}
            </DetailField>
            <DetailField label="Mã số thuế">
              {payout.taxCode || "—"}
            </DetailField>
          </dl>
        ) : (
          <p className="m-0 rounded-lg bg-paper-deep/60 p-4 text-sm text-ink-soft">
            Chưa có thông tin thanh toán.
          </p>
        )}
      </section>

      {isPendingReview && (
        <section
          className="grid gap-4 rounded-xl border border-pine/20 bg-surface p-4 sm:p-5"
          aria-labelledby="event-review-heading"
        >
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[.14em] text-ink-soft">
              Quyết định kiểm duyệt
            </p>
            <h2
              id="event-review-heading"
              className="mb-0 mt-1 text-lg font-extrabold"
            >
              Duyệt sự kiện
            </h2>
            <p className="mb-0 mt-1 text-sm text-ink-soft">
              Xem xét thông tin trước khi chấp thuận hoặc gửi phản hồi cho
              Organizer.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end">
            <label
              className="grid gap-2 text-sm font-bold"
              htmlFor="event-review-reason"
            >
              Lý do từ chối
              <span className="font-normal text-ink-soft">Không bắt buộc.</span>
              <textarea
                id="event-review-reason"
                className="min-h-28 w-full resize-y rounded-lg border border-line bg-paper p-3 font-normal outline-none transition focus:border-pine focus:ring-2 focus:ring-pine/15"
                value={reason}
                onChange={(change) => setReason(change.target.value)}
                disabled={busy}
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              <button
                disabled={busy}
                className="min-h-11 rounded-lg bg-pine px-4 font-extrabold text-paper transition hover:bg-pine/90 disabled:cursor-wait disabled:opacity-50"
                type="button"
                onClick={() => void decide("APPROVED")}
              >
                {busy ? "Đang xử lý..." : "Duyệt sự kiện"}
              </button>
              <button
                disabled={busy}
                className="min-h-11 rounded-lg border border-error/40 bg-error/5 px-4 font-extrabold text-error transition hover:bg-error/10 disabled:cursor-wait disabled:opacity-50"
                type="button"
                onClick={() => void decide("REJECTED")}
              >
                Từ chối sự kiện
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
