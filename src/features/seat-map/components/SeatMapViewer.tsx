import type { SeatMap } from "../types/seat-map.ts";

function ticketColor(name?: string | null) {
  const colors = ["#2463a8", "#d45b4d", "#8b5ca8", "#25806c", "#c2832f"];
  if (!name) return "#64748b";
  const index = [...name].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return colors[index % colors.length];
}

export function SeatMapViewer({ seatMap }: { seatMap: SeatMap }) {
  const width = seatMap.width ?? 900;
  const height = seatMap.height ?? 620;
  const rows = seatMap.hangs;
  const ticketTypes = new Map<
    string,
    { id: string; name: string; price: number }
  >();
  rows.forEach((row) => {
    row.seats.forEach((seat) => {
      const type = seat.ticketType ?? row.ticketType;
      if (type) ticketTypes.set(type.id, type);
    });
  });

  return (
    <section className="mb-8 rounded-lg border border-line bg-surface p-4 sm:p-5">
      <h2 className="mb-1 text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
      <p className="mb-4 text-sm text-ink-soft">
        Màu ghế tương ứng với loại vé được ban tổ chức áp dụng.
      </p>
      <div className="overflow-auto rounded-md border border-line bg-paper">
        <svg
          aria-label="Sơ đồ chỗ ngồi sự kiện"
          className="block max-h-[32rem] min-w-[36rem] w-full"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
        >
          {seatMap.imageUrl && (
            <image
              href={seatMap.imageUrl}
              x="0"
              y="0"
              width={width}
              height={height}
              preserveAspectRatio="none"
            />
          )}
          {seatMap.vatThe.map((item, index) => (
            <g key={item.id ?? `object-${index}`}>
              {item.width && item.height && (
                <g
                  transform={`translate(${item.x} ${item.y}) rotate(${item.rotation ?? 0})`}
                >
                  <rect
                    x={-item.width / 2}
                    y={-item.height / 2}
                    width={item.width}
                    height={item.height}
                    rx="8"
                    fill="#dbeafe"
                    fillOpacity="0.8"
                    stroke="#475569"
                  />
                </g>
              )}
            </g>
          ))}
          {rows.map((row, rowIndex) => (
            <g key={row.id ?? `${row.label}-${rowIndex}`}>
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
              {row.seats.map((seat, seatIndex) => (
                <g key={seat.id ?? `${seat.number}-${seatIndex}`}>
                  <circle
                    cx={seat.x}
                    cy={seat.y}
                    r={Math.max(
                      8,
                      Math.min(seat.width ?? 24, seat.height ?? 24) / 2,
                    )}
                    fill={ticketColor(
                      seat.ticketType?.name ?? row.ticketType?.name,
                    )}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <title>
                    {`${row.label}${seat.number} · ${seat.ticketType?.name ?? row.ticketType?.name ?? "Chưa có loại vé"}`}
                  </title>
                </g>
              ))}
            </g>
          ))}
        </svg>
      </div>
      {rows.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 p-0 text-sm">
          {Array.from(ticketTypes.values()).map((ticketType) => (
            <li key={ticketType.id} className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: ticketColor(ticketType.name) }}
              />
              {ticketType.name} · {ticketType.price.toLocaleString("vi-VN")}đ
            </li>
          ))}
        </ul>
      )}
      {seatMap.mode === "NO_SELECTION" && (
        <p className="mb-0 mt-3 text-sm text-ink-soft">
          Sự kiện không yêu cầu chọn ghế cụ thể.
        </p>
      )}
    </section>
  );
}
