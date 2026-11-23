import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { AdminDecisionDialog } from "../../components/AdminCommon.tsx";
import * as userApi from "../api/adminUserApi.ts";
import { AdminUserList } from "../components/AdminUserList.tsx";
import type {
  AdminUserMetrics,
  AdminUserRow,
  AdminUserStatus,
} from "../types/admin-user.ts";

type Props = { navigate: (path: AdminPath) => void };
const emptyMetrics: AdminUserMetrics = {
  total: 0,
  newThisMonth: 0,
  active: 0,
  locked: 0,
};

export function AdminUsersPage({ navigate }: Props) {
  const [users, setUsers] = useState<readonly AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [metrics, setMetrics] = useState(emptyMetrics);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"" | AdminUserStatus>("");
  const [organized, setOrganized] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [selected, setSelected] = useState<AdminUserRow | null>(null);
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState("");
  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(
      () => {
        async function loadUsers() {
          setLoading(true);
          setError("");
          try {
            const [list, summary] = await Promise.all([
              userApi.findUsers({
                q: query.trim() || undefined,
                status: status || undefined,
                organized: organized
                  ? (organized as "true" | "false")
                  : undefined,
                from: from || undefined,
                to: to || undefined,
                page,
                pageSize,
              }),
              userApi.findUserMetrics(),
            ]);
            if (!active) return;
            setUsers(list.data.users);
            setTotal(list.data.total);
            setMetrics(summary.data);
          } catch (cause) {
            if (active)
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Không thể tải danh sách người dùng.",
              );
          } finally {
            if (active) setLoading(false);
          }
        }
        void loadUsers();
      },
      query ? 250 : 0,
    );
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query, status, organized, from, to, page, pageSize, retryKey]);

  async function submitStatus(reason = "") {
    if (!selected) return;
    setWorking(true);
    const account = selected;
    setSelected(null);
    try {
      const nextStatus: AdminUserStatus =
        selected.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
      await userApi.setUserStatus(account.id, nextStatus, reason || undefined);
      setNotice(
        nextStatus === "SUSPENDED"
          ? `Đã khóa tài khoản ${account.fullName}.`
          : `Đã mở khóa tài khoản ${account.fullName}.`,
      );
      setSelected(null);
      setRetryKey((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể cập nhật trạng thái tài khoản.",
      );
      setSelected(null);
    } finally {
      setWorking(false);
    }
  }

  const cards = [
    {
      label: "Tổng số người dùng",
      value: metrics.total,
      icon: "♙",
      tone: "text-pine",
      sub: "Trên toàn hệ thống",
    },
    {
      label: "Người dùng mới",
      value: metrics.newThisMonth,
      icon: "+",
      tone: "text-blue-deep",
      sub: "Trong tháng này",
    },
    {
      label: "Đang hoạt động",
      value: metrics.active,
      icon: "✓",
      tone: "text-success",
      sub: "Tài khoản hoạt động",
    },
    {
      label: "Đã khóa",
      value: metrics.locked,
      icon: "⊘",
      tone: "text-error",
      sub: "Tài khoản bị khóa",
    },
  ];

  return (
    <section className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none">
      <header>
        <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
          Admin · Tài khoản
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">Người dùng</h1>
        <p className="mt-2 text-ink-soft">
          Quản lý tài khoản và theo dõi hoạt động người dùng trên toàn hệ thống.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {cards.map((card) => (
          <article
            key={card.label}
            className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 text-sm font-semibold text-ink-soft">
                {card.label}
              </p>
              <span
                aria-hidden="true"
                className={`grid size-9 place-items-center rounded-lg bg-paper-deep text-lg font-bold ${card.tone}`}
              >
                {card.icon}
              </span>
            </div>
            <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
              {loading ? "—" : card.value.toLocaleString("vi-VN")}
            </p>
            <p className="mb-0 mt-1 text-xs text-ink-soft">{card.sub}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_13rem_13rem_12rem_12rem_auto]">
        <div className="hidden sm:block">
          <h2 className="m-0 text-base font-extrabold text-pine">
            Lọc người dùng
          </h2>
          <p className="mb-0 mt-1 text-xs text-ink-soft">
            Tìm kiếm và thu hẹp danh sách
          </p>
        </div>
        <label className="text-xs font-bold text-ink-soft">
          Tìm kiếm
          <input
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
            placeholder="Tên, email hoặc số điện thoại"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Trạng thái
          <select
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | AdminUserStatus);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="SUSPENDED">Đã khóa</option>
          </select>
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Tổ chức sự kiện
          <select
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
            value={organized}
            onChange={(event) => {
              setOrganized(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả</option>
            <option value="true">Đã tổ chức sự kiện</option>
            <option value="false">Chưa tổ chức sự kiện</option>
          </select>
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Từ ngày
          <input
            type="date"
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
            value={from}
            onChange={(event) => {
              setFrom(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="text-xs font-bold text-ink-soft">
          Đến ngày
          <input
            type="date"
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <button
          type="button"
          onClick={() => {
            setQuery("");
            setStatus("");
            setOrganized("");
            setFrom("");
            setTo("");
            setPage(1);
          }}
          className="min-h-11 self-end rounded-lg border border-line px-3 text-sm font-bold text-ink-soft transition hover:border-pine hover:text-pine"
        >
          Đặt lại
        </button>
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-mint p-4 text-sm text-success"
        >
          {notice}
          <button
            type="button"
            className="ml-3 font-bold underline"
            onClick={() => setNotice("")}
          >
            Đóng
          </button>
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
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          <span>{error}</span>
          <button
            className="min-h-10 rounded-lg border border-error/30 px-4 font-bold"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Thử tải lại
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <h2 className="m-0 text-base font-extrabold text-pine">
              Danh sách người dùng
            </h2>
            <p className="mb-0 mt-1 text-xs text-ink-soft">
              {total.toLocaleString("vi-VN")} kết quả · Trang {page} /{" "}
              {pageCount}
            </p>
          </div>
          <span className="text-xs text-ink-soft">
            Chọn người dùng để xem hồ sơ
          </span>
        </div>
        {loading ? (
          <div
            className="grid gap-3 p-4"
            role="status"
            aria-label="Đang tải người dùng"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse rounded-lg bg-paper-deep"
              />
            ))}
          </div>
        ) : error ? null : (
          <AdminUserList
            users={users}
            navigate={navigate}
            onStatus={(user) => setSelected(user)}
          />
        )}
      </div>
      {!loading && !error && total > pageSize && (
        <nav
          aria-label="Phân trang người dùng"
          className="flex items-center justify-between text-sm text-ink-soft"
        >
          <span>
            Trang {page} / {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Trước
            </button>
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold disabled:opacity-50"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Tiếp
            </button>
          </div>
        </nav>
      )}
      {selected && (
        <AdminDecisionDialog
          open
          title={
            selected.status === "ACTIVE"
              ? "Khóa tài khoản"
              : "Mở khóa tài khoản"
          }
          description={
            selected.status === "ACTIVE"
              ? `Tài khoản ${selected.fullName} (${selected.email}) sẽ không thể tiếp tục sử dụng các tính năng cần đăng nhập. Hãy nhập lý do để lưu cùng quyết định.`
              : `Xác nhận mở khóa tài khoản ${selected.fullName} (${selected.email})? Người dùng có thể đăng nhập và sử dụng tài khoản trở lại.`
          }
          confirmLabel={
            working
              ? "Đang xử lý…"
              : selected.status === "ACTIVE"
                ? "Khóa tài khoản"
                : "Mở khóa"
          }
          operation={
            selected.status === "ACTIVE" ? "suspend_user" : "restore_user"
          }
          onCancel={() => !working && setSelected(null)}
          onConfirm={(reason) => void submitStatus(reason)}
        />
      )}
    </section>
  );
}
