import type { AdminPath } from "../../../../routes/admin-route.ts";
import type { AdminUserRow } from "../types/admin-user.ts";

type Props = {
  users: readonly AdminUserRow[];
  navigate: (path: AdminPath) => void;
  onStatus: (user: AdminUserRow) => void;
};

const date = (value: string) => new Date(value).toLocaleDateString("vi-VN");

export function AdminUserList({ users, navigate, onStatus }: Props) {
  if (!users.length)
    return (
      <div className="grid min-h-56 place-items-center p-8 text-center">
        <div>
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-full bg-paper-deep text-xl text-ink-soft"
          >
            ⌕
          </span>
          <h3 className="mb-0 mt-3 text-base font-extrabold text-pine">
            Không tìm thấy người dùng
          </h3>
          <p className="mb-0 mt-1 text-sm text-ink-soft">
            Thử thay đổi từ khóa hoặc bộ lọc.
          </p>
        </div>
      </div>
    );
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1050px] text-left text-sm">
        <thead className="bg-paper/70 text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            {[
              "Người dùng",
              "Email",
              "Điện thoại",
              "Vai trò",
              "Sự kiện",
              "Đơn hàng",
              "Ngày tham gia",
              "Trạng thái",
              "Thao tác",
            ].map((label) => (
              <th className="px-4 py-3 font-bold" key={label}>
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() =>
                navigate(`/admin/users/${encodeURIComponent(user.id)}`)
              }
              className="cursor-pointer border-t border-line transition-colors hover:bg-paper/40"
            >
              <td className="px-4 py-4">
                <span className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-paper-deep font-extrabold text-pine">
                    {user.fullName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate">{user.fullName}</strong>
                    <span className="block max-w-40 truncate font-mono text-[11px] text-ink-soft">
                      {user.id}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-4 py-4">{user.email}</td>
              <td className="px-4 py-4">{user.phone || "—"}</td>
              <td className="px-4 py-4">{user.role}</td>
              <td className="px-4 py-4">{user.eventCount}</td>
              <td className="px-4 py-4">{user.orderCount}</td>
              <td className="whitespace-nowrap px-4 py-4 text-ink-soft">
                {date(user.createdAt)}
              </td>
              <td className="px-4 py-4">
                <span
                  className={`inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-extrabold ${user.status === "ACTIVE" ? "border-success/30 bg-mint text-success" : "border-error/30 bg-error/10 text-error"}`}
                >
                  {user.status === "ACTIVE" ? "Đang hoạt động" : "Đã khóa"}
                </span>
              </td>
              <td className="px-4 py-4">
                <details
                  className="relative"
                  onClick={(event) => event.stopPropagation()}
                >
                  <summary className="min-h-9 cursor-pointer list-none rounded-lg border border-line px-3 py-2 text-center font-bold text-pine hover:bg-paper-deep">
                    Thao tác
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 grid min-w-40 gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
                    <button
                      type="button"
                      className="rounded px-3 py-2 text-left text-sm font-bold hover:bg-paper-deep"
                      onClick={() =>
                        navigate(`/admin/users/${encodeURIComponent(user.id)}`)
                      }
                    >
                      Xem chi tiết
                    </button>
                    <button
                      type="button"
                      disabled={user.role === "ADMIN"}
                      className="rounded px-3 py-2 text-left text-sm font-bold hover:bg-paper-deep disabled:opacity-50"
                      onClick={() => onStatus(user)}
                    >
                      {user.role === "ADMIN"
                        ? "Quản trị viên"
                        : user.status === "ACTIVE"
                          ? "Khóa tài khoản"
                          : "Mở khóa tài khoản"}
                    </button>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
