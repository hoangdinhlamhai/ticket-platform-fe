import { useEffect, useMemo, useState, type ReactNode } from "react";
import { EyeOff, ListChecks, TicketCheck, WalletCards } from "lucide-react";
import {
  adminStatusLabel,
  adminStatusTone,
  formatAdminMoney,
} from "../../helpers/admin-display.ts";
import { matchesAdminQuery } from "../../helpers/filter-admin-records.ts";
import type { AdminSensitiveOperation } from "../../helpers/admin-transitions.ts";
import type { AdminWorkspaceController } from "../../hooks/admin-workspace-controller.ts";
import { AdminDataTable } from "../../components/AdminDataTable.tsx";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { useResaleStats } from "../../resale/hooks/use-resale-stats.ts";
import * as adminApi from "../../api/adminApi.ts";
import { ResaleSectionTabs } from "../../resale/components/ResaleSectionTabs.tsx";
import { ResaleStatsCards } from "../../resale/components/ResaleStatsCards.tsx";
import {
  AdminDecisionDialog,
  AdminFilterToolbar,
  AdminPageHeader,
  AdminRecordDrawer,
  AdminStatusBadge,
} from "../../components/AdminCommon.tsx";

type Decision = {
  readonly title: string;
  readonly description: string;
  readonly confirm: string;
  readonly operation: AdminSensitiveOperation;
  readonly submit: (reason: string) => void;
};
type Choice = { readonly value: string; readonly label: string };

const statusChoices = (values: readonly string[]): readonly Choice[] =>
  values.map((value) => ({ value, label: adminStatusLabel(value) }));
const resaleStatusLabel = (status: string) =>
  ({
    ACTIVE: "Đang bán",
    RESERVED: "Đang giữ chỗ",
    SOLD: "Đã bán",
    WITHDRAWN: "Đã rút",
  })[status] ?? status;
const organizerStatusOptions = statusChoices([
  "not_submitted",
  "pending",
  "changes_requested",
  "verified",
  "rejected",
  "active",
  "restricted",
  "suspended",
]);
const accountStatusOptions = statusChoices([
  "active",
  "restricted",
  "suspended",
]);
const orderStatusOptions = statusChoices(["completed", "failed", "refunded"]);

function AdminSelect({
  label,
  value,
  choices,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly choices: readonly Choice[];
  readonly onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <select
        className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {choices.map((choice) => (
          <option key={choice.value} value={choice.value}>
            {choice.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function DecisionDialog({
  decision,
  onClose,
}: {
  readonly decision: Decision | null;
  readonly onClose: () => void;
}) {
  return (
    <AdminDecisionDialog
      open={Boolean(decision)}
      title={decision?.title ?? ""}
      description={decision?.description ?? ""}
      confirmLabel={decision?.confirm ?? ""}
      operation={decision?.operation ?? "approve_event"}
      onCancel={onClose}
      onConfirm={(reason) => {
        decision?.submit(reason);
        onClose();
      }}
    />
  );
}

function RecordBody({ children }: { readonly children: ReactNode }) {
  return (
    <div className="grid gap-4 py-5 text-sm text-ink-soft">{children}</div>
  );
}
function Status({ value }: { readonly value: string }) {
  return (
    <AdminStatusBadge
      label={adminStatusLabel(value)}
      tone={adminStatusTone(value)}
    />
  );
}
function relatedCases(
  controller: AdminWorkspaceController,
  subjectType: string,
  subjectId: string,
) {
  return controller.workspace.cases.filter(
    (item) => item.subjectType === subjectType && item.subjectId === subjectId,
  );
}
function RelatedList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: readonly string[];
}) {
  return (
    <section>
      <h3 className="m-0 text-base font-extrabold text-ink">{title}</h3>
      {items.length ? (
        <ul className="mt-2 grid gap-1">
          <>
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </>
        </ul>
      ) : (
        <p className="mb-0 mt-2">Không có bản ghi liên quan trong fixture.</p>
      )}
    </section>
  );
}
function Actions({
  items,
}: {
  readonly items: readonly {
    readonly label: string;
    readonly tone?: "neutral" | "coral" | "critical";
    readonly onClick: () => void;
  }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          className={`min-h-11 rounded border px-3 text-sm font-extrabold ${item.tone === "critical" ? "border-error bg-error text-paper" : item.tone === "coral" ? "border-coral text-coral-dark" : "border-blue text-blue-deep"}`}
          key={item.label}
          type="button"
          onClick={item.onClick}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function AdminOrganizerPage({
  controller,
}: {
  readonly controller: AdminWorkspaceController;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [verification, setVerification] = useState("");
  const [account, setAccount] = useState("");
  const [city, setCity] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const cities = [
    ...new Set(controller.workspace.organizers.map((item) => item.city)),
  ];
  const organizers = useMemo(
    () =>
      controller.workspace.organizers.filter(
        (item) =>
          (!status ||
            item.verificationStatus === status ||
            item.accountStatus === status) &&
          (!verification || item.verificationStatus === verification) &&
          (!account || item.accountStatus === account) &&
          (!city || item.city === city) &&
          matchesAdminQuery(query, [
            item.name,
            item.email,
            item.contactName,
            item.city,
          ]),
      ),
    [
      account,
      city,
      controller.workspace.organizers,
      query,
      status,
      verification,
    ],
  );
  const selected =
    controller.workspace.organizers.find((item) => item.id === selectedId) ??
    null;
  const ask = (
    title: string,
    operation: AdminSensitiveOperation,
    submit: (reason: string) => void,
  ) =>
    setDecision({
      title,
      description:
        "Thao tác chỉ đổi trạng thái trong phiên và ghi đúng một audit entry.",
      confirm: title,
      operation,
      submit,
    });
  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="TÀI KHOẢN" title="Organizer">
        Xác minh hồ sơ và quản lý hạn chế tài khoản mô phỏng.
      </AdminPageHeader>
      <AdminFilterToolbar
        query={query}
        status={status}
        statusOptions={organizerStatusOptions}
        resultCount={organizers.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-3">
        <AdminSelect
          label="Xác minh"
          value={verification}
          onChange={setVerification}
          choices={[
            { value: "", label: "Tất cả hồ sơ" },
            ...[
              "not_submitted",
              "pending",
              "changes_requested",
              "verified",
              "rejected",
            ].map((value) => ({ value, label: adminStatusLabel(value) })),
          ]}
        />
        <AdminSelect
          label="Tài khoản"
          value={account}
          onChange={setAccount}
          choices={[
            { value: "", label: "Tất cả tài khoản" },
            ...["active", "restricted", "suspended"].map((value) => ({
              value,
              label: adminStatusLabel(value),
            })),
          ]}
        />
        <AdminSelect
          label="Thành phố"
          value={city}
          onChange={setCity}
          choices={[
            { value: "", label: "Tất cả thành phố" },
            ...cities.map((value) => ({ value, label: value })),
          ]}
        />
      </div>
      <AdminDataTable
        label="Danh sách Organizer"
        headers={["Organizer", "Xác minh", "Tài khoản", "GMV", "Refund rate"]}
        rows={organizers.map((item) => ({
          key: item.id,
          cells: [
            <span key="name">
              <strong>{item.name}</strong>
              <span className="block text-ink-soft">{item.city}</span>
            </span>,
            <Status key="verify" value={item.verificationStatus} />,
            <Status key="account" value={item.accountStatus} />,
            formatAdminMoney(item.grossSales),
            `${item.refundRate * 100}%`,
          ],
          onOpen: () => setSelectedId(item.id),
        }))}
      />
      <AdminRecordDrawer
        open={Boolean(selected)}
        title={selected?.name ?? ""}
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <RecordBody>
            <p>
              <strong>Liên hệ:</strong> {selected.contactName} ·{" "}
              {selected.email}
            </p>
            <RelatedList title="Giấy tờ demo" items={selected.documents} />
            <RelatedList
              title="Sự kiện liên quan"
              items={controller.workspace.events
                .filter((item) => item.organizerId === selected.id)
                .map(
                  (item) =>
                    `${item.title} · ${adminStatusLabel(item.reviewStatus)}`,
                )}
            />
            <RelatedList
              title="Payout liên quan"
              items={controller.workspace.payouts
                .filter((item) => item.organizerId === selected.id)
                .map(
                  (item) =>
                    `${item.id} · ${formatAdminMoney(item.netAmount)} · ${adminStatusLabel(item.status)}`,
                )}
            />
            <RelatedList
              title="Vụ việc liên quan"
              items={relatedCases(controller, "organizer", selected.id).map(
                (item) => `${item.id} · ${item.summary}`,
              )}
            />
            <Actions
              items={[
                ...(selected.verificationStatus === "pending"
                  ? [
                      {
                        label: "Xác minh",
                        onClick: () =>
                          ask(
                            "Xác minh Organizer",
                            "verify_organizer",
                            (reason) =>
                              controller.decideOrganizerVerification(
                                selected.id,
                                "verified",
                                reason,
                              ),
                          ),
                      },
                      {
                        label: "Yêu cầu bổ sung",
                        tone: "coral" as const,
                        onClick: () =>
                          ask(
                            "Yêu cầu bổ sung hồ sơ",
                            "request_organizer_changes",
                            (reason) =>
                              controller.decideOrganizerVerification(
                                selected.id,
                                "changes_requested",
                                reason,
                              ),
                          ),
                      },
                      {
                        label: "Từ chối hồ sơ",
                        tone: "critical" as const,
                        onClick: () =>
                          ask("Từ chối hồ sơ", "reject_organizer", (reason) =>
                            controller.decideOrganizerVerification(
                              selected.id,
                              "rejected",
                              reason,
                            ),
                          ),
                      },
                    ]
                  : []),
                ...(selected.accountStatus === "active"
                  ? [
                      {
                        label: "Hạn chế",
                        tone: "coral" as const,
                        onClick: () =>
                          ask(
                            "Hạn chế Organizer",
                            "restrict_organizer",
                            (reason) =>
                              controller.setOrganizerAccountStatus(
                                selected.id,
                                "restricted",
                                reason,
                              ),
                          ),
                      },
                      {
                        label: "Tạm ngưng",
                        tone: "critical" as const,
                        onClick: () =>
                          ask(
                            "Tạm ngưng Organizer",
                            "suspend_organizer",
                            (reason) =>
                              controller.setOrganizerAccountStatus(
                                selected.id,
                                "suspended",
                                reason,
                              ),
                          ),
                      },
                    ]
                  : [
                      {
                        label: "Khôi phục",
                        onClick: () =>
                          ask(
                            "Khôi phục Organizer",
                            "restore_organizer",
                            (reason) =>
                              controller.setOrganizerAccountStatus(
                                selected.id,
                                "active",
                                reason,
                              ),
                          ),
                      },
                    ]),
              ]}
            />
          </RecordBody>
        )}
      </AdminRecordDrawer>
      <DecisionDialog decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}

export function AdminUserPage({
  controller,
}: {
  readonly controller: AdminWorkspaceController;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [openCase, setOpenCase] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const users = useMemo(
    () =>
      controller.workspace.users.filter(
        (item) =>
          (!status || item.accountStatus === status) &&
          (!openCase ||
            relatedCases(controller, "user", item.id).some(
              (entry) => !["resolved", "dismissed"].includes(entry.status),
            )) &&
          matchesAdminQuery(query, [item.name, item.email, item.city]),
      ),
    [controller, openCase, query, status],
  );
  const selected =
    controller.workspace.users.find((item) => item.id === selectedId) ?? null;
  const ask = (
    title: string,
    operation: AdminSensitiveOperation,
    submit: (reason: string) => void,
  ) =>
    setDecision({
      title,
      description: "Thao tác được ghi audit trong phiên dữ liệu mô phỏng.",
      confirm: title,
      operation,
      submit,
    });
  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="TÀI KHOẢN" title="Người tham dự">
        Chỉ hỗ trợ hạn chế hoặc khôi phục; không chỉnh sửa hồ sơ.
      </AdminPageHeader>
      <AdminFilterToolbar
        query={query}
        status={status}
        statusOptions={accountStatusOptions}
        resultCount={users.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />
      <div className="max-w-sm rounded-lg border border-line bg-surface p-4">
        <AdminSelect
          label="Có vụ việc đang mở"
          value={openCase}
          onChange={setOpenCase}
          choices={[
            { value: "", label: "Tất cả người dùng" },
            { value: "yes", label: "Có vụ việc đang mở" },
          ]}
        />
      </div>
      <AdminDataTable
        label="Danh sách người tham dự"
        headers={["Người dùng", "Thành phố", "Trạng thái"]}
        rows={users.map((item) => ({
          key: item.id,
          cells: [
            <span key="name">
              <strong>{item.name}</strong>
              <span className="block text-ink-soft">{item.email}</span>
            </span>,
            item.city,
            <Status key="status" value={item.accountStatus} />,
          ],
          onOpen: () => setSelectedId(item.id),
        }))}
      />
      <AdminRecordDrawer
        open={Boolean(selected)}
        title={selected?.name ?? ""}
        onClose={() => setSelectedId(null)}
      >
        {selected && (
          <RecordBody>
            <p>
              {selected.email} · {selected.city}
            </p>
            <RelatedList
              title="Order"
              items={controller.workspace.orders
                .filter((item) => item.userId === selected.id)
                .map(
                  (item) =>
                    `${item.id} · ${formatAdminMoney(item.amount)} · ${adminStatusLabel(item.status)}`,
                )}
            />
            <RelatedList
              title="Vé"
              items={controller.workspace.tickets
                .filter((item) => item.userId === selected.id)
                .map(
                  (item) =>
                    `${item.reference} · ${adminStatusLabel(item.credentialStatus)}`,
                )}
            />
            <RelatedList
              title="Resale"
              items={controller.workspace.resales
                .filter(
                  (item) =>
                    item.sellerId === selected.id ||
                    item.buyerId === selected.id,
                )
                .map(
                  (item) => `${item.id} · ${adminStatusLabel(item.visibility)}`,
                )}
            />
            <RelatedList
              title="Vụ việc"
              items={relatedCases(controller, "user", selected.id).map(
                (item) => `${item.id} · ${item.summary}`,
              )}
            />
            <Actions
              items={
                selected.accountStatus === "active"
                  ? [
                      {
                        label: "Hạn chế",
                        tone: "coral",
                        onClick: () =>
                          ask(
                            "Hạn chế người tham dự",
                            "restrict_user",
                            (reason) =>
                              controller.setUserAccountStatus(
                                selected.id,
                                "restricted",
                                reason,
                              ),
                          ),
                      },
                      {
                        label: "Tạm ngưng",
                        tone: "critical",
                        onClick: () =>
                          ask(
                            "Tạm ngưng người tham dự",
                            "suspend_user",
                            (reason) =>
                              controller.setUserAccountStatus(
                                selected.id,
                                "suspended",
                                reason,
                              ),
                          ),
                      },
                    ]
                  : [
                      {
                        label: "Khôi phục",
                        onClick: () =>
                          ask(
                            "Khôi phục người tham dự",
                            "restore_user",
                            (reason) =>
                              controller.setUserAccountStatus(
                                selected.id,
                                "active",
                                reason,
                              ),
                          ),
                      },
                    ]
              }
            />
          </RecordBody>
        )}
      </AdminRecordDrawer>
      <DecisionDialog decision={decision} onClose={() => setDecision(null)} />
    </div>
  );
}

export function AdminOrderPage({
  controller,
}: {
  readonly controller: AdminWorkspaceController;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [date, setDate] = useState("");
  const [eventId, setEventId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [amountBand, setAmountBand] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const orders = useMemo(
    () =>
      controller.workspace.orders.filter(
        (item) =>
          (!status || item.status === status) &&
          (!source || item.source === source) &&
          (!date || item.createdAt.startsWith(date)) &&
          (!eventId || item.eventId === eventId) &&
          (!organizerId || item.organizerId === organizerId) &&
          (!amountBand ||
            (amountBand === "under-500"
              ? item.amount < 500000
              : item.amount >= 500000)) &&
          matchesAdminQuery(query, [
            item.id,
            item.paymentStatus,
            item.eventId,
            item.organizerId,
          ]),
      ),
    [
      amountBand,
      controller.workspace.orders,
      date,
      eventId,
      organizerId,
      query,
      source,
      status,
    ],
  );
  const record =
    controller.workspace.orders.find((item) => item.id === selected) ?? null;
  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="VẬN HÀNH" title="Giao dịch">
        Order, payment và số tiền chỉ đọc trong P0.
      </AdminPageHeader>
      <AdminFilterToolbar
        query={query}
        status={status}
        statusOptions={orderStatusOptions}
        resultCount={orders.length}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
      />
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminSelect
          label="Nguồn"
          value={source}
          onChange={setSource}
          choices={[
            { value: "", label: "Tất cả nguồn" },
            { value: "primary", label: "Primary" },
            { value: "resale", label: "Resale" },
          ]}
        />
        <label className="text-sm font-bold">
          Ngày tạo
          <input
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>
        <AdminSelect
          label="Sự kiện"
          value={eventId}
          onChange={setEventId}
          choices={[
            { value: "", label: "Tất cả sự kiện" },
            ...controller.workspace.events.map((item) => ({
              value: item.id,
              label: item.title,
            })),
          ]}
        />
        <AdminSelect
          label="Organizer"
          value={organizerId}
          onChange={setOrganizerId}
          choices={[
            { value: "", label: "Tất cả Organizer" },
            ...controller.workspace.organizers.map((item) => ({
              value: item.id,
              label: item.name,
            })),
          ]}
        />
        <AdminSelect
          label="Khoảng tiền"
          value={amountBand}
          onChange={setAmountBand}
          choices={[
            { value: "", label: "Tất cả amount" },
            { value: "under-500", label: "Dưới 500.000đ" },
            { value: "from-500", label: "Từ 500.000đ" },
          ]}
        />
      </div>
      <AdminDataTable
        label="Danh sách giao dịch"
        headers={["Order", "Nguồn", "Trạng thái", "Số tiền", "Ngày tạo"]}
        rows={orders.map((item) => ({
          key: item.id,
          cells: [
            item.id,
            adminStatusLabel(item.source),
            <Status key="status" value={item.status} />,
            formatAdminMoney(item.amount),
            new Date(item.createdAt).toLocaleDateString("vi-VN"),
          ],
          onOpen: () => setSelected(item.id),
        }))}
      />
      <AdminRecordDrawer
        open={Boolean(record)}
        title={record?.id ?? ""}
        onClose={() => setSelected(null)}
      >
        {record && (
          <RecordBody>
            <p>
              <strong>Tổng tiền bất biến:</strong>{" "}
              {formatAdminMoney(record.amount)} · {record.paymentStatus}
            </p>
            <RelatedList
              title="Vé đã phát hành"
              items={record.ticketIds.map(
                (id) =>
                  controller.workspace.tickets.find((item) => item.id === id)
                    ?.reference ?? id,
              )}
            />
            <RelatedList
              title="Refund liên quan"
              items={controller.workspace.refunds
                .filter((item) => item.orderId === record.id)
                .map(
                  (item) =>
                    `${item.id} · ${adminStatusLabel(item.status)} · ${formatAdminMoney(item.amount)}`,
                )}
            />
            <RelatedList
              title="Vụ việc liên quan"
              items={relatedCases(controller, "order", record.id).map(
                (item) => `${item.id} · ${item.summary}`,
              )}
            />
            <p>
              <strong>Timeline payment demo:</strong>{" "}
              {new Date(record.createdAt).toLocaleString("vi-VN")} ·{" "}
              {record.paymentStatus}
            </p>
          </RecordBody>
        )}
      </AdminRecordDrawer>
    </div>
  );
}

export function AdminTicketPage({
  controller,
}: {
  readonly controller: AdminWorkspaceController;
}) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const tickets = useMemo(
    () =>
      controller.workspace.tickets.filter((item) => {
        const holder = controller.workspace.users.find(
          (user) => user.id === item.userId,
        );
        return matchesAdminQuery(query, [
          item.reference,
          item.credentialCode,
          holder?.name ?? "",
          holder?.email ?? "",
        ]);
      }),
    [controller.workspace.tickets, controller.workspace.users, query],
  );
  const record =
    controller.workspace.tickets.find((item) => item.id === selected) ?? null;
  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="VẬN HÀNH" title="Vé & check-in">
        Credential, owner và check-in chỉ đọc trong P0.
      </AdminPageHeader>
      <label className="max-w-xl text-sm font-bold">
        Tìm theo mã vé, credential hoặc người sở hữu
        <input
          className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <p className="text-sm text-ink-soft">{tickets.length} kết quả</p>
      <AdminDataTable
        label="Danh sách vé"
        headers={["Mã vé", "Credential", "Chủ sở hữu", "Trạng thái", "Order"]}
        rows={tickets.map((item) => ({
          key: item.id,
          cells: [
            item.reference,
            item.credentialCode,
            controller.workspace.users.find((user) => user.id === item.userId)
              ?.name ?? item.userId,
            <Status key="status" value={item.credentialStatus} />,
            item.orderId,
          ],
          onOpen: () => setSelected(item.id),
        }))}
      />
      <AdminRecordDrawer
        open={Boolean(record)}
        title={record?.reference ?? ""}
        onClose={() => setSelected(null)}
      >
        {record && (
          <RecordBody>
            <p>
              <strong>Credential readonly:</strong> {record.credentialCode} ·{" "}
              {adminStatusLabel(record.credentialStatus)}
            </p>
            <p>
              <strong>Chuỗi sở hữu:</strong>{" "}
              {controller.workspace.users.find(
                (item) => item.id === record.userId,
              )?.name ?? record.userId}{" "}
              → ticket {record.reference}
            </p>
            <p>
              <strong>Check-in:</strong>{" "}
              {record.checkedInAt
                ? new Date(record.checkedInAt).toLocaleString("vi-VN")
                : "Chưa check-in"}
            </p>
            <RelatedList
              title="Order nguồn"
              items={controller.workspace.orders
                .filter((item) => item.id === record.orderId)
                .map(
                  (item) =>
                    `${item.id} · ${adminStatusLabel(item.source)} · ${formatAdminMoney(item.amount)}`,
                )}
            />
            <RelatedList
              title="Listing resale"
              items={controller.workspace.resales
                .filter((item) => item.ticketId === record.id)
                .map(
                  (item) =>
                    `${item.id} · ${adminStatusLabel(item.visibility)} · ${adminStatusLabel(item.listingStatus)}`,
                )}
            />
            <RelatedList
              title="Vụ việc"
              items={relatedCases(controller, "ticket", record.id).map(
                (item) => `${item.id} · ${item.summary}`,
              )}
            />
          </RecordBody>
        )}
      </AdminRecordDrawer>
    </div>
  );
}

export function AdminResalePage({
  navigate,
}: {
  readonly navigate: (path: AdminPath) => void;
}) {
  const [status, setStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [rows, setRows] = useState<
    readonly {
      id: string;
      price: number;
      status: string;
      createdAt: string;
      seller: { id: string; fullName: string; email: string };
      event: { id: string; title: string };
      ticket: { ticketCode: string };
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const summary = useResaleStats("listings");

  useEffect(() => {
    let active = true;
    async function loadListings() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.findListings({
          page: 1,
          pageSize: 100,
        });
        if (!active) return;
        setRows(
          response.data.listings.map((entry) => ({
            id: String(entry.id),
            price: Number(entry.price),
            status: String(entry.status),
            createdAt: String(entry.createdAt),
            seller: entry.seller as {
              id: string;
              fullName: string;
              email: string;
            },
            event: entry.event as { id: string; title: string },
            ticket: entry.ticket as { ticketCode: string },
          })),
        );
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải danh sách tin đăng.",
          );
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadListings();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const listings = useMemo(
    () =>
      rows.filter(
        (item) =>
          (!status || item.status === status) &&
          (!minPrice || item.price >= Number(minPrice)) &&
          (!maxPrice || item.price <= Number(maxPrice)),
      ),
    [maxPrice, minPrice, rows, status],
  );
  const cards = [
    {
      label: "Tổng tin đăng",
      value: summary.stats?.total ?? null,
      icon: <ListChecks size={18} aria-hidden="true" />,
      tone: "text-pine",
      sub: "Trên toàn hệ thống",
    },
    {
      label: "Đang bán",
      value: summary.stats?.active ?? null,
      icon: <TicketCheck size={18} aria-hidden="true" />,
      tone: "text-blue-deep",
      sub: "Tin đăng đang hoạt động",
    },
    {
      label: "Đã bán",
      value: summary.stats?.sold ?? null,
      icon: <WalletCards size={18} aria-hidden="true" />,
      tone: "text-success",
      sub: "Tin đăng đã giao dịch",
    },
    {
      label: "Đã ẩn / bị khóa",
      value: summary.stats?.hiddenOrLocked ?? null,
      icon: <EyeOff size={18} aria-hidden="true" />,
      tone: "text-error",
      sub: "Không hiển thị với người mua",
    },
  ];
  return (
    <div className="grid gap-6">
      <AdminPageHeader eyebrow="VẬN HÀNH" title="Chợ vé resale">
        Danh sách và thống kê được tải từ hệ thống; giá niêm yết chỉ đọc.
      </AdminPageHeader>
      <ResaleSectionTabs activeTab="listings" navigate={navigate} />
      <ResaleStatsCards cards={cards} loading={summary.loading} />
      {(summary.error || error) && (
        <p
          role="alert"
          className="rounded border border-error bg-error/10 p-4 text-error"
        >
          {error || summary.error}{" "}
          <button
            type="button"
            className="ml-2 font-bold underline"
            onClick={() => {
              setRetryKey((key) => key + 1);
              summary.retry();
            }}
          >
            Thử tải lại
          </button>
        </p>
      )}
      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-sm font-bold">
          Trạng thái
          <select
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            {["ACTIVE", "RESERVED", "SOLD", "WITHDRAWN"].map((value) => (
              <option key={value} value={value}>
                {resaleStatusLabel(value)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Giá từ (₫)
          <input
            type="number"
            min="0"
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={minPrice}
            onChange={(event) => setMinPrice(event.target.value)}
          />
        </label>
        <label className="text-sm font-bold">
          Giá đến (₫)
          <input
            type="number"
            min="0"
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </label>
        <p className="self-end text-sm text-ink-soft">
          {listings.length} kết quả
        </p>
      </div>
      {loading ? (
        <p role="status">Đang tải tin đăng…</p>
      ) : (
        <AdminDataTable
          label="Tin đăng resale"
          headers={[
            "Mã tin",
            "Vé",
            "Sự kiện",
            "Người bán",
            "Giá",
            "Trạng thái",
            "Ngày đăng",
          ]}
          rows={listings.map((item) => ({
            key: item.id,
            cells: [
              <span
                key="id"
                className="block max-w-36 overflow-hidden text-ellipsis whitespace-nowrap"
                title={item.id}
              >
                {item.id}
              </span>,
              item.ticket.ticketCode,
              item.event.title,
              <span key="seller">
                {item.seller.fullName}
                <span className="block text-ink-soft">{item.seller.email}</span>
              </span>,
              formatAdminMoney(item.price),
              <AdminStatusBadge
                key="status"
                label={resaleStatusLabel(item.status)}
                tone={
                  item.status === "SOLD"
                    ? "mint"
                    : item.status === "ACTIVE"
                      ? "blue"
                      : "neutral"
                }
              />,
              new Date(item.createdAt).toLocaleString("vi-VN"),
            ],
            onOpen: () =>
              navigate(
                `/admin/resale/listings/${encodeURIComponent(item.id)}` as AdminPath,
              ),
          }))}
        />
      )}
    </div>
  );
}
