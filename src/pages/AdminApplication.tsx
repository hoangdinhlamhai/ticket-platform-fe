import { useCallback, type ReactNode } from "react";
import { AdminLayout } from "../layouts/AdminLayout.tsx";
import {
  getAdminEventId,
  getAdminRoute,
  type AdminPath,
} from "../routes/admin-route.ts";
import { AdminMissingRecord } from "../features/admin/index.ts";
import type { AdminWorkspaceController } from "../features/admin/hooks/admin-workspace-controller.ts";
import type { AdminOperationResult } from "../features/admin/types/admin-workspace.ts";
import {
  AdminEventListPage,
  AdminEventReviewDetailPage,
} from "../features/admin/event/index.ts";
import { RealAdminPage } from "../features/admin/components/RealAdminPage.tsx";
import { getAdminAccessState } from "./admin-access.ts";
import type { AuthStatus } from "../features/auth/hooks/useAuth.ts";
import type { AttendeeUser } from "../features/auth/types/authContract.ts";

type Props = {
  readonly pathname: string;
  readonly workspace: AdminWorkspaceController;
  readonly onPathnameChange: (path: AdminPath) => void;
  readonly onExitToAttendee: () => void;
  readonly accessToken: string | null;
  readonly authStatus: AuthStatus;
  readonly authUser: AttendeeUser | null;
};

function getOperationNotice(operation: AdminOperationResult | null) {
  if (!operation) return "";
  if (operation.kind === "event_reviewed")
    return "Đã cập nhật quyết định xét duyệt sự kiện.";
  return operation.reason ?? "Không thể thực hiện thao tác này.";
}

export function AdminApplication({
  pathname,
  workspace,
  onPathnameChange,
  onExitToAttendee,
  accessToken,
  authStatus,
  authUser,
}: Props) {
  const route = getAdminRoute(pathname);
  const access = getAdminAccessState({
    status: authStatus,
    user: authUser,
    accessToken,
  });
  const eventId = getAdminEventId(pathname);
  const adminToken = accessToken as string;
  const navigate = useCallback(
    (destination: AdminPath) => {
      if (destination === pathname) return;
      workspace.clearLastOperation();
      onPathnameChange(destination);
    },
    [onPathnameChange, pathname, workspace],
  );
  const navigatePage = useCallback(
    (destination: string) => {
      if (!destination.startsWith("/admin")) return;
      navigate(destination as AdminPath);
    },
    [navigate],
  );

  let page: ReactNode;
  if (access.kind !== "allowed") {
    page = (
      <section
        className="grid min-h-64 place-items-center rounded-lg border border-line bg-surface p-6 text-center"
        role={access.kind === "restoring" ? "status" : "alert"}
      >
        <div>
          <h1 className="text-2xl font-extrabold">{access.message}</h1>
          {access.kind === "not-logged-in" && (
            <p className="mt-2 text-ink-soft">
              Vui lòng đăng nhập bằng tài khoản quản trị để tiếp tục.
            </p>
          )}
        </div>
      </section>
    );
  } else if (route === "dashboard")
    page = <RealAdminPage accessToken={adminToken} kind="dashboard" />;
  else if (route === "users")
    page = <RealAdminPage accessToken={adminToken} kind="users" />;
  else if (route === "events-all")
    page = (
      <AdminEventListPage
        mode="all"
        navigate={navigatePage}
      />
    );
  else if (route === "organizers")
    page = <RealAdminPage accessToken={adminToken} kind="organizers" />;
  else if (route === "orders")
    page = <RealAdminPage accessToken={adminToken} kind="orders" />;
  else if (route === "payments")
    page = <RealAdminPage accessToken={adminToken} kind="payments" />;
  else if (route === "refunds")
    page = <RealAdminPage accessToken={adminToken} kind="refunds" />;
  else if (route === "categories")
    page = <RealAdminPage accessToken={adminToken} kind="categories" />;
  else if (route === "resale")
    page = <RealAdminPage accessToken={adminToken} kind="resale" />;
  else if (route === "resale-transactions")
    page = (
      <RealAdminPage accessToken={adminToken} kind="resale-transactions" />
    );
  else if (route === "event-reviews")
    page = (
      <AdminEventListPage
        mode="pending"
        navigate={navigatePage}
      />
    );
  else if (route === "event-review-detail" && eventId)
    page = (
      <AdminEventReviewDetailPage
        eventId={eventId}
        navigate={navigatePage}
      />
    );
  else
    page = (
      <AdminMissingRecord
        title="Không tìm thấy trang Admin"
        navigate={navigatePage}
      />
    );

  const pendingCount = 0;
  return (
    <AdminLayout
      activeRoute={route}
      notice={getOperationNotice(workspace.lastOperation)}
      onAcknowledgeNotice={workspace.clearLastOperation}
      onExitToAttendee={onExitToAttendee}
      onNavigate={navigate}
      pendingCount={pendingCount}
    >
      <div className="space-y-6">{page}</div>
    </AdminLayout>
  );
}
