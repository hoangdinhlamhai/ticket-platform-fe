import { useEffect, useState } from "react";
import * as adminEventApi from "../api/adminEventApi.ts";
import { SeatMapViewer } from "../../../seat-map/components/SeatMapViewer.tsx";
import type { SeatMap } from "../../../seat-map/types/seat-map.ts";

type Props = { readonly eventId: string };

export function AdminEventSeatMap({ eventId }: Props) {
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadSeatMap = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await adminEventApi.findSeatMap(eventId);
        if (active) setSeatMap(data.seatMap);
      } catch (cause: unknown) {
        if (active) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Không thể tải sơ đồ chỗ ngồi.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadSeatMap();
    return () => {
      active = false;
    };
  }, [eventId]);

  if (loading)
    return (
      <section className="grid content-start gap-4">
        <h2 className="m-0 text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
        <p className="rounded border border-line bg-surface p-4" role="status">
          Đang tải sơ đồ chỗ ngồi...
        </p>
      </section>
    );

  if (error)
    return (
      <section className="grid content-start gap-4">
        <h2 className="m-0 text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
        <p
          className="rounded border border-error bg-error/10 p-4 text-error"
          role="alert"
        >
          {error}
        </p>
      </section>
    );

  if (!seatMap)
    return (
      <section className="grid content-start gap-4">
        <h2 className="m-0 text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
        <p className="m-0">Sự kiện chưa có sơ đồ chỗ ngồi.</p>
      </section>
    );

  const hasDesignedLayout =
    seatMap.mode === "ASSIGNED_SEATING" ||
    seatMap.hangs.length > 0 ||
    seatMap.vatThe.length > 0;

  return (
    <section className="grid content-start gap-4">
      {!hasDesignedLayout && (
        <div>
          <h2 className="m-0 text-xl font-extrabold">S? ?? ch? ng?i</h2>
          <p className="mb-0 mt-1 text-sm text-ink-soft">
            ?nh s? ?? ???c t?i l?n, kh?ng c? b? c?c gh? t??ng t?c.
          </p>
        </div>
      )}
      {hasDesignedLayout ? (
        <SeatMapViewer seatMap={seatMap} />
      ) : seatMap.imageUrl ? (
        <figure className="m-0 grid gap-2">
          <img
            className="max-h-[32rem] w-full rounded-lg border border-line bg-paper object-contain"
            src={seatMap.imageUrl}
            alt="Ảnh sơ đồ chỗ ngồi được Organizer tải lên"
          />
          {seatMap.width && seatMap.height && (
            <figcaption className="text-sm text-ink-soft">
              Kích thước ảnh: {seatMap.width} × {seatMap.height}
            </figcaption>
          )}
        </figure>
      ) : (
        <p className="m-0">Không có ảnh hoặc bố cục ghế trong sơ đồ này.</p>
      )}
    </section>
  );
}
