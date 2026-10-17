import { useEffect, useMemo, useState } from "react";
import { findPublicSeatStatuses } from "../api/seatMapApi.ts";
import type { PrimaryCheckoutSelection } from "../../orders";
import type { SeatMap } from "../types/seat-map.ts";

type Props = {
  seatMap: SeatMap;
  event: Pick<
    PrimaryCheckoutSelection,
    "eventId" | "eventTitle" | "date" | "venue" | "address"
  >;
  onContinue: (selection: PrimaryCheckoutSelection) => void;
};

export function SeatMapSeatPicker({ seatMap, event, onContinue }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [seatStatuses, setSeatStatuses] = useState<Record<
    string,
    string
  > | null>(null);
  const [statusError, setStatusError] = useState(false);
  useEffect(() => {
    let active = true;
    const loadStatuses = async () => {
      try {
        const { data } = await findPublicSeatStatuses(event.eventId);
        if (!active) return;
        const nextStatuses = Object.fromEntries(
          data.seatStatuses.map(({ seatId, status }) => [seatId, status]),
        );
        setSeatStatuses(nextStatuses);
        setSelectedIds((current) =>
          current.filter((seatId) => nextStatuses[seatId] === "AVAILABLE"),
        );
        setStatusError(false);
      } catch {
        if (active) {
          setSeatStatuses(null);
          setStatusError(true);
        }
      }
    };
    void loadStatuses();
    const intervalId = window.setInterval(() => void loadStatuses(), 15_000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [event.eventId]);
  const options = useMemo(
    () =>
      seatMap.blocks.flatMap((block) =>
        block.rows.flatMap((row) =>
          row.seats.map((seat) => ({
            seat,
            rowLabel: row.label,
            ticketType: seat.ticketType ?? row.ticketType ?? null,
          })),
        ),
      ),
    [seatMap],
  );
  const selected = options.filter(
    ({ seat }) => seat.id && selectedIds.includes(seat.id),
  );
  const total = selected.reduce(
    (sum, option) => sum + (option.ticketType?.price ?? 0),
    0,
  );
  const toggleSeat = (seatId: string) =>
    setSelectedIds((ids) =>
      ids.includes(seatId)
        ? ids.filter((id) => id !== seatId)
        : [...ids, seatId],
    );
  const submit = () => {
    if (!selected.length || selected.some(({ ticketType }) => !ticketType))
      return;
    const first = selected[0];
    onContinue({
      ...event,
      ticketTierId: first.ticketType!.id,
      ticketTierName: "Ghế chỉ định",
      unitPrice: total / selected.length,
      quantity: selected.length,
      seatIds: selected.map(({ seat }) => seat.id!),
      seatLabels: selected.map(
        ({ rowLabel, seat }) => `${rowLabel}${seat.number}`,
      ),
      totalPrice: total,
    });
  };
  const unavailable = options.filter(
    ({ seat }) => !seat.id || !seat.ticketType?.id,
  ).length;

  return (
    <section
      className="rounded-lg border border-line bg-surface p-4 sm:p-5"
      aria-labelledby="seat-picker-title"
    >
      <p className="m-0 text-xs font-extrabold tracking-[0.1em] text-coral-dark">
        CHỌN CHỖ NGỒI
      </p>
      <h2
        id="seat-picker-title"
        className="mt-2 mb-1 font-body text-3xl font-extrabold tracking-[-0.06em]"
      >
        Chọn ghế của bạn
      </h2>
      <p className="mb-4 mt-0 text-sm text-ink-soft">
        Chọn từng ghế trên sơ đồ. Giá và hạng vé được xác định theo ghế.
      </p>
      <div className="overflow-auto rounded-md border border-line bg-paper">
        <svg
          className="block min-w-[36rem] w-full"
          viewBox={`0 0 ${seatMap.width ?? 900} ${seatMap.height ?? 620}`}
          role="group"
          aria-label="Sơ đồ chọn ghế"
        >
          {seatMap.imageUrl && (
            <image
              href={seatMap.imageUrl}
              x="0"
              y="0"
              width={seatMap.width ?? 900}
              height={seatMap.height ?? 620}
              preserveAspectRatio="none"
            />
          )}
          {seatMap.blocks.map((block, index) => (
            <g key={block.id ?? `${block.name}-${index}`}>
              {block.width && block.height && (
                <g
                  transform={`rotate(${block.rotation ?? 0} ${block.x ?? 0} ${block.y ?? 0})`}
                >
                  <rect
                    x={block.x ?? 0}
                    y={block.y ?? 0}
                    width={block.width}
                    height={block.height}
                    rx="8"
                    fill={block.color ?? "#dbeafe"}
                    fillOpacity=".8"
                    stroke="#475569"
                  />
                  <text
                    x={(block.x ?? 0) + block.width / 2}
                    y={(block.y ?? 0) + block.height / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#172033"
                    fontSize="18"
                    fontWeight="700"
                  >
                    {block.name}
                  </text>
                </g>
              )}
            </g>
          ))}
          {seatMap.blocks.flatMap((block, blockIndex) =>
            block.rows.map((row, rowIndex) => (
              <g key={row.id ?? `${blockIndex}-${row.label}-${rowIndex}`}>
                <text
                  x={row.x}
                  y={row.y - 22}
                  textAnchor="middle"
                  fill="#172033"
                  fontSize="14"
                  fontWeight="700"
                >
                  {row.label}
                </text>
                {row.seats.map((seat, seatIndex) => {
                  const id = seat.id;
                  const seatStatus = id ? seatStatuses?.[id] : null;
                  const canSelect = Boolean(
                    id &&
                    (seat.ticketTypeId ?? row.ticketTypeId) &&
                    seatStatus === "AVAILABLE",
                  );
                  const isSelected = Boolean(id && selectedIds.includes(id));
                  const colorIndex =
                    [
                      ...(seat.ticketType?.name ?? row.ticketType?.name ?? ""),
                    ].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5;
                  const colors = [
                    "#2463a8",
                    "#d45b4d",
                    "#8b5ca8",
                    "#25806c",
                    "#c2832f",
                  ];
                  return (
                    <g
                      key={id ?? `${seat.number}-${seatIndex}`}
                      role="button"
                      aria-label={`${row.label}${seat.number}${isSelected ? ", đã chọn" : seatStatus === "SOLD" ? ", đã bán" : seatStatus === "RESERVED" ? ", đang được giữ" : canSelect ? ", chọn ghế" : ", không khả dụng"}`}
                      aria-disabled={!canSelect}
                      aria-pressed={isSelected}
                      tabIndex={canSelect ? 0 : -1}
                      className={
                        canSelect
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40"
                      }
                      onClick={() => canSelect && id && toggleSeat(id)}
                      onKeyDown={(e) => {
                        if (
                          canSelect &&
                          id &&
                          (e.key === "Enter" || e.key === " ")
                        ) {
                          e.preventDefault();
                          toggleSeat(id);
                        }
                      }}
                    >
                      <circle
                        cx={seat.x}
                        cy={seat.y}
                        r={Math.max(
                          8,
                          Math.min(seat.width ?? 24, seat.height ?? 24) / 2,
                        )}
                        fill={
                          isSelected
                            ? "#16a34a"
                            : seatStatus === "SOLD"
                              ? "#94a3b8"
                              : seatStatus === "RESERVED"
                                ? "#eab308"
                                : colors[colorIndex]
                        }
                        stroke={isSelected ? "#14532d" : "white"}
                        strokeWidth={isSelected ? 4 : 2}
                      />
                      <title>{`${row.label}${seat.number} · ${seat.ticketType?.name ?? row.ticketType?.name ?? "Chưa có loại vé"}`}</title>
                    </g>
                  );
                })}
              </g>
            )),
          )}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <span>
          {selected.length} ghế đã chọn
          {selected.length > 0
            ? `: ${selected.map(({ rowLabel, seat }) => `${rowLabel}${seat.number}`).join(", ")}`
            : ""}
        </span>
        <strong>{total.toLocaleString("vi-VN")}₫</strong>
      </div>
      {seatStatuses === null && !statusError && (
        <p className="mb-0 mt-3 text-sm text-ink-soft" role="status">
          Đang tải tình trạng ghế…
        </p>
      )}
      {statusError && (
        <p className="mb-0 mt-3 text-sm font-bold text-error" role="alert">
          Không tải được tình trạng ghế. Hãy thử tải lại trang trước khi chọn.
        </p>
      )}
      {seatStatuses && (
        <p className="mb-0 mt-3 text-xs text-ink-soft">
          Xám: đã bán · Vàng: đang được giữ · Màu theo hạng vé: còn chỗ. Trạng
          thái tự làm mới mỗi 15 giây.
        </p>
      )}
      {unavailable > 0 && (
        <p className="mb-0 mt-2 text-xs text-ink-soft">
          {unavailable} ghế thiếu mã hoặc loại vé nên không thể chọn.
        </p>
      )}
      <button
        className="mt-4 min-h-12 w-full rounded-md bg-coral px-5 font-extrabold text-paper disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        disabled={
          seatStatuses === null ||
          !selected.length ||
          selected.some(
            ({ ticketType, seat }) =>
              !ticketType || seatStatuses[seat.id ?? ""] !== "AVAILABLE",
          )
        }
        onClick={submit}
      >
        Tiếp tục thanh toán
      </button>
      <p className="mb-0 mt-2 text-xs text-ink-soft">
        Hệ thống kiểm tra lại tình trạng ghế khi tạo đơn để tránh đặt trùng.
      </p>
    </section>
  );
}
