import { useEffect, useState } from "react";
import * as adminApi from "../../api/adminApi.ts";

export type ResaleStatsTab = "listings" | "transactions";
export type ResaleStats = {
  readonly total: number;
  readonly active: number;
  readonly sold: number;
  readonly hiddenOrLocked: number;
  readonly pendingPayment: number;
  readonly processing: number;
  readonly completed: number;
};

export function useResaleStats(tab: ResaleStatsTab) {
  const [stats, setStats] = useState<ResaleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError("");
      setStats(null);
      try {
        if (tab === "listings") {
          const { data } = await adminApi.findResaleListingMetrics();
          if (active) {
            setStats({
              total: data.total,
              active: data.active,
              sold: data.sold,
              hiddenOrLocked: data.hiddenOrLocked,
              pendingPayment: 0,
              processing: 0,
              completed: 0,
            });
          }
        } else {
          const { data } = await adminApi.findResaleTransactionMetrics();
          if (active) {
            setStats({
              total: data.total,
              active: 0,
              sold: 0,
              hiddenOrLocked: 0,
              pendingPayment: data.pendingPayment,
              processing: data.processing,
              completed: data.completed,
            });
          }
        }
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải thống kê resale.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [tab, retryKey]);

  return { stats, loading, error, retry: () => setRetryKey((key) => key + 1) };
}
