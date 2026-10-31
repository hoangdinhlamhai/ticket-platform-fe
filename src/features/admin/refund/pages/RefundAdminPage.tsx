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

  const handleAction = async (
    action: "APPROVED" | "REJECTED" | "RETRY",
    reason: string,
  ) => {
    if (!selectedId) return;
    setIsWorking(true);
    setActionError("");
    setNotice("");

    try {
      const response =
        action === "RETRY"
          ? await refundAdminApi.retryRefund(selectedId, reason)
          : await refundAdminApi.decideRefund(selectedId, action, reason);
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
      refund.orderId,
      refund.order.user.fullName,
      refund.order.user.email,
      refund.order.event.title,
      refund.reason,
    ].some((value) =>
      value.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
    ),
  );
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <section className="grid gap-5">
      {selectedId ? (
        isDetailLoading ? (
          <p
            className="rounded-lg border border-line bg-surface p-5"
            role="status"
          >
            Đang tải chi tiết refund…
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
              Quay lại danh sách
            </button>
          </div>
        ) : selectedRefund ? (
          <>
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
          </>
        ) : null
      ) : (
        <>
          <header>
            <p className="m-0 text-sm font-bold uppercase tracking-widest text-ink-soft">
              Admin · Tài chính
            </p>
            <h1 className="mt-1 mb-0 font-body text-4xl font-extrabold tracking-[-0.06em] text-pine">
              Yêu cầu hoàn tiền
            </h1>
            <p className="mt-2 mb-0 text-sm text-ink-soft">
              {total} yêu cầu · Duyệt sẽ gửi refund thật tới Xendit.
            </p>
          </header>

          {notice ? (
            <p
              className="m-0 rounded-md border border-success/30 bg-mint px-4 py-3 text-sm font-semibold text-success"
              role="status"
            >
              {notice}
            </p>
          ) : null}

          <div className="grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
            <label className="text-sm font-bold">
              Tìm yêu cầu
              <input
                className="mt-1 min-h-11 w-full rounded-md border border-line bg-paper px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Mã refund, đơn hàng, khách, sự kiện"
              />
            </label>
            <label className="text-sm font-bold">
              Trạng thái
              <select
                className="mt-1 min-h-11 w-full rounded-md border border-line bg-paper px-3 font-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-deep"
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
                className="mt-3 min-h-11 rounded-md border border-error/40 px-4 text-sm font-bold text-error"
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
              className="rounded-lg border border-line bg-surface p-5"
              role="status"
            >
              Đang tải danh sách refund…
            </p>
          ) : (
            <>
              <RefundAdminList refunds={visibleRefunds} onOpen={openRefund} />
              {total > pageSize ? (
                <nav
                  className="flex flex-wrap items-center justify-between gap-3"
                  aria-label="Phân trang yêu cầu refund"
                >
                  <p className="m-0 text-sm text-ink-soft">
                    Trang {page} / {pageCount}
                  </p>
                  <div className="flex gap-2">
                    <button
                      className="min-h-11 rounded-md border border-line bg-surface px-4 text-sm font-bold disabled:opacity-50"
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
                      className="min-h-11 rounded-md border border-line bg-surface px-4 text-sm font-bold disabled:opacity-50"
                      type="button"
                      disabled={page >= pageCount}
                      onClick={() => {
                        setIsLoading(true);
                        setPage((current) => current + 1);
                      }}
                    >
                      Sau
                    </button>
                  </div>
                </nav>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
