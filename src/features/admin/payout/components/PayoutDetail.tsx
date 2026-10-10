import type { AdminPayout } from "../types/admin-payout.ts";

type Props = {
  payout: AdminPayout;
  onBack: () => void;
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

export function PayoutDetail({ payout, onBack }: Props) {
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
            <Detail label="Chi nhánh" value={payout.bankAccount.branch} />
          </dl>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            Chưa có thông tin tài khoản.
          </p>
        )}
      </section>

      <section className="flex flex-wrap justify-end gap-3 rounded-lg border border-line bg-surface p-5">
        <button
          className="min-h-11 rounded border border-error/40 px-4 font-extrabold text-error"
          type="button"
        >
          Từ chối payout
        </button>
        <button
          className="min-h-11 rounded bg-pine px-4 font-extrabold text-paper"
          type="button"
        >
          Duyệt payout
        </button>
      </section>
    </section>
  );
}
