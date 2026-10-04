import { useEffect, useState } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import type { AdminEventDetail as EventDetail } from "../types/admin-event.ts";

type Props = {
  readonly eventId: string;
  readonly reviewMode: boolean;
  readonly navigate: (path: string) => void;
};

const money = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    amount,
  );

export function AdminEventDetail({ eventId, reviewMode, navigate }: Props) {
  return (
    <AdminEventDetailLoader
      key={eventId}
      eventId={eventId}
      reviewMode={reviewMode}
      navigate={navigate}
    />
  );
}

function AdminEventDetailLoader({ eventId, reviewMode, navigate }: Props) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");
  const backPath = reviewMode ? "/admin/events/review" : "/admin/events";

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
    if (decision === "REJECTED" && !reason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await adminEventApi.review(
        event.id,
        decision,
        reason.trim() || undefined,
      );
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

  if (loading)
    return (
      <p className="rounded border border-line bg-surface p-5" role="status">
        Đang tải chi tiết sự kiện...
      </p>
    );
  if (error && !event)
    return (
      <section className="grid gap-4 rounded-lg border border-line bg-surface p-5">
        <button
          className="w-fit font-bold underline"
          type="button"
          onClick={() => navigate(backPath)}
        >
          Quay lại danh sách
        </button>
        <p className="text-error" role="alert">
          {error}
        </p>
      </section>
    );
  if (!event)
    return (
      <p className="rounded border border-line bg-surface p-5">
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

  return (
    <div className="grid gap-5">
      <button
        className="w-fit font-bold underline"
        type="button"
        onClick={() => navigate(backPath)}
      >
        ← Quay lại danh sách
      </button>
      <header className="grid gap-3 rounded-lg bg-pine p-6 text-paper">
        <p className="m-0 text-xs font-bold uppercase tracking-widest text-mint">
          Chi tiết sự kiện · {event.status}
        </p>
        <h1 className="m-0 text-3xl font-extrabold">{event.title}</h1>
        <p className="m-0">
          {event.venueName ?? "Chưa có địa điểm"} ·{" "}
          {new Date(event.startAt).toLocaleString("vi-VN")} –{" "}
          {new Date(event.endAt).toLocaleString("vi-VN")}
        </p>
      </header>
      {error && (
        <p
          className="rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {error}
        </p>
      )}

      {(event.coverImage || event.thumbnail) && (
        <img
          className="max-h-[28rem] w-full rounded-lg object-cover"
          src={event.coverImage ?? event.thumbnail ?? ""}
          alt={`Ảnh sự kiện ${event.title}`}
        />
      )}
      <section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2">
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Thông tin sự kiện</h2>
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm text-ink-soft">Slug / ID</dt>
              <dd className="m-0 break-all">
                {event.slug} · {event.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Danh mục</dt>
              <dd className="m-0">{event.category.name}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Địa chỉ</dt>
              <dd className="m-0">{location}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Hiển thị</dt>
              <dd className="m-0">{event.visibility}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Mô tả</dt>
              <dd className="m-0 whitespace-pre-wrap">
                {event.description || "Chưa có mô tả."}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Tin nhắn xác nhận</dt>
              <dd className="m-0 whitespace-pre-wrap">
                {event.confirmationMessage || "Chưa thiết lập."}
              </dd>
            </div>
            {event.rejectionReason && (
              <div>
                <dt className="text-sm text-ink-soft">Lý do từ chối</dt>
                <dd className="m-0">{event.rejectionReason}</dd>
              </div>
            )}
          </dl>
        </div>
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Organizer</h2>
          {event.organizerLogo && (
            <img
              className="mb-4 max-h-32 max-w-48 rounded object-contain"
              src={event.organizerLogo}
              alt={`Logo ${event.organizerName ?? event.organizer.fullName}`}
            />
          )}
          <dl className="grid gap-3">
            <div>
              <dt className="text-sm text-ink-soft">Tài khoản</dt>
              <dd className="m-0">
                {event.organizer.fullName} · {event.organizer.email} ·{" "}
                {event.organizer.id}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Tên hiển thị</dt>
              <dd className="m-0">
                {event.organizerName || "Chưa thiết lập."}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Giới thiệu</dt>
              <dd className="m-0 whitespace-pre-wrap">
                {event.organizerBio || "Chưa có giới thiệu."}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Gửi duyệt / Tạo lúc</dt>
              <dd className="m-0">
                {event.submittedAt
                  ? new Date(event.submittedAt).toLocaleString("vi-VN")
                  : "Chưa gửi duyệt"}{" "}
                · {new Date(event.createdAt).toLocaleString("vi-VN")}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-ink-soft">Người xét duyệt</dt>
              <dd className="m-0">
                {event.reviewedBy
                  ? `${event.reviewedBy.fullName} (${event.reviewedBy.email})`
                  : "Chưa xét duyệt"}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-lg border border-line bg-surface p-5">
        <h2 className="mt-0 text-xl font-extrabold">Các loại vé</h2>
        {event.ticketTypes.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {event.ticketTypes.map((ticket) => (
              <article
                className="rounded border border-line p-4"
                key={ticket.id}
              >
                {ticket.image && (
                  <img
                    className="mb-3 max-h-40 w-full rounded object-cover"
                    src={ticket.image}
                    alt={`Ảnh hạng vé ${ticket.name}`}
                  />
                )}
                <h3 className="m-0 text-lg font-bold">{ticket.name}</h3>
                <p className="mt-2">
                  {money(ticket.price)} · Số lượng: {ticket.quantity}
                </p>
                <p className="whitespace-pre-wrap">
                  {ticket.description || "Không có mô tả."}
                </p>
                <p className="text-sm text-ink-soft">
                  Mỗi đơn: {ticket.minPerOrder}–{ticket.maxPerOrder} · Bán từ{" "}
                  {ticket.saleStartAt
                    ? new Date(ticket.saleStartAt).toLocaleString("vi-VN")
                    : "không giới hạn"}{" "}
                  đến{" "}
                  {ticket.saleEndAt
                    ? new Date(ticket.saleEndAt).toLocaleString("vi-VN")
                    : "không giới hạn"}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p>Chưa có loại vé.</p>
        )}
      </section>

      <section className="grid gap-5 rounded-lg border border-line bg-surface p-5 lg:grid-cols-2">
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
          {event.seatMap?.imageUrl ? (
            <img
              className="max-h-80 rounded object-contain"
              src={event.seatMap.imageUrl}
              alt="Sơ đồ chỗ ngồi"
            />
          ) : (
            <p>Không có sơ đồ chỗ ngồi.</p>
          )}
          {event.seatMap && (
            <p>
              Kích thước: {event.seatMap.width} × {event.seatMap.height}
            </p>
          )}
        </div>
        <div>
          <h2 className="mt-0 text-xl font-extrabold">Thông tin thanh toán</h2>
          {payout ? (
            <dl className="grid gap-2">
              <div>
                <dt className="text-sm text-ink-soft">Chủ tài khoản</dt>
                <dd className="m-0">{payout.accountHolder}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Tài khoản / Ngân hàng</dt>
                <dd className="m-0">
                  {payout.accountNumber} · {payout.bankName} · {payout.branch}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Loại hình</dt>
                <dd className="m-0">{payout.businessType}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-soft">Hóa đơn / Mã số thuế</dt>
                <dd className="m-0">
                  {payout.invoiceName || "—"} · {payout.invoiceAddress || "—"} ·{" "}
                  {payout.taxCode || "—"}
                </dd>
              </div>
            </dl>
          ) : (
            <p>Chưa có thông tin thanh toán.</p>
          )}
        </div>
      </section>

      {reviewMode && event.status === "PENDING_REVIEW" && (
        <section className="sticky bottom-3 grid gap-3 rounded-lg border border-line bg-paper p-4 shadow-lg">
          <label className="grid gap-2 font-bold" htmlFor="event-review-reason">
            Lý do từ chối (bắt buộc khi từ chối)
          </label>
          <textarea
            id="event-review-reason"
            className="min-h-24 rounded border border-line bg-surface p-3"
            value={reason}
            onChange={(change) => setReason(change.target.value)}
          />
          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy}
              className="min-h-11 rounded bg-mint px-4 font-extrabold text-success disabled:opacity-50"
              type="button"
              onClick={() => void decide("APPROVED")}
            >
              Duyệt
            </button>
            <button
              disabled={busy}
              className="min-h-11 rounded bg-error px-4 font-extrabold text-paper disabled:opacity-50"
              type="button"
              onClick={() => void decide("REJECTED")}
            >
              Từ chối
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
