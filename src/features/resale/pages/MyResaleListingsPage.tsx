import { useCallback, useEffect, useState } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import {
  findMyResaleListings,
  findMyResaleSales,
  type ResaleTransaction,
} from "../api/resaleApi";
import { MyResaleListingCard } from "../components/MyResaleListingCard";
import type { ResaleListing } from "../types/resale";

type Props = {
  listings: readonly ResaleListing[];
  onNavigate: (path: AttendeePath) => void;
  onWithdraw: (id: string) => void;
};

function SellerPayoutPolling({
  transactions,
  onUpdate,
}: {
  transactions: ResaleTransaction[];
  onUpdate: (transactions: ResaleTransaction[]) => void;
}) {
  useEffect(() => {
    if (!transactions.some((transaction) => transaction.status === "PAID"))
      return;
    const timeoutId = window.setTimeout(() => {
      const refreshSales = async () => {
        try {
          const response = await findMyResaleSales();
          onUpdate(response.data.transactions);
        } catch {
          // Keep the last known payout status while the API is unavailable.
        }
      };
      void refreshSales();
    }, 3000);
    return () => window.clearTimeout(timeoutId);
  }, [transactions, onUpdate]);
  return null;
}
export function MyResaleListingsPage({
  listings,
  onNavigate,
  onWithdraw,
}: Props) {
  const [savedListings, setSavedListings] = useState<readonly ResaleListing[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [transactions, setTransactions] = useState<ResaleTransaction[]>([]);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(false);

  const updateTransactions = useCallback(
    (nextTransactions: ResaleTransaction[]) =>
      setTransactions(nextTransactions),
    [],
  );

  useEffect(() => {
    let active = true;
    const loadListings = async () => {
      try {
        const { data } = await findMyResaleListings();
        if (active) setSavedListings(data.listings);
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    void loadListings();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadSales = async () => {
      try {
        const response = await findMyResaleSales();
        if (active) setTransactions(response.data.transactions);
      } catch {
        if (active) setSalesError(true);
      } finally {
        if (active) setSalesLoading(false);
      }
    };
    void loadSales();
    return () => {
      active = false;
    };
  }, []);

  const mine =
    savedListings.length > 0
      ? savedListings
      : listings.filter((listing) => listing.ownerLabel === "current-profile");

  return (
    <section className="bg-paper-deep py-[clamp(3.5rem,7vw,6rem)]">
      <div className="attendee-container">
        <header className="mb-7">
          <p className="text-xs font-extrabold tracking-[0.1em] text-coral-dark">
            SELLER DASHBOARD
          </p>
          <h1 className="mt-2 font-body text-[clamp(3rem,7vw,6rem)] leading-[0.82] font-extrabold tracking-[-0.1em]">
            Listing của tôi.
          </h1>
          <p className="mt-4 text-ink-soft">
            Theo dõi listing đang bán, đã bán và đã rút.
          </p>
        </header>
        <div className="space-y-4">
          {isLoading ? (
            <p className="rounded-lg border border-line bg-surface p-6 text-center">
              Đang tải listing…
            </p>
          ) : loadError ? (
            <p className="rounded-lg border border-coral/40 bg-surface p-6 text-center text-coral-dark">
              Không thể tải listing. Vui lòng tải lại trang.
            </p>
          ) : (
            <>
              {mine.map((listing) => (
                <MyResaleListingCard
                  key={listing.id}
                  listing={listing}
                  transaction={transactions.find(
                    (transaction) => transaction.listingId === listing.id,
                  )}
                  transactionLoading={salesLoading}
                  onNavigate={onNavigate}
                  onWithdraw={onWithdraw}
                />
              ))}
              {mine.length === 0 && (
                <div className="rounded-lg border border-dashed border-line bg-surface p-10 text-center">
                  <h2 className="text-2xl font-extrabold">
                    Chưa có listing của bạn.
                  </h2>
                  <button
                    className="mt-5 min-h-11 rounded-md bg-blue px-4 font-extrabold text-paper"
                    type="button"
                    onClick={() => onNavigate("/tickets")}
                  >
                    Chọn vé để đăng bán
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {salesError ? (
          <p className="mt-4 text-sm text-error" role="alert">
            Không tải được trạng thái giao dịch resale. Vui lòng tải lại trang.
          </p>
        ) : null}
        {salesLoading ? (
          <p className="mt-4 text-sm text-ink-soft" role="status">
            Đang tải trạng thái giao dịch…
          </p>
        ) : null}
        <SellerPayoutPolling
          transactions={transactions}
          onUpdate={updateTransactions}
        />
      </div>
    </section>
  );
}
