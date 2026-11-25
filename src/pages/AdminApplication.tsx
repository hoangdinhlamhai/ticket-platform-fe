import { useCallback, type ReactNode } from "react";
import { AdminLayout } from "../layouts/admin/AdminLayout.tsx";
import {
  getAdminEventId,
  getAdminCaseId,
  getAdminPayoutId,
  getAdminUserId,
  getAdminResaleTransactionId,
  getAdminResaleListingId,
  getAdminOrderId,
  getAdminRoute,
  type AdminPath,
} from "../routes/admin-route.ts";
import {
  AdminMissingRecord,
  AdminCaseDetailPage,
  AdminCaseListPage,
  AdminResalePage,
} from "../features/admin/index.ts";
import type { AdminWorkspaceController } from "../features/admin/hooks/admin-workspace-controller.ts";
import type { AdminOperationResult } from "../features/admin/types/admin-workspace.ts";
import {
  AdminEventDetail,
  AdminEventsPage,
  AdminPendingEventsPage,
} from "../features/admin/event/index.ts";
import {
  PayoutDetailPage,
  PayoutListPage,
} from "../features/admin/payout/index.ts";
import { ResaleTransactionsPage } from "../features/admin/resale/pages/ResaleTransactionsPage.tsx";
import { AdminResaleListingDetailPage } from "../features/admin/resale/pages/AdminResaleListingDetailPage.tsx";
import { AdminDashboardPage } from "../features/admin/dashboard/pages/AdminDashboardPage.tsx";
import { AdminTransactionsPage } from "../features/admin/transactions/pages/AdminTransactionsPage.tsx";
import { AdminOrderDetailPage } from "../features/admin/order/pages/AdminOrderDetailPage.tsx";
import { AdminCategoriesPage } from "../features/admin/category/index.ts";
import {
  AdminUserDetailPage,
  AdminUsersPage,
} from "../features/admin/user/index.ts";
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
  const caseId = getAdminCaseId(pathname);
  const payoutId = getAdminPayoutId(pathname);
  const userId = getAdminUserId(pathname);
  const resaleTransactionId = getAdminResaleTransactionId(pathname);
  const resaleListingId = getAdminResaleListingId(pathname);
  const orderId = getAdminOrderId(pathname);
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
    page = <AdminDashboardPage navigate={navigatePage} />;
  else if (route === "users") page = <AdminUsersPage navigate={navigate} />;
  else if (route === "order-detail" && orderId)
    page = <AdminOrderDetailPage orderId={orderId} navigate={navigate} />;
  else if (route === "user-detail" && userId)
    page = <AdminUserDetailPage userId={userId} navigate={navigate} />;
  else if (route === "events-all")
    page = <AdminEventsPage navigate={navigatePage} />;
  else if (["orders", "payments", "refunds"].includes(route))
    page = (
      <AdminTransactionsPage
        route={route as "orders" | "payments" | "refunds"}
        navigate={navigate}
      />
    );
  else if (route === "payouts") page = <PayoutListPage navigate={navigate} />;
  else if (route === "payout-detail" && payoutId)
    page = <PayoutDetailPage payoutId={payoutId} navigate={navigate} />;
  else if (route === "categories") page = <AdminCategoriesPage />;
  else if (route === "resale") page = <AdminResalePage navigate={navigate} />;
  else if (route === "resale-listing-detail" && resaleListingId)
    page = (
      <AdminResaleListingDetailPage
        listingId={resaleListingId}
        navigate={navigate}
      />
    );
  else if (route === "resale-complaints")
    page = (
      <AdminCaseListPage
        controller={workspace}
        navigate={navigatePage}
        subjectTypeFilter="resale"
      />
    );
  else if (route === "cases")
    page = <AdminCaseListPage controller={workspace} navigate={navigatePage} />;
  else if (route === "case-detail" && caseId)
    page = (
      <AdminCaseDetailPage
        controller={workspace}
        caseId={caseId}
        navigate={navigatePage}
      />
    );
  else if (
    route === "resale-transactions" ||
    route === "resale-transaction-detail"
  )
    page = (
      <ResaleTransactionsPage
        transactionId={resaleTransactionId}
        navigate={navigate}
      />
    );
  else if (route === "event-reviews")
    page = <AdminPendingEventsPage navigate={navigatePage} />;
  else if (route === "event-review-detail" && eventId)
    page = (
      <AdminEventDetail eventId={eventId} reviewMode navigate={navigatePage} />
    );
  else if (route === "event-detail" && eventId)
    page = (
      <AdminEventDetail
        eventId={eventId}
        reviewMode={false}
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
      activeRoute={
        route === "payout-detail"
          ? "payouts"
          : route === "user-detail"
            ? "users"
            : route === "order-detail"
              ? "orders"
              : route === "resale-transaction-detail"
                ? "resale-transactions"
                : route === "resale-listing-detail"
                  ? "resale"
                  : route === "case-detail" &&
                      workspace.workspace.cases.some(
                        (item) =>
                          item.id === caseId && item.subjectType === "resale",
                      )
                    ? "resale-complaints"
                    : route
      }
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
