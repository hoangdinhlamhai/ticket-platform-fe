import { SeatMapEditor } from "./SeatMapEditor.tsx";
import type { SeatMap } from "../../../seat-map/types/seat-map.ts";

type TicketTierOption = { id: string; name: string; price: number };

type Props = {
  eventId?: string;
  initialImage: string;
  loading: boolean;
  error: string;
  seatMap: SeatMap | null;
  ticketTiers: readonly TicketTierOption[];
  onImageChange: (value: string) => void;
  onMapChange: (map: SeatMap) => void;
};

export function OrganizerEventSeatMapSection({
  eventId,
  initialImage,
  loading,
  error,
  seatMap,
  ticketTiers,
  onImageChange,
  onMapChange,
}: Props) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Chọn tải ảnh sơ đồ hoặc tự thiết kế khu vực và ghế. Có thể bỏ qua nếu
          sự kiện không dùng chỗ ngồi cố định.
        </p>
      </div>
      <SeatMapEditor
        key={`${eventId ?? "new"}-${seatMap?.id ?? (loading ? "loading" : "empty")}`}
        initialImage={initialImage}
        onImageChange={onImageChange}
        initialMap={seatMap}
        onMapChange={onMapChange}
        ticketTiers={ticketTiers}
      />
      {loading && <p role="status">Đang tải sơ đồ ghế...</p>}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
