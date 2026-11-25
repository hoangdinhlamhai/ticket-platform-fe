import { useEffect, useState } from "react";
import type { AdminPath } from "../../../../routes/admin-route.ts";
import * as adminApi from "../../api/adminApi.ts";
import type { AdminResaleListing } from "../../api/adminApi.ts";
import { AdminBackButton } from "../../components/AdminCommon.tsx";
import { ResaleListingDetail } from "../components/ResaleListingDetail.tsx";
import { ResaleListingDetailSkeleton } from "../components/ResaleListingDetailSkeleton.tsx";

export function AdminResaleListingDetailPage({
  listingId,
  navigate,
}: {
  readonly listingId: string;
  readonly navigate: (path: AdminPath) => void;
}) {
  const [listing, setListing] = useState<AdminResaleListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadListing() {
      setLoading(true);
      setError("");
      try {
        const response = await adminApi.findListing(listingId);
        if (active) setListing(response.data.listing);
      } catch (cause) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải chi tiết tin đăng.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadListing();
    return () => {
      active = false;
    };
  }, [listingId, retryKey]);

  if (loading) return <ResaleListingDetailSkeleton />;
  if (error || !listing) {
    return (
      <section className="grid justify-items-start gap-4 rounded-xl border border-line bg-surface p-6">
        <p className="m-0 text-error" role="alert">
          {error || "Không tìm thấy tin đăng."}
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            className="min-h-11 rounded border border-blue px-4 font-bold text-blue-deep"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Thử tải lại
          </button>
          <AdminBackButton onClick={() => navigate("/admin/resale")} />
        </div>
      </section>
    );
  }

  return <ResaleListingDetail listing={listing} navigate={navigate} />;
}
