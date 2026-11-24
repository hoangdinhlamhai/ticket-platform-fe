import { useEffect, useState } from "react";
import * as adminApi from "../../api/adminApi.ts";
import type { ResaleTransaction } from "../../api/adminApi.ts";
import { canRetryResalePayout } from "../../../resale/helpers/resale-payout-domain.ts";

export function useResaleTransactions(transactionId?: string | null) {
  const [rows, setRows] = useState<readonly ResaleTransaction[]>([]);
  const [detail, setDetail] = useState<ResaleTransaction | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bankAccounts, setBankAccounts] = useState<
    adminApi.ResalePayoutBankAccount[]
  >([]);
  const [bankAccountId, setBankAccountId] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [retryMessage, setRetryMessage] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const result = await adminApi.findResaleTransactions({
          q,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
          page,
          pageSize,
        });
        if (active) {
          setRows(result.data.transactions);
          setTotal(result.data.total);
        }
      } catch (cause) {
        if (active)
          setError(
            cause instanceof Error ? cause.message : "Không thể tải giao dịch.",
          );
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [q, status, from, to, page, pageSize]);

  useEffect(() => {
    let active = true;
    if (transactionId) {
      const load = async () => {
        try {
          const result = await adminApi.findResaleTransaction(transactionId);
          if (active) {
            setDetail(result.data.transaction);
            setDetailId(transactionId);
          }
        } catch (cause) {
          if (active)
            setError(
              cause instanceof Error
                ? cause.message
                : "Không thể tải chi tiết.",
            );
        }
      };
      void load();
    }
    return () => {
      active = false;
    };
  }, [transactionId]);

  const canRetryPayout = canRetryResalePayout(
    detail?.payout.status,
    detail?.payout.failureCode,
  );
  const restrictedFailure = ["SLS_SENDER", "SLS_RECIPIENT"].includes(
    detail?.payout.failureCode ?? "",
  );
  useEffect(() => {
    if (!transactionId || !canRetryPayout || restrictedFailure) return;
    let active = true;
    const loadAccounts = async () => {
      try {
        const { data } =
          await adminApi.findResalePayoutBankAccounts(transactionId);
        if (active) {
          setBankAccounts(data.bankAccounts);
          setBankAccountId(
            (current) => current || data.bankAccounts[0]?.id || "",
          );
        }
      } catch {
        if (active)
          setRetryMessage("Không tải được tài khoản ngân hàng của người bán.");
      }
    };
    void loadAccounts();
    return () => {
      active = false;
    };
  }, [transactionId, canRetryPayout, restrictedFailure]);

  const retryPayout = async () => {
    if (!detail || !bankAccountId) return;
    setRetrying(true);
    setRetryMessage("");
    try {
      await adminApi.retryResalePayout(detail.id, bankAccountId);
      const { data } = await adminApi.findResaleTransaction(detail.id);
      setDetail(data.transaction);
      setRetryMessage("Đã gửi yêu cầu retry payout. Đang chờ Xendit xác nhận.");
    } catch (cause) {
      setRetryMessage(
        cause instanceof Error ? cause.message : "Không thể retry payout.",
      );
    } finally {
      setRetrying(false);
    }
  };

  return {
    rows,
    detail,
    detailId,
    total,
    page,
    setPage,
    pageSize,
    q,
    setQ,
    status,
    setStatus,
    from,
    setFrom,
    to,
    setTo,
    loading,
    error,
    bankAccounts,
    bankAccountId,
    setBankAccountId,
    retrying,
    retryMessage,
    retryPayout,
    restrictedFailure,
  };
}
