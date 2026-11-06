import axios from "axios";
import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import { AdminDecisionDialog } from "../../components/AdminCommon.tsx";
import * as adminPayoutApi from "../api/adminPayoutApi.ts";
import { PayoutDetail } from "../components/PayoutDetail.tsx";
import type { AdminPayout } from "../types/admin-payout.ts";

type Props = {
  readonly payoutId: string;
  readonly navigate: (path: AdminPath) => void;
};

type LoadResult = {
  payoutId: string;
  payout: AdminPayout | null;
  loading: boolean;
  error: string;
};

type PayoutDecision = "reject";

function getErrorMessage(error: unknown) {
  if (
    axios.isAxiosError<{
      message?: string | string[];
      errors?: unknown;
      providerErrorCode?: string;
    }>(error)
  ) {
    const data = error.response?.data;
    const message = Array.isArray(data?.message)
      ? data.message.join(" ")
      : data?.message;
    if (message) {
      const details = data?.errors;
      const formattedDetails =
        details === undefined
          ? ""
          : ` Detalle: ${typeof details === "string" ? details : JSON.stringify(details)}`;
      const code = data?.providerErrorCode
        ? ` (${data.providerErrorCode})`
        : "";
      return `${message}${code}${formattedDetails}`;
    }
  }
  return "Không thể hoàn tất thao tác payout. Vui lòng thử lại.";
}

export function PayoutDetailPage({ payoutId, navigate }: Props) {
  const [result, setResult] = useState<LoadResult>(() => ({
    payoutId,
    payout: null,
    loading: true,
    error: "",
  }));
  const [decision, setDecision] = useState<PayoutDecision | null>(null);
  const [isWorking, setIsWorking] = useState(false);
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;

    async function loadPayout() {
      try {
        const { data } = await adminPayoutApi.findById(payoutId);
        if (active)
          setResult({
            payoutId,
            payout: data.payout,
            loading: false,
            error: "",
          });
      } catch (cause: unknown) {
        if (active) {
          setResult({
            payoutId,
            payout: null,
            loading: false,
            error:
              cause instanceof Error
                ? cause.message
                : "Không thể tải chi tiết payout.",
          });
        }
      }
    }

    void loadPayout();
    return () => {
      active = false;
    };
  }, [payoutId]);

  const current =
    result.payoutId === payoutId
      ? result
      : { payoutId, payout: null, loading: true, error: "" };

  async function submitDecision(action: "approve" | "reject", reason = "") {
    if (!current.payout) return;
    setDecision(null);
    setIsWorking(true);
    setActionError("");
    setNotice("");

    try {
      if (action === "approve") {
        const { data } = await adminPayoutApi.approve(payoutId);
        setResult((previous) => ({
          ...previous,
          payout: previous.payout
            ? { ...previous.payout, status: data.payout.status }
            : previous.payout,
        }));
        setNotice(
          "Đã gửi lệnh payout sang Xendit. Trạng thái sẽ cập nhật qua webhook.",
        );
      } else {
        const { data } = await adminPayoutApi.reject(payoutId, reason);
        setResult((previous) => ({ ...previous, payout: data.payout }));
        setNotice("Đã từ chối payout.");
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  if (current.loading) {
    return (
      <p className="rounded-lg border border-line bg-surface p-5" role="status">
        Đang tải chi tiết payout…
      </p>
    );
  }
  if (current.error) {
    return (
      <section className="grid gap-4">
        <p
          className="rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {current.error}
        </p>
        <button
          className="min-h-10 justify-self-start font-bold text-blue-deep underline"
          type="button"
          onClick={() => navigate("/admin/payouts")}
        >
          Quay lại danh sách
        </button>
      </section>
    );
  }
  if (!current.payout) return null;

  const amount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: current.payout.currency,
    maximumFractionDigits: 0,
  }).format(Number(current.payout.amount));

  return (
    <>
      {actionError && (
        <p
          className="mb-4 rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {actionError}
        </p>
      )}
      {notice && (
        <p
          className="mb-4 rounded border border-success/40 bg-mint p-4 text-success"
          role="status"
        >
          {notice}
        </p>
      )}
      <PayoutDetail
        payout={current.payout}
        onBack={() => navigate("/admin/payouts")}
        onApprove={() => {
          setActionError("");
          setNotice("");
          void submitDecision("approve");
        }}
        onReject={() => {
          setActionError("");
          setNotice("");
          setDecision("reject");
        }}
        isWorking={isWorking}
      />
      <AdminDecisionDialog
        open={decision === "reject"}
        title="Từ chối payout"
        description={`Payout ${amount} sẽ được chuyển sang trạng thái từ chối. Hãy ghi rõ lý do để lưu vào hồ sơ.`}
        confirmLabel="Từ chối payout"
        operation="hold_payout"
        onCancel={() => setDecision(null)}
        onConfirm={(reason) => void submitDecision("reject", reason)}
      />
    </>
  );
}
