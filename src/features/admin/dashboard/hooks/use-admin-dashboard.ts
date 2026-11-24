import { useEffect, useState } from "react";
import * as adminApi from "../../api/adminApi.ts";
import * as userApi from "../../user/api/adminUserApi.ts";
import * as orderApi from "../../order/api/adminOrderApi.ts";
import * as payoutApi from "../../payout/api/adminPayoutApi.ts";
import * as refundApi from "../../refund/api/refundAdminApi.ts";
import type {
  Metrics,
  OrderRow,
  SectionState,
  TimelineRow,
  UserRow,
} from "../types/admin-dashboard.ts";

const empty = <T>(): SectionState<T> => ({
  data: null,
  error: "",
  loading: true,
});

export function useAdminDashboard() {
  const [metrics, setMetrics] = useState(empty<Metrics>());
  const [timeline, setTimeline] = useState(empty<readonly TimelineRow[]>());
  const [users, setUsers] = useState(empty<readonly UserRow[]>());
  const [orders, setOrders] = useState(empty<readonly OrderRow[]>());
  const [payoutCount, setPayoutCount] = useState(empty<number>());
  const [refundCount, setRefundCount] = useState(empty<number>());
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async <T>(
      request: Promise<{ data: T }>,
      setter: (state: SectionState<T>) => void,
    ) => {
      setter({ data: null, error: "", loading: true });
      try {
        const result = await request;
        if (active) setter({ data: result.data, error: "", loading: false });
      } catch (cause) {
        if (active)
          setter({
            data: null,
            error:
              cause instanceof Error ? cause.message : "Không thể tải dữ liệu.",
            loading: false,
          });
      }
    };
    void load(
      adminApi
        .findMetrics()
        .then(({ data }) => ({ data: data.metrics as Metrics })),
      setMetrics,
    );
    void load(
      adminApi.findTimeline().then(({ data }) => ({ data: data.series })),
      setTimeline,
    );
    void load(
      userApi
        .findUsers({ page: 1, pageSize: 5 })
        .then(({ data }) => ({ data: data.users })),
      setUsers,
    );
    void load(
      orderApi
        .findOrders({ page: 1, pageSize: 6 })
        .then(({ data }) => ({ data: data.orders as readonly OrderRow[] })),
      setOrders,
    );
    void load(
      payoutApi
        .findPending("PENDING_APPROVAL", 1)
        .then(({ data }) => ({ data: data.total })),
      setPayoutCount,
    );
    void load(
      refundApi
        .findRefunds({ status: "PENDING", page: 1, pageSize: 1 })
        .then(({ data }) => ({ data: data.total })),
      setRefundCount,
    );
    return () => {
      active = false;
    };
  }, [retryKey]);

  return {
    metrics,
    timeline,
    users,
    orders,
    payoutCount,
    refundCount,
    retry: () => setRetryKey((key) => key + 1),
  };
}
