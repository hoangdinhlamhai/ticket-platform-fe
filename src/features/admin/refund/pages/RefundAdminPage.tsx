import axios from "axios";
import { useEffect, useState } from "react";
import * as refundAdminApi from "../api/refundAdminApi.ts";
import { RefundAdminDetailCard } from "../components/RefundAdminDetailCard.tsx";
import { RefundAdminList } from "../components/RefundAdminList.tsx";
import type { AdminRefund, AdminRefundStatus } from "../types/admin-refund.ts";

const pageSize = 20;

const statusOptions: { value: "" | AdminRefundStatus; label: string }[] = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING", label: "Chờ duyệt" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "SUCCEEDED", label: "Đã hoàn tiền" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REJECTED", label: "Đã từ chối" },
];

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message)) return message.join(" ");
    if (message) return message;
  }
  return "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}

export function RefundAdminPage() {
  const [refunds, setRefunds] = useState<readonly AdminRefund[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    succeeded: 0,
    failed: 0,
  });
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"" | AdminRefundStatus>("");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRefund, setSelectedRefund] = useState<AdminRefund | null>(
    null,
  );
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const loadRefunds = async () => {
      setLoadError("");
      try {
        const { data } = await refundAdminApi.findRefunds({
          ...(status ? { status } : {}),
          page,
          pageSize,
        });
        if (active) {
          setRefunds(data.refunds);
          setTotal(data.total);
          setSummary(data.summary);
        }
      } catch (error) {
        if (active) setLoadError(getErrorMessage(error));
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadRefunds();
    return () => {
      active = false;
    };
  }, [page, reloadKey, status]);

  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const loadRefundDetail = async () => {
      setDetailError("");
      try {
        const { data } = await refundAdminApi.findRefundById(selectedId);
        if (active) setSelectedRefund(data.refund);
      } catch (error) {
        if (active) setDetailError(getErrorMessage(error));
      } finally {
        if (active) setIsDetailLoading(false);
      }
    };

    void loadRefundDetail();
    return () => {
      active = false;
    };
  }, [selectedId]);

  useEffect(() => {
    if (!selectedId || selectedRefund?.status !== "PROCESSING") return;

    let active = true;
    let timeout: ReturnType<typeof setTimeout>;

    const refreshProcessingRefund = async () => {
      try {
        const { data } = await refundAdminApi.findRefundById(selectedId);
        if (!active) return;

        setSelectedRefund(data.refund);
        if (data.refund.status === "PROCESSING") {
          timeout = setTimeout(() => void refreshProcessingRefund(), 3000);
          return;
        }

        setNotice(
          data.refund.status === "SUCCEEDED"
            ? "Xendit đã hoàn tiền thành công."
            : "Xendit không thể xử lý hoàn tiền. Xem lý do thất bại bên dưới.",
        );
        setReloadKey((key) => key + 1);
      } catch {
        if (active) {
          timeout = setTimeout(() => void refreshProcessingRefund(), 5000);
        }
      }
    };

    timeout = setTimeout(() => void refreshProcessingRefund(), 3000);
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [selectedId, selectedRefund?.status]);

  const openRefund = (id: string) => {
    setSelectedId(id);
    setSelectedRefund(null);
    setDetailError("");
    setIsDetailLoading(true);
    setActionError("");
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelectedRefund(null);
    setActionError("");
    setDetailError("");
  };

  const handleAction = async (action: "APPROVED" | "REJECTED" | "RETRY") => {
    if (!selectedId) return;
    setIsWorking(true);
    setActionError("");
    setNotice("");

    try {
      const response =
        action === "RETRY"
          ? await refundAdminApi.retryRefund(selectedId)
          : await refundAdminApi.decideRefund(selectedId, action);
      setSelectedRefund(response.data.refund);
      setIsLoading(true);
      setReloadKey((key) => key + 1);
      setNotice(
        action === "APPROVED"
          ? "Đã gửi yêu cầu hoàn tiền tới Xendit."
          : action === "REJECTED"
            ? "Đã từ chối yêu cầu hoàn tiền."
            : "Đã gửi lại yêu cầu hoàn tiền tới Xendit.",
      );
    } catch (error) {
      setActionError(getErrorMessage(error));
      setIsLoading(true);
      setReloadKey((key) => key + 1);
      try {
        const { data } = await refundAdminApi.findRefundById(selectedId);
        setSelectedRefund(data.refund);
      } catch {
        // Giữ chi tiết đang mở; lỗi của thao tác đã được hiển thị bên dưới.
      }
    } finally {
      setIsWorking(false);
    }
  };

  const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
  const visibleRefunds = refunds.filter((refund) =>
    [
      refund.id,
      refund.orderId ?? "",
      refund.order?.user.fullName ??
        refund.resaleTransaction?.buyer.hoTen ??
        "",
      refund.order?.user.email ?? refund.resaleTransaction?.buyer.email ?? "",
      refund.order?.event.title ?? refund.resaleTransaction?.event.tieuDe ?? "",
      refund.reason,
    ].some((value) =>
      value.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
    ),
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const summaryCards = [
    { label: "Chờ duyệt", value: summary.pending, tone: "text-blue-deep" },
    { label: "Đang xử lý", value: summary.processing, tone: "text-warning" },
    { label: "Đã hoàn tiền", value: summary.succeeded, tone: "text-success" },
    { label: "Thất bại", value: summary.failed, tone: "text-error" },
  ] as const;

  return (
    <section className="grid gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article
            key={card.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <p className="m-0 text-sm font-semibold text-ink-soft">
              {card.label}
            </p>
            <p className={`mb-0 mt-2 text-2xl font-extrabold ${card.tone}`}>
              {isLoading ? "_" : card.value.toLocaleString("vi-VN")}
            </p>
          </article>
        ))}
      </div>

      {notice ? (
        <p
          className="m-0 rounded-md border border-success/30 bg-mint px-4 py-3 text-sm font-semibold text-success"
          role="status"
        >
          {notice}
        </p>
      ) : null}

      <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="text-sm font-bold">
          Tìm Refund, Order, khách hàng hoặc sự kiện
          <input
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3 font-normal"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nhập mã refund, đơn hàng, khách hoặc sự kiện"
          />
        </label>
        <label className="text-sm font-bold">
          Trạng thái
          <select
            className="mt-1 min-h-11 w-full rounded border border-line bg-paper px-3 font-normal"
            value={status}
            onChange={(event) => {
              setIsLoading(true);
              setStatus(event.target.value as "" | AdminRefundStatus);
              setPage(1);
            }}
          >
            {statusOptions.map((option) => (
              <option key={option.value || "ALL"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loadError ? (
        <div
          className="rounded-lg border border-error/30 bg-error/10 p-5"
          role="alert"
        >
          <p className="m-0 text-sm text-error">{loadError}</p>
          <button
            className="mt-3 min-h-11 rounded border border-error/40 px-4 text-sm font-bold text-error"
            type="button"
            onClick={() => {
              setIsLoading(true);
              setReloadKey((key) => key + 1);
            }}
          >
            Thử tải lại
          </button>
        </div>
      ) : isLoading ? (
        <p
          className="grid min-h-56 place-items-center rounded-lg border border-line bg-surface p-5 text-center text-sm text-ink-soft"
          role="status"
        >
          Đang tải giao dịch...
        </p>
      ) : (
        <>
          <RefundAdminList refunds={visibleRefunds} onOpen={openRefund} />
          {total > pageSize ? (
            <footer className="flex flex-wrap items-center justify-between gap-3 text-sm text-ink-soft">
              <span>
                {total.toLocaleString("vi-VN")} yêu cầu · Trang {page} /{" "}
                {pageCount}
              </span>
              <div className="flex gap-2">
                <button
                  className="min-h-10 rounded border border-line px-3 disabled:opacity-40"
                  type="button"
                  disabled={page <= 1}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((current) => current - 1);
                  }}
                >
                  Trước
                </button>
                <button
                  className="min-h-10 rounded border border-line px-3 disabled:opacity-40"
                  type="button"
                  disabled={page >= pageCount}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((current) => current + 1);
                  }}
                >
                  Tiếp
                </button>
              </div>
            </footer>
          ) : null}
        </>
      )}

      {selectedId ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <aside
            className="h-full w-full max-w-3xl animate-[transaction-enter_.2s_ease-out] overflow-y-auto bg-paper p-4 shadow-2xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="refund-detail-title"
          >
            {isDetailLoading ? (
              <p
                className="rounded-lg border border-line bg-surface p-5"
                role="status"
              >
                Đang tải chi tiết...
              </p>
            ) : detailError ? (
              <div className="grid gap-4">
                <p
                  className="rounded border border-error bg-error/10 p-4 text-error"
                  role="alert"
                >
                  {detailError}
                </p>
                <button
                  className="min-h-11 justify-self-start font-bold text-blue-deep underline"
                  type="button"
                  onClick={closeDetail}
                >
                  Đóng chi tiết
                </button>
              </div>
            ) : selectedRefund ? (
              <div className="grid gap-4">
                {notice ? (
                  <p
                    className="m-0 rounded-md border border-success/30 bg-mint px-4 py-3 text-sm font-semibold text-success"
                    role="status"
                  >
                    {notice}
                  </p>
                ) : null}
                <RefundAdminDetailCard
                  refund={selectedRefund}
                  actionError={actionError}
                  isWorking={isWorking}
                  onBack={closeDetail}
                  onAction={handleAction}
                />
              </div>
            ) : null}
          </aside>
        </div>
      ) : null}
    </section>
  );
}
