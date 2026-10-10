import { useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import { findMine } from "../api/orderApi";
import { OrderHistoryCard } from "../components/OrderHistoryCard";
import { OrderHistoryFilters } from "../components/OrderHistoryFilters";
import type { AttendeeOrderRecord, OrderFilters } from "../types/order";

type Props = {
  onNavigate: (path: AttendeePath) => void;
};

const initialFilters: OrderFilters = { status: "all" };

export function OrderHistoryPage({ onNavigate }: Props) {
  const [orders, setOrders] = useState<AttendeeOrderRecord[]>([]);
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        const { data } = await findMine();
        if (isActive) setOrders(data.orders);
      } catch {
        if (isActive) setHasError(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadOrders();
    return () => {
      isActive = false;
    };
  }, [reloadKey]);

  const visibleOrders = orders.filter((order) => {
    if (filters.status === "all") return true;
    if (filters.status === "FAILED") {
      return order.status === "FAILED" || order.status === "PAYMENT_FAILED";
    }
    return order.status === filters.status;
  });

  return (
    <section className="bg-paper-deep py-[clamp(3.5rem,6vw,5.5rem)]">
      <div className="attendee-container">
        <header className="mb-7">
          <p className="text-xs font-extrabold tracking-[0.11em] text-coral-dark">
            LỊCH SỬ ĐƠN HÀNG
          </p>
          <h1 className="mt-2 font-body text-[clamp(3rem,7vw,6.5rem)] leading-[0.8] font-extrabold tracking-[-0.1em]">
            Mọi đơn hàng, một nơi.
          </h1>
          <p className="mt-5 max-w-2xl leading-[1.7] text-ink-soft">
            Xem trạng thái thanh toán và vé đã đặt của bạn.
          </p>
        </header>

        <OrderHistoryFilters filters={filters} onChange={setFilters} />

        <div className="mt-6 space-y-4" aria-live="polite">
          {isLoading ? (
            <p className="rounded-lg border border-line bg-surface p-8 text-center text-ink-soft">
              Đang tải đơn hàng…
            </p>
          ) : hasError ? (
            <div className="rounded-lg border border-line bg-surface p-8 text-center">
              <p className="text-ink-soft">
                Không tải được danh sách đơn hàng.
              </p>
              <button
                className="mt-3 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper"
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
              >
                Thử lại
              </button>
            </div>
          ) : visibleOrders.length ? (
            visibleOrders.map((order) => (
              <OrderHistoryCard
                key={order.id}
                order={order}
                onNavigate={onNavigate}
              />
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
              <h2 className="text-2xl font-extrabold">
                {orders.length
                  ? "Không có đơn hàng phù hợp."
                  : "Bạn chưa có đơn hàng nào."}
              </h2>
              <p className="mt-2 text-ink-soft">
                {orders.length
                  ? "Hãy chọn trạng thái khác để xem đơn hàng."
                  : "Các đơn hàng của bạn sẽ xuất hiện ở đây."}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
