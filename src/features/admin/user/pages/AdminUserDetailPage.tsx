import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import {
  AdminBackButton,
  AdminDecisionDialog,
} from "../../components/AdminCommon.tsx";
import * as userApi from "../api/adminUserApi.ts";
import type { AdminUser, AdminUserStatus } from "../types/admin-user.ts";

type Props = { userId: string; navigate: (path: AdminPath) => void };
type Tab = "overview" | "events" | "orders" | "tickets";
const date = (value?: string | null) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";
const money = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value));

export function AdminUserDetailPage({ userId, navigate }: Props) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [tab, setTab] = useState<Tab>("overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function loadUser() {
      setLoading(true);
      setError("");
      try {
        const response = await userApi.findUser(userId);
        if (active) setUser(response.data.user);
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải hồ sơ người dùng.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadUser();
    return () => {
      active = false;
    };
  }, [userId, retryKey]);

  async function changeStatus(reason = "") {
    if (!user) return;
    setWorking(true);
    setDialogOpen(false);
    try {
      const status: AdminUserStatus =
        user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      const response = await userApi.setUserStatus(
        user.id,
        status,
        reason || undefined,
      );
      setUser({ ...user, ...response.data.user });
      setNotice(
        status === "ACTIVE" ? "Đã mở khóa tài khoản." : "Đã khóa tài khoản.",
      );
      setDialogOpen(false);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể cập nhật trạng thái tài khoản.",
      );
      setDialogOpen(false);
    } finally {
      setWorking(false);
    }
  }

  if (loading)
    return (
      <section
        className="grid gap-5"
        role="status"
        aria-label="Đang tải hồ sơ người dùng"
      >
        <div className="admin-loading-skeleton h-4 w-36 rounded" />
        <div className="grid gap-5 rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
          <div className="admin-loading-skeleton h-4 w-40 rounded" />
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="admin-loading-skeleton size-16 shrink-0 rounded-full" />
              <div className="grid gap-2">
                <div className="admin-loading-skeleton h-7 w-56 max-w-[60vw] rounded" />
                <div className="admin-loading-skeleton h-4 w-44 max-w-[55vw] rounded" />
                <div className="admin-loading-skeleton h-3 w-52 max-w-[60vw] rounded" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="admin-loading-skeleton h-7 w-28 rounded-full" />
              <div className="admin-loading-skeleton h-11 w-36 rounded-lg" />
            </div>
          </div>
          <div className="admin-loading-skeleton h-4 w-48 rounded" />
        </div>
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
          <div className="flex gap-3 border-b border-line px-4">
            {["w-24", "w-28", "w-24", "w-28", "w-24"].map((width, index) => (
              <div
                key={index}
                className={`admin-loading-skeleton my-4 h-4 ${width} rounded`}
              />
            ))}
          </div>
          <div className="grid gap-5 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[0, 1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="grid gap-3 rounded-xl border border-line bg-paper p-4"
                >
                  <div className="admin-loading-skeleton h-3 w-28 rounded" />
                  <div className="admin-loading-skeleton h-7 w-16 rounded" />
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-line bg-paper p-5">
              <div className="admin-loading-skeleton h-5 w-44 rounded" />
              <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="grid gap-2">
                    <div className="admin-loading-skeleton h-3 w-24 rounded" />
                    <div className="admin-loading-skeleton h-4 w-40 max-w-full rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  if (error || !user)
    return (
      <section className="grid gap-4">
        <p
          className="rounded-xl border border-error/30 bg-error/10 p-4 text-error"
          role="alert"
        >
          {error || "Không tìm thấy người dùng."}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            className="min-h-10 rounded-lg border border-line px-4 font-bold"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Thử tải lại
          </button>
          <AdminBackButton onClick={() => navigate("/admin/users")} />
        </div>
      </section>
    );

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Tổng quan" },
    { id: "events", label: `Sự kiện (${user.eventCount})` },
    { id: "orders", label: `Đơn hàng (${user.orderCount})` },
    { id: "tickets", label: `Vé sở hữu (${user.ticketCount})` },
  ];
  const field = (label: string, value: string | number | null | undefined) => (
    <div key={label}>
      <dt className="text-sm text-ink-soft">{label}</dt>
      <dd className="m-0 mt-1 break-words font-bold">
        {value ?? "Chưa có dữ liệu"}
      </dd>
    </div>
  );

  return (
    <section className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <button
          type="button"
          className="font-bold text-blue-deep hover:underline"
          onClick={() => navigate("/admin/users")}
        >
          Người dùng
        </button>
        <span aria-hidden="true"> / </span>
        <span>Chi tiết tài khoản</span>
      </nav>
      <header className="rounded-xl border border-line bg-surface p-5 shadow-sm sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/admin/users")}
          className="mb-5 min-h-10 font-bold text-blue-deep underline"
        >
          ← Danh sách người dùng
        </button>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-paper-deep text-2xl font-extrabold text-pine">
              {user.fullName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="m-0 text-xs font-extrabold uppercase tracking-widest text-coral-dark">
                Hồ sơ người dùng
              </p>
              <h1 className="mb-0 mt-1 break-words text-2xl font-extrabold sm:text-3xl">
                {user.fullName}
              </h1>
              <p className="mb-0 mt-1 break-all text-sm text-ink-soft">
                {user.email}
              </p>
              <p className="mb-0 mt-1 break-all font-mono text-xs text-ink-soft">
                ID: {user.id}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-extrabold ${user.status === "ACTIVE" ? "border-success/30 bg-mint text-success" : "border-error/30 bg-error/10 text-error"}`}
            >
              {user.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}
            </span>
            <button
              type="button"
              disabled={working || user.role === "ADMIN"}
              onClick={() => setDialogOpen(true)}
              className={`min-h-11 rounded-lg px-4 font-extrabold ${user.status === "ACTIVE" ? "border border-error/40 text-error hover:bg-error/10" : "bg-pine text-paper hover:bg-pine/90"}`}
            >
              {user.status === "ACTIVE"
                ? "Khóa tài khoản"
                : "Mở khóa tài khoản"}
            </button>
          </div>
        </div>
        <p className="mb-0 mt-4 text-sm text-ink-soft">
          Tham gia ngày {date(user.createdAt)}
        </p>
      </header>
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-mint p-4 text-sm text-success"
        >
          {notice}
        </p>
      )}
      {working && (
        <p
          role="status"
          className="rounded-xl border border-blue-deep/30 bg-google-hover p-4 text-sm text-blue-deep"
        >
          Đang cập nhật trạng thái tài khoản…
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-line bg-surface shadow-sm">
        <div
          role="tablist"
          aria-label="Nội dung hồ sơ"
          className="flex min-w-max border-b border-line px-2"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={`min-h-12 border-b-2 px-4 text-sm font-bold transition ${tab === item.id ? "border-pine text-pine" : "border-transparent text-ink-soft hover:text-ink"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 sm:p-6" role="tabpanel">
          {tab === "overview" && (
            <div className="grid gap-5">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  { label: "Sự kiện đã tổ chức", value: user.eventCount },
                  { label: "Tổng đơn hàng", value: user.orderCount },
                  { label: "Vé sở hữu", value: user.ticketCount },
                  { label: "Vai trò", value: user.role },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-xl border border-line bg-paper p-4"
                  >
                    <p className="m-0 text-xs font-bold text-ink-soft">
                      {item.label}
                    </p>
                    <strong className="mt-2 block text-2xl font-extrabold text-pine">
                      {item.value}
                    </strong>
                  </article>
                ))}
              </div>
              <section className="rounded-xl border border-line bg-paper p-5">
                <h2 className="m-0 text-lg font-extrabold text-pine">
                  Thông tin cá nhân
                </h2>
                <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                  {field("Họ và tên", user.fullName)}
                  {field("Email", user.email)}
                  {field("Số điện thoại", user.phone)}
                  {field("Vai trò", user.role)}
                  {field(
                    "Trạng thái tài khoản",
                    user.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa",
                  )}
                  {field("Ngày đăng ký", date(user.createdAt))}
                </dl>
              </section>
            </div>
          )}
          {tab === "events" &&
            (user.organizedEvents.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-paper/70 text-xs uppercase text-ink-soft">
                    <tr>
                      <th className="px-4 py-3">Sự kiện</th>
                      <th className="px-4 py-3">Ngày tạo</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3"> </th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.organizedEvents.map((event) => (
                      <tr
                        key={event.id}
                        className="border-t border-line hover:bg-paper/50"
                      >
                        <td className="px-4 py-4 font-bold">{event.title}</td>
                        <td className="px-4 py-4">
                          {date(event.startAt ?? event.createdAt)}
                        </td>
                        <td className="px-4 py-4">{event.status}</td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            className="font-bold text-blue-deep underline"
                            onClick={() =>
                              navigate(
                                `/admin/events/${encodeURIComponent(event.id)}/details`,
                              )
                            }
                          >
                            Xem sự kiện
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-4 text-xs text-ink-soft">
                  Đang hiển thị tối đa 10 sự kiện gần nhất.
                </p>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">
                Người dùng chưa tổ chức sự kiện nào.
              </p>
            ))}
          {tab === "orders" &&
            (user.orders.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-paper/70 text-xs uppercase text-ink-soft">
                    <tr>
                      <th className="px-4 py-3">Mã đơn hàng</th>
                      <th className="px-4 py-3">Ngày đặt</th>
                      <th className="px-4 py-3">Tổng tiền</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Thanh toán</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.orders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-t border-line hover:bg-paper/50"
                      >
                        <td className="px-4 py-4 font-mono text-xs font-bold">
                          {order.id}
                        </td>
                        <td className="px-4 py-4">{date(order.createdAt)}</td>
                        <td className="px-4 py-4 font-bold">
                          {money(order.total)}
                        </td>
                        <td className="px-4 py-4">{order.status}</td>
                        <td className="px-4 py-4">
                          {order.paymentStatus ?? "Chưa có dữ liệu"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="px-4 text-xs text-ink-soft">
                  Đang hiển thị tối đa 10 đơn hàng gần nhất.
                </p>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">
                Người dùng chưa có đơn hàng.
              </p>
            ))}
          {tab === "tickets" &&
            (user.tickets.length ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {user.tickets.map((ticket) => (
                    <article
                      key={ticket.id}
                      className="rounded-xl border border-line bg-paper p-4"
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <strong>{ticket.event.title}</strong>
                        <span className="rounded-full bg-paper-deep px-2.5 py-1 text-xs font-bold">
                          {ticket.status}
                        </span>
                      </div>
                      <p className="mb-0 mt-2 text-sm text-ink-soft">
                        {ticket.ticketType} · {date(ticket.event.startAt)}
                      </p>
                      <p className="mb-0 mt-2 font-mono text-xs">
                        {ticket.code}
                      </p>
                      <p className="mb-0 mt-2 text-xs text-ink-soft">
                        {ticket.transferred
                          ? "Có lịch sử chuyển nhượng"
                          : "Chưa ghi nhận chuyển nhượng"}
                      </p>
                    </article>
                  ))}
                </div>
                <p className="mt-3 text-xs text-ink-soft">
                  Đang hiển thị tối đa 20 vé gần nhất.
                </p>
              </>
            ) : (
              <p className="py-8 text-center text-sm text-ink-soft">
                Người dùng chưa có vé.
              </p>
            ))}
        </div>
      </div>
      {dialogOpen && (
        <AdminDecisionDialog
          open
          title={
            user.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa tài khoản"
          }
          description={
            user.status === "ACTIVE"
              ? `Tài khoản ${user.fullName} (${user.email}) sẽ không thể tiếp tục đăng nhập. Nhập lý do để lưu cùng quyết định.`
              : `Xác nhận mở khóa tài khoản ${user.fullName} (${user.email})?`
          }
          confirmLabel={
            working
              ? "Đang xử lý…"
              : user.status === "ACTIVE"
                ? "Khóa tài khoản"
                : "Mở khóa"
          }
          operation={user.status === "ACTIVE" ? "suspend_user" : "restore_user"}
          onCancel={() => !working && setDialogOpen(false)}
          onConfirm={(reason) => void changeStatus(reason)}
        />
      )}
    </section>
  );
}
