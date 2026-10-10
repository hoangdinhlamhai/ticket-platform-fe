import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import * as adminPayoutApi from "../api/adminPayoutApi.ts";
import { PayoutDetail } from "../components/PayoutDetail.tsx";
import type { AdminPayout } from "../types/admin-payout.ts";

type Props = {
  readonly payoutId: string;
  readonly navigate: (path: AdminPath) => void;
};

export function PayoutDetailPage({ payoutId, navigate }: Props) {
  const [payout, setPayout] = useState<AdminPayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setPayout(null);
    const loadPayout = async () => {
      try {
        const { data } = await adminPayoutApi.findById(payoutId);
        if (active) setPayout(data.payout);
      } catch (cause: unknown) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải chi tiết payout.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadPayout();
    return () => {
      active = false;
    };
  }, [payoutId]);

  if (loading) {
    return (
      <p className="rounded-lg border border-line bg-surface p-5" role="status">
        Đang tải chi tiết payout…
      </p>
    );
  }
  if (error) {
    return (
      <section className="grid gap-4">
        <p
          className="rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {error}
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
  if (!payout) return null;

  return (
    <PayoutDetail payout={payout} onBack={() => navigate("/admin/payouts")} />
  );
}
