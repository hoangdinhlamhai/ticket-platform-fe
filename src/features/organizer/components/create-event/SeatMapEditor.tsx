import {
  useMemo,
  useRef,
  useState,
  useEffect,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";
import type { SeatMap, SeatMapRow } from "../../../seat-map/types/seat-map.ts";

type Seat = {
  id: string;
  rowId: string;
  code: string;
  x: number;
  y: number;
  rotation: number;
  width: number;
  height: number;
  ticketTierId?: string;
  detached?: boolean;
};
type SeatRow = {
  id: string;
  name: string;
  kind: "straight" | "arc";
  x: number;
  y: number;
  rotation: number;
  count: number;
  prefix: string;
  start: number;
  spacing: number;
  width: number;
  height: number;
  radius: number;
  startAngle: number;
  endAngle: number;
  reverse: boolean;
  direction: 1 | -1;
  ticketTierId: string;
  seatIds: string[];
};
type SeatZone = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};
type TicketTierOption = { id: string; name: string; price: number };
type Mode = "select" | "pan";
const uid = () => crypto.randomUUID();

function readSeatMap(seatMap?: SeatMap | null) {
  const rows: SeatRow[] = [];
  const seats: Seat[] = [];
  const zones: SeatZone[] = (seatMap?.vatThe ?? []).map((item) => ({
    id: item.id ?? uid(),
    x: item.x,
    y: item.y,
    width: item.width,
    height: item.height,
    rotation: item.rotation ?? 0,
  }));
  (seatMap?.hangs ?? []).forEach((source) => {
    const id = source.id ?? uid();
    const row: SeatRow = {
      id,
      name: source.label,
      kind: source.type === "ARC" ? "arc" : "straight",
      x: source.x,
      y: source.y,
      rotation: source.rotation ?? 0,
      count: source.seats.length,
      prefix: source.seats[0]?.number.replace(/\d+$/, "") || source.label,
      start: source.firstSeatNumber ?? 1,
      spacing: source.seatSpacing ?? 38,
      width: source.seatWidth ?? 24,
      height: source.seatHeight ?? 24,
      radius: source.radius ?? 150,
      startAngle: source.startAngle ?? 200,
      endAngle: source.endAngle ?? 340,
      reverse: source.reverseNumbering ?? false,
      direction: source.curveDirection ?? 1,
      ticketTierId: source.ticketTypeId ?? source.seats[0]?.ticketTypeId ?? "",
      seatIds: source.seats.map((seat) => seat.id ?? uid()),
    };
    rows.push(row);
    seats.push(
      ...source.seats.map((seat, index) => ({
        id: row.seatIds[index],
        rowId: id,
        code: seat.number,
        x: seat.x,
        y: seat.y,
        rotation: seat.rotation ?? 0,
        width: seat.width ?? row.width,
        height: seat.height ?? row.height,
        ticketTierId: seat.ticketTypeId ?? undefined,
        detached: true,
      })),
    );
  });
  return { rows, seats, zones };
}

const numberInput = (
  label: string,
  value: number,
  onChange: (value: number) => void,
  min = 0,
  step = 1,
) => (
  <label className="seat-field">
    {label}
    <input
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={(event) =>
        onChange(Math.max(min, Number(event.target.value) || min))
      }
    />
  </label>
);
const textInput = (
  label: string,
  value: string,
  onChange: (value: string) => void,
) => (
  <label className="seat-field">
    {label}
    <input value={value} onChange={(event) => onChange(event.target.value)} />
  </label>
);

export function SeatMapEditor({
  onImageChange,
  onImageFileChange,
  onMapChange,
  initialMap,
  initialImage = "",
  ticketTiers = [],
}: {
  onImageChange?: (value: string) => void;
  onImageFileChange?: (file: File) => void;
  onMapChange?: (value: SeatMap) => void;
  initialMap?: SeatMap | null;
  initialImage?: string;
  ticketTiers?: readonly TicketTierOption[];
}) {
  const [initialState] = useState(() => readSeatMap(initialMap));
  const [mode, setMode] = useState<"design" | "upload">(
    initialMap?.imageUrl ? "upload" : "design",
  );
  const [background, setBackground] = useState(
    initialMap?.imageUrl ?? initialImage,
  );
  const [previewImage, setPreviewImage] = useState(
    initialMap?.imageUrl ?? initialImage,
  );
  const localPreviewUrl = useRef<string | null>(null);
  const [rows, setRows] = useState<SeatRow[]>(initialState.rows);
  const [seats, setSeats] = useState<Seat[]>(initialState.seats);
  const [zones, setZones] = useState<SeatZone[]>(initialState.zones);
  const [selected, setSelected] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [tool, setTool] = useState<Mode>("select");
  const [warning, setWarning] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{
    id: string;
    pointerX: number;
    pointerY: number;
    itemX: number;
    itemY: number;
  } | null>(null);
  const panDrag = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
  } | null>(null);

  useEffect(
    () => () => {
      if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
    },
    [],
  );
  const row = rows.find((item) => item.id === selected);
  const seat = seats.find((item) => item.id === selected);
  const zone = zones.find((item) => item.id === selected);
  const seatRow = seat
    ? rows.find((item) => item.id === seat.rowId)
    : undefined;
  const seatTicketTier = seatRow
    ? ticketTiers.find(
        (item) => item.id === (seat?.ticketTierId || seatRow.ticketTierId),
      )
    : undefined;
  const overlapCount = useMemo(
    () =>
      seats.reduce(
        (total, a, index) =>
          total +
          seats
            .slice(index + 1)
            .filter(
              (b) =>
                Math.hypot(a.x - b.x, a.y - b.y) <
                Math.min(a.width, a.height) * 0.8,
            ).length,
        0,
      ),
    [seats],
  );

  useEffect(() => {
    if (!onMapChange) return;
    const mapId = initialMap?.id;
    const eventId = initialMap?.eventId;
    const rowPayloads: SeatMapRow[] = rows.map((item) => ({
      id: item.id,
      label: item.name,
      x: item.x,
      y: item.y,
      rotation: item.rotation,
      type: item.kind === "arc" ? "ARC" : "STRAIGHT",
      firstSeatNumber: item.start,
      seatSpacing: item.spacing,
      seatWidth: item.width,
      seatHeight: item.height,
      radius: item.kind === "arc" ? item.radius : null,
      startAngle: item.kind === "arc" ? item.startAngle : null,
      endAngle: item.kind === "arc" ? item.endAngle : null,
      curveDirection: item.direction,
      reverseNumbering: item.reverse,
      ticketTypeId: item.ticketTierId || null,
      seats: seats
        .filter((seat) => seat.rowId === item.id)
        .map((seat) => ({
          id: seat.id,
          number: seat.code,
          x: seat.x,
          y: seat.y,
          rotation: seat.rotation,
          width: seat.width,
          height: seat.height,
          ticketTypeId: seat.ticketTierId || null,
        })),
    }));
    onMapChange({
      id: mapId,
      eventId,
      mode: rowPayloads.length ? "ASSIGNED_SEATING" : "NO_SELECTION",
      width: 900,
      height: 620,
      imageUrl: background || null,
      vatThe: zones.map((item) => ({
        x: item.x,
        y: item.y,
        width: item.width,
        height: item.height,
        rotation: item.rotation,
      })),
      hangs: rowPayloads,
    });
  }, [
    background,
    initialMap?.eventId,
    initialMap?.id,
    onMapChange,
    rows,
    seats,
    zones,
  ]);

  const makeRow = (
    kind: SeatRow["kind"],
    config: Partial<SeatRow> = {},
    at = { x: 400, y: 300 },
  ) => {
    const id = uid();
    const hasAutomaticPrefix = config.prefix === undefined;
    let automaticPrefixIndex = 0;
    const automaticPrefix = (index: number) => {
      let value = "";
      let remainder = index;
      do {
        value = String.fromCharCode(65 + (remainder % 26)) + value;
        remainder = Math.floor(remainder / 26) - 1;
      } while (remainder >= 0);
      return value;
    };
    const next: SeatRow = {
      id,
      name: kind === "arc" ? "Hàng cong" : "Hàng A",
      kind,
      x: at.x,
      y: at.y,
      rotation: 0,
      count: 10,
      prefix: "A",
      start: 1,
      spacing: 38,
      width: 24,
      height: 24,
      radius: 150,
      startAngle: 200,
      endAngle: 340,
      reverse: false,
      direction: 1,
      ticketTierId: config.ticketTierId ?? ticketTiers[0]?.id ?? "",
      seatIds: [],
      ...config,
    };
    const hasCodeConflict = (prefix: string) => {
      const codes = Array.from(
        { length: next.count },
        (_, index) =>
          `${prefix}${String(next.start + (next.reverse ? next.count - 1 - index : index)).padStart(2, "0")}`,
      );
      const occupied = new Set(seats.map((item) => item.code));
      return (
        codes.some((code) => occupied.has(code)) ||
        new Set(codes).size !== codes.length
      );
    };
    if (hasAutomaticPrefix) {
      while (hasCodeConflict(automaticPrefix(automaticPrefixIndex)))
        automaticPrefixIndex += 1;
      next.prefix = automaticPrefix(automaticPrefixIndex);
      if (config.name === undefined && kind === "straight")
        next.name = `Hàng ${next.prefix}`;
    }
    const rowSeats = Array.from({ length: next.count }, (_, index) => {
      const point = rowCoordinates(next, index);
      const angle =
        next.kind === "straight"
          ? next.rotation
          : (Math.atan2(point.y - next.y, point.x - next.x) * 180) / Math.PI +
            90 +
            next.rotation;
      return {
        id: uid(),
        rowId: id,
        code: `${next.prefix}${String(next.start + (next.reverse ? next.count - 1 - index : index)).padStart(2, "0")}`,
        x: point.x,
        y: point.y,
        rotation: angle,
        width: next.width,
        height: next.height,
      };
    });
    if (
      new Set([
        ...seats.map((item) => item.code),
        ...rowSeats.map((item) => item.code),
      ]).size !==
      seats.length + rowSeats.length
    ) {
      setWarning("Mã ghế bị trùng. Hãy đổi tiền tố hoặc số bắt đầu.");
      return;
    }
    next.seatIds = rowSeats.map((item) => item.id);
    setRows((old) => [...old, next]);
    setSeats((old) => [...old, ...rowSeats]);
    setSelected(id);
    setWarning("");
  };
  const rowCoordinates = (item: SeatRow, index: number) => {
    const local =
      item.kind === "straight"
        ? {
            x: (index - (item.count - 1) / 2) * item.spacing * item.direction,
            y: 0,
          }
        : (() => {
            const angle =
              ((item.startAngle +
                (item.endAngle - item.startAngle) *
                  (item.count === 1 ? 0.5 : index / (item.count - 1)) *
                  item.direction) *
                Math.PI) /
              180;
            return {
              x: Math.cos(angle) * item.radius,
              y: Math.sin(angle) * item.radius,
            };
          })();
    const rotation = (item.rotation * Math.PI) / 180;
    return {
      x: item.x + local.x * Math.cos(rotation) - local.y * Math.sin(rotation),
      y: item.y + local.x * Math.sin(rotation) + local.y * Math.cos(rotation),
    };
  };
  const rowPath = (item: SeatRow) => {
    const pointCount =
      item.kind === "straight" ? 2 : Math.max(24, item.count * 4);
    return Array.from({ length: pointCount }, (_, index) => {
      const seatIndex =
        item.count <= 1 ? 0 : ((item.count - 1) * index) / (pointCount - 1);
      const point = rowCoordinates(item, seatIndex);
      return `${index === 0 ? "M" : "L"}${point.x},${point.y}`;
    }).join(" ");
  };
  const refreshRow = (item: SeatRow, keepDetached = true) =>
    setSeats((old) =>
      old.map((current) => {
        if (current.rowId !== item.id) return current;
        const seatIndex = item.seatIds.indexOf(current.id);
        if (keepDetached && current.detached) return current;
        const point = rowCoordinates(item, seatIndex);
        const codeNumber =
          item.start + (item.reverse ? item.count - 1 - seatIndex : seatIndex);
        return {
          ...current,
          code: `${item.prefix}${String(codeNumber).padStart(2, "0")}`,
          x: point.x,
          y: point.y,
          width: item.width,
          height: item.height,
          rotation:
            item.kind === "straight"
              ? item.rotation
              : (Math.atan2(point.y - item.y, point.x - item.x) * 180) /
                  Math.PI +
                90 +
                item.rotation,
        };
      }),
    );
  const patchRow = (patch: Partial<SeatRow>) => {
    if (!row) return;
    let updated = { ...row, ...patch };
    const existing = seats.filter((item) => item.rowId === row.id);
    if (updated.count !== row.count) {
      const kept = row.seatIds.slice(0, updated.count);
      const additions = Array.from(
        { length: Math.max(0, updated.count - kept.length) },
        () => uid(),
      );
      updated = { ...updated, seatIds: [...kept, ...additions] };
      const proposedCodes = updated.seatIds.map(
        (_, index) =>
          `${updated.prefix}${String(updated.start + (updated.reverse ? updated.count - 1 - index : index)).padStart(2, "0")}`,
      );
      if (
        new Set([
          ...seats
            .filter((item) => item.rowId !== row.id)
            .map((item) => item.code),
          ...proposedCodes,
        ]).size !==
        seats.length - existing.length + proposedCodes.length
      ) {
        setWarning("Mã ghế bị trùng. Hãy đổi tiền tố hoặc số bắt đầu.");
        return;
      }
      setSeats((old) => [
        ...old.filter(
          (item) => item.rowId !== row.id || kept.includes(item.id),
        ),
        ...additions.map((id) => ({
          id,
          rowId: row.id,
          code: "",
          x: row.x,
          y: row.y,
          rotation: 0,
          width: updated.width,
          height: updated.height,
        })),
      ]);
    } else if (
      patch.prefix !== undefined ||
      patch.start !== undefined ||
      patch.reverse !== undefined
    ) {
      const codes = updated.seatIds.map(
        (_, index) =>
          `${updated.prefix}${String(updated.start + (updated.reverse ? updated.count - 1 - index : index)).padStart(2, "0")}`,
      );
      if (
        new Set([
          ...seats
            .filter((item) => item.rowId !== row.id)
            .map((item) => item.code),
          ...codes,
        ]).size !== seats.length
      ) {
        setWarning("Mã ghế bị trùng. Hãy đổi tiền tố hoặc số bắt đầu.");
        return;
      }
    }
    setRows((old) => old.map((item) => (item.id === row.id ? updated : item)));
    refreshRow(updated);
    setWarning("");
  };
  const screenToWorld = (clientX: number, clientY: number) => {
    const point = svgRef.current!.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    const local = point.matrixTransform(
      svgRef.current!.getScreenCTM()!.inverse(),
    );
    return { x: (local.x - pan.x) / zoom, y: (local.y - pan.y) / zoom };
  };
  const screenToCanvas = (clientX: number, clientY: number) => {
    const point = svgRef.current!.createSVGPoint();
    point.x = clientX;
    point.y = clientY;
    return point.matrixTransform(svgRef.current!.getScreenCTM()!.inverse());
  };
  const pointerDown = (
    event: ReactPointerEvent<SVGElement>,
    id: string,
    type: "row" | "seat" | "zone",
  ) => {
    event.stopPropagation();
    svgRef.current?.setPointerCapture(event.pointerId);
    setSelected(id);
    if (tool === "pan" || event.button === 1) {
      panDrag.current = {
        x: event.clientX,
        y: event.clientY,
        panX: pan.x,
        panY: pan.y,
      };
      return;
    }
    const item =
      type === "seat"
        ? seats.find((value) => value.id === id)
        : type === "zone"
          ? zones.find((value) => value.id === id)
          : rows.find((value) => value.id === id);
    if (item) {
      const point = screenToWorld(event.clientX, event.clientY);
      drag.current = {
        id,
        pointerX: point.x,
        pointerY: point.y,
        itemX: item.x,
        itemY: item.y,
      };
    }
  };
  const pointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (panDrag.current) {
      setPan({
        x:
          panDrag.current.panX +
          screenToCanvas(event.clientX, event.clientY).x -
          screenToCanvas(panDrag.current.x, panDrag.current.y).x,
        y:
          panDrag.current.panY +
          screenToCanvas(event.clientX, event.clientY).y -
          screenToCanvas(panDrag.current.x, panDrag.current.y).y,
      });
      return;
    }
    if (!drag.current) return;
    const point = screenToWorld(event.clientX, event.clientY);
    const deltaX = point.x - drag.current.pointerX,
      deltaY = point.y - drag.current.pointerY;
    const targetRow = rows.find((item) => item.id === drag.current?.id);
    if (targetRow) {
      const updated = {
        ...targetRow,
        x: drag.current.itemX + deltaX,
        y: drag.current.itemY + deltaY,
      };
      setRows((old) =>
        old.map((item) => (item.id === updated.id ? updated : item)),
      );
      setSeats((old) =>
        old.map((item) => {
          if (item.rowId !== updated.id || item.detached) return item;
          const nextPoint = rowCoordinates(
            updated,
            updated.seatIds.indexOf(item.id),
          );
          return { ...item, x: nextPoint.x, y: nextPoint.y };
        }),
      );
    } else {
      const targetSeat = seats.find((item) => item.id === drag.current?.id);
      if (targetSeat) {
        setSeats((old) =>
          old.map((item) =>
            item.id === targetSeat.id
              ? {
                  ...item,
                  x: drag.current!.itemX + deltaX,
                  y: drag.current!.itemY + deltaY,
                  detached: true,
                }
              : item,
          ),
        );
      } else {
        const targetZone = zones.find((item) => item.id === drag.current?.id);
        if (targetZone)
          setZones((old) =>
            old.map((item) =>
              item.id === targetZone.id
                ? {
                    ...item,
                    x: drag.current!.itemX + deltaX,
                    y: drag.current!.itemY + deltaY,
                  }
                : item,
            ),
          );
      }
    }
  };
  const onWheel = (event: WheelEvent<SVGSVGElement>) => {
    event.preventDefault();
    const cursor = screenToCanvas(event.clientX, event.clientY);
    const px = cursor.x,
      py = cursor.y;
    const next = Math.max(
      0.25,
      Math.min(3, zoom * Math.exp(-event.deltaY * 0.001)),
    );
    setPan({
      x: px - ((px - pan.x) * next) / zoom,
      y: py - ((py - pan.y) * next) / zoom,
    });
    setZoom(next);
  };
  const deleteSelected = () => {
    if (seat) {
      setSeats((old) => old.filter((item) => item.id !== seat.id));
      setRows((old) =>
        old.map((item) => ({
          ...item,
          seatIds: item.seatIds.filter((id) => id !== seat.id),
        })),
      );
    } else if (row) {
      setRows((old) => old.filter((item) => item.id !== row.id));
      setSeats((old) => old.filter((item) => item.rowId !== row.id));
    } else if (zone) {
      setZones((old) => old.filter((item) => item.id !== zone.id));
    }
    setSelected(null);
  };
  const deleteAll = () => {
    setRows([]);
    setSeats([]);
    setZones([]);
    setSelected(null);
    setWarning("");
  };
  const copyRow = () => {
    if (!row) return;
    const { id, seatIds, ...settings } = row;
    void id;
    void seatIds;
    let suffix = 2;
    let prefix = `${row.prefix}${suffix}`;
    while (seats.some((item) => item.code.startsWith(prefix)))
      prefix = `${row.prefix}${++suffix}`;
    makeRow(
      row.kind,
      { ...settings, name: `${row.name} copy`, prefix },
      { x: row.x, y: row.y + 60 },
    );
  };
  const addBatch = () => {
    const count = Number(
      (document.getElementById("seat-row-count") as HTMLInputElement)?.value ||
        3,
    );
    const seatsEach = Number(
      (document.getElementById("seat-each-count") as HTMLInputElement)?.value ||
        8,
    );
    const gap = Number(
      (document.getElementById("seat-row-gap") as HTMLInputElement)?.value ||
        70,
    );
    const prefix =
      (document.getElementById("seat-batch-prefix") as HTMLInputElement)
        ?.value || "B";
    for (let index = 0; index < count; index++)
      makeRow(
        "straight",
        {
          name: `Hàng ${prefix}${index + 1}`,
          prefix: `${prefix}${index + 1}`,
          count: seatsEach,
        },
        { x: 400, y: 230 + index * gap },
      );
  };
  const uploaded = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setWarning("Chọn tệp ảnh hợp lệ để làm nền.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    if (localPreviewUrl.current) URL.revokeObjectURL(localPreviewUrl.current);
    localPreviewUrl.current = localUrl;
    setPreviewImage(localUrl);
    setBackground(localUrl);
    onImageChange?.(localUrl);
    onImageFileChange?.(file);
    setWarning("");
  };

  return (
    <section className="seat-editor">
      <header className="seat-editor-header">
        <div>
          <span className="seat-kicker">CÔNG CỤ THIẾT KẾ</span>
          <h2>Sơ đồ chỗ ngồi</h2>
          <p>
            Thiết kế sơ đồ trực tiếp trong trình duyệt. Thay đổi chỉ tồn tại
            trong phiên hiện tại.
          </p>
        </div>
        <div className="seat-mode">
          <button
            className={mode === "design" ? "active" : ""}
            onClick={() => setMode("design")}
            type="button"
          >
            Tự thiết kế
          </button>
          <button
            className={mode === "upload" ? "active" : ""}
            onClick={() => setMode("upload")}
            type="button"
          >
            Upload ảnh
          </button>
        </div>
      </header>
      {mode === "upload" ? (
        <div className="seat-upload-panel">
          <div className="seat-upload-panel-header">
            <div>
              <strong>Ảnh sơ đồ chỗ ngồi</strong>
              <p>
                Chọn ảnh để xem trước. Ảnh sẽ được tải lên khi bạn lưu sự kiện.
              </p>
            </div>
            <label className="seat-upload seat-upload-picker">
              {previewImage ? "Chọn ảnh khác" : "Chọn ảnh sơ đồ"}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  uploaded(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
          {warning && (
            <p className="seat-warning" role="alert">
              {warning}
            </p>
          )}
          {previewImage ? (
            <div className="seat-upload-preview">
              <img src={previewImage} alt="Xem trước ảnh sơ đồ chỗ ngồi" />
            </div>
          ) : (
            <div className="seat-upload-empty">
              Ảnh sơ đồ sẽ hiện ở đây sau khi bạn chọn tệp.
            </div>
          )}
        </div>
      ) : (
        <div className="seat-workspace">
          <aside className="seat-tools">
            <span className="seat-section-label">THÊM VÀO SƠ ĐỒ</span>
            <button onClick={() => makeRow("straight")} type="button">
              ＋ Hàng thẳng
            </button>
            <button onClick={() => makeRow("arc")} type="button">
              ⌒ Hàng cong
            </button>
            <button
              onClick={() => {
                const id = uid();
                setZones((old) => [
                  ...old,
                  {
                    id,
                    x: 420,
                    y: 300,
                    width: 220,
                    height: 120,
                    rotation: 0,
                  },
                ]);
                setSelected(id);
              }}
              type="button"
            >
              ▱ Thêm khối
            </button>
            <div className="seat-batch">
              <b>Nhiều hàng</b>
              <label>
                Số hàng
                <input
                  id="seat-row-count"
                  type="number"
                  min="1"
                  defaultValue="3"
                />
              </label>
              <label>
                Ghế mỗi hàng
                <input
                  id="seat-each-count"
                  type="number"
                  min="1"
                  defaultValue="8"
                />
              </label>
              <label>
                Tiền tố
                <input id="seat-batch-prefix" defaultValue="B" />
              </label>
              <label>
                Khoảng cách hàng
                <input
                  id="seat-row-gap"
                  type="number"
                  min="20"
                  defaultValue="70"
                />
              </label>
              <button onClick={addBatch} type="button">
                Tạo các hàng
              </button>
            </div>
            <div className="seat-tool-bottom">
              <button
                className={tool === "select" ? "active" : ""}
                onClick={() => setTool("select")}
                type="button"
              >
                ↖ Chọn / kéo
              </button>
              <button
                className={tool === "pan" ? "active" : ""}
                onClick={() => setTool("pan")}
                type="button"
              >
                ✋ Di chuyển vùng
              </button>
              <label className="seat-upload">
                ＋ Tải ảnh nền
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => uploaded(event.target.files?.[0])}
                />
              </label>
              <button
                className="seat-clear-all"
                type="button"
                disabled={
                  rows.length === 0 && seats.length === 0 && zones.length === 0
                }
                onClick={deleteAll}
              >
                Xóa tất cả ghế và khối
              </button>
            </div>
          </aside>
          <div className="seat-stage-wrap">
            <div className="seat-stage-toolbar">
              <span>Bảng vẽ SVG</span>
              <div>
                <button
                  onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
                  type="button"
                >
                  −
                </button>
                <span>{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                  type="button"
                >
                  ＋
                </button>
                <button
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  type="button"
                >
                  Đặt lại khung
                </button>
              </div>
            </div>
            <svg
              ref={svgRef}
              className="seat-canvas"
              viewBox="0 0 900 620"
              onPointerMove={pointerMove}
              onPointerUp={() => {
                drag.current = null;
                panDrag.current = null;
              }}
              onPointerCancel={() => {
                drag.current = null;
                panDrag.current = null;
              }}
              onWheel={onWheel}
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) setSelected(null);
              }}
              style={{
                cursor: tool === "pan" ? "grab" : "default",
                touchAction: "none",
              }}
            >
              <defs>
                <pattern
                  id="seat-grid"
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="1" cy="1" r="1" fill="#d9d2c6" />
                </pattern>
              </defs>
              <rect width="900" height="620" fill="#f8f6f0" />
              <g transform={`translate(${pan.x} ${pan.y}) scale(${zoom})`}>
                <rect width="900" height="620" fill="url(#seat-grid)" />
                {background && (
                  <image
                    href={background}
                    x="30"
                    y="30"
                    width="840"
                    height="560"
                    preserveAspectRatio="xMidYMid meet"
                    opacity=".76"
                  />
                )}
                {rows.map((item) => (
                  <g
                    key={item.id}
                    onPointerDown={(event) =>
                      pointerDown(event, item.id, "row")
                    }
                    style={{ cursor: "move" }}
                  >
                    <path
                      d={rowPath(item)}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="28"
                      vectorEffect="non-scaling-stroke"
                      pointerEvents="stroke"
                    />
                    <path
                      d={rowPath(item)}
                      fill="none"
                      stroke={selected === item.id ? "#4f64d8" : "#97a3a0"}
                      strokeDasharray="4 5"
                      strokeWidth="1.5"
                      pointerEvents="none"
                    />
                    {selected === item.id && (
                      <text
                        x={item.x}
                        y={item.y - 30}
                        textAnchor="middle"
                        fontSize="13"
                        fill="#273c36"
                      >
                        {item.name}
                      </text>
                    )}
                  </g>
                ))}
                {zones.map((item) => (
                  <g
                    key={item.id}
                    transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}
                    onPointerDown={(event) =>
                      pointerDown(event, item.id, "zone")
                    }
                    style={{ cursor: "move" }}
                  >
                    <rect
                      x={-item.width / 2}
                      y={-item.height / 2}
                      width={item.width}
                      height={item.height}
                      rx="12"
                      fill="#dff0db80"
                      stroke={selected === item.id ? "#1d6a50" : "#82a58f"}
                      strokeDasharray="7 4"
                      strokeWidth="2"
                    />
                    <text
                      textAnchor="middle"
                      y="4"
                      fontSize="13"
                      fill="#325241"
                      pointerEvents="none"
                    >
                      Vật thể
                    </text>
                  </g>
                ))}
                {seats.map((item) => (
                  <g
                    key={item.id}
                    transform={`translate(${item.x} ${item.y}) rotate(${item.rotation})`}
                    onPointerDown={(event) =>
                      pointerDown(event, item.id, "seat")
                    }
                    style={{ cursor: "move" }}
                  >
                    <rect
                      x={-item.width / 2}
                      y={-item.height / 2}
                      width={item.width}
                      height={item.height}
                      rx="5"
                      fill={selected === item.id ? "#dff0db" : "#fffdf8"}
                      stroke={selected === item.id ? "#1d6a50" : "#66716d"}
                      strokeWidth={selected === item.id ? 2 : 1.3}
                    />
                    <text
                      y={4}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#17211f"
                      pointerEvents="none"
                    >
                      {item.code}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
            <footer className="seat-stage-footer">
              <span>
                {zones.length} khối · {rows.length} hàng · {seats.length} ghế
              </span>
              <span>Kéo để di chuyển · Cuộn để phóng to/thu nhỏ</span>
            </footer>
          </div>
          <aside className="seat-properties">
            <span className="seat-section-label">THUỘC TÍNH</span>
            {row ? (
              <>
                <h3>{row.name}</h3>
                <label className="seat-field">
                  Hạng vé áp dụng cho hàng
                  <select
                    value={row.ticketTierId}
                    onChange={(event) =>
                      patchRow({ ticketTierId: event.target.value })
                    }
                  >
                    <option value="">Chọn hạng vé</option>
                    {ticketTiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} · {tier.price.toLocaleString("vi-VN")}₫
                      </option>
                    ))}
                  </select>
                </label>
                {ticketTiers.length === 0 && (
                  <p className="seat-empty-selection">
                    Hãy thêm hạng vé ở phía dưới để gán cho hàng ghế.
                  </p>
                )}
                {textInput("Tên hàng", row.name, (value) =>
                  patchRow({ name: value }),
                )}
                {numberInput(
                  "Số ghế",
                  row.count,
                  (value) => patchRow({ count: value }),
                  1,
                )}
                {textInput("Tiền tố mã ghế", row.prefix, (value) =>
                  patchRow({ prefix: value }),
                )}
                {numberInput("Số ghế bắt đầu", row.start, (value) =>
                  patchRow({ start: value }),
                )}
                <label className="seat-field">
                  Chiều đánh số
                  <select
                    value={row.reverse ? "reverse" : "forward"}
                    onChange={(event) =>
                      patchRow({ reverse: event.target.value === "reverse" })
                    }
                  >
                    <option value="forward">Trái sang phải</option>
                    <option value="reverse">Phải sang trái</option>
                  </select>
                </label>
                {numberInput(
                  "Khoảng cách ghế",
                  row.spacing,
                  (value) => patchRow({ spacing: value }),
                  1,
                )}
                {numberInput(
                  "Rộng ghế",
                  row.width,
                  (value) => patchRow({ width: value }),
                  6,
                )}
                {numberInput(
                  "Cao ghế",
                  row.height,
                  (value) => patchRow({ height: value }),
                  6,
                )}
                {row.kind === "arc" ? (
                  <>
                    {numberInput(
                      "Bán kính",
                      row.radius,
                      (value) => patchRow({ radius: value }),
                      20,
                    )}
                    {numberInput("Góc bắt đầu", row.startAngle, (value) =>
                      patchRow({ startAngle: value }),
                    )}
                    {numberInput("Góc kết thúc", row.endAngle, (value) =>
                      patchRow({ endAngle: value }),
                    )}
                    <label className="seat-field">
                      Hướng cong
                      <select
                        value={row.direction}
                        onChange={(event) =>
                          patchRow({
                            direction: Number(event.target.value) as 1 | -1,
                          })
                        }
                      >
                        <option value={1}>Thuận chiều</option>
                        <option value={-1}>Ngược chiều</option>
                      </select>
                    </label>
                  </>
                ) : (
                  numberInput("Góc xoay", row.rotation, (value) =>
                    patchRow({ rotation: value }),
                  )
                )}
                <div className="seat-property-actions">
                  <button onClick={copyRow} type="button">
                    Sao chép hàng
                  </button>
                  <button
                    className="danger"
                    onClick={deleteSelected}
                    type="button"
                  >
                    Xóa hàng
                  </button>
                </div>
              </>
            ) : zone ? (
              <>
                <h3>Vật thể</h3>
                {numberInput(
                  "Rộng khối",
                  zone.width,
                  (value) =>
                    setZones((old) =>
                      old.map((item) =>
                        item.id === zone.id ? { ...item, width: value } : item,
                      ),
                    ),
                  20,
                )}
                {numberInput(
                  "Cao khối",
                  zone.height,
                  (value) =>
                    setZones((old) =>
                      old.map((item) =>
                        item.id === zone.id ? { ...item, height: value } : item,
                      ),
                    ),
                  20,
                )}
                {numberInput("Góc xoay", zone.rotation, (value) =>
                  setZones((old) =>
                    old.map((item) =>
                      item.id === zone.id ? { ...item, rotation: value } : item,
                    ),
                  ),
                )}
                <button
                  className="seat-delete"
                  onClick={deleteSelected}
                  type="button"
                >
                  Xóa khối
                </button>
              </>
            ) : seat ? (
              <>
                <h3>Ghế {seat.code}</h3>
                <p className="seat-assignment-summary">
                  {seatRow?.name ? `${seatRow.name} · ` : "Chưa gán hàng · "}
                  {seatTicketTier
                    ? `${seatTicketTier.name} · ${seatTicketTier.price.toLocaleString("vi-VN")}₫`
                    : "Chưa có loại vé áp dụng"}
                </p>
                <label className="seat-field">
                  Hạng vé riêng cho ghế
                  <select
                    value={seat.ticketTierId ?? ""}
                    onChange={(event) =>
                      setSeats((old) =>
                        old.map((item) =>
                          item.id === seat.id
                            ? {
                                ...item,
                                ticketTierId: event.target.value || undefined,
                              }
                            : item,
                        ),
                      )
                    }
                  >
                    <option value="">
                      Theo hàng
                      {seatTicketTier ? ` · ${seatTicketTier.name}` : ""}
                    </option>
                    {ticketTiers.map((tier) => (
                      <option key={tier.id} value={tier.id}>
                        {tier.name} · {tier.price.toLocaleString("vi-VN")}₫
                      </option>
                    ))}
                  </select>
                </label>
                {textInput("Mã ghế", seat.code, (value) => {
                  if (
                    seats.some(
                      (item) => item.code === value && item.id !== seat.id,
                    )
                  ) {
                    setWarning("Mã ghế đã được sử dụng.");
                    return;
                  }
                  setSeats((old) =>
                    old.map((item) =>
                      item.id === seat.id ? { ...item, code: value } : item,
                    ),
                  );
                  setWarning("");
                })}
                {numberInput("X", seat.x, (value) =>
                  setSeats((old) =>
                    old.map((item) =>
                      item.id === seat.id
                        ? { ...item, x: value, detached: true }
                        : item,
                    ),
                  ),
                )}
                {numberInput("Y", seat.y, (value) =>
                  setSeats((old) =>
                    old.map((item) =>
                      item.id === seat.id
                        ? { ...item, y: value, detached: true }
                        : item,
                    ),
                  ),
                )}
                {numberInput("Góc xoay", seat.rotation, (value) =>
                  setSeats((old) =>
                    old.map((item) =>
                      item.id === seat.id
                        ? { ...item, rotation: value, detached: true }
                        : item,
                    ),
                  ),
                )}
                <button
                  className="seat-delete"
                  onClick={deleteSelected}
                  type="button"
                >
                  Xóa ghế
                </button>
              </>
            ) : (
              <p className="seat-empty-selection">
                Chọn hàng hoặc ghế để xem và chỉnh thuộc tính.
              </p>
            )}
            {warning && (
              <p className="seat-warning" role="alert">
                {warning}
              </p>
            )}
            {overlapCount > 0 && (
              <p className="seat-warning" role="status">
                Phát hiện {overlapCount} cặp ghế chồng lấn đáng kể.
              </p>
            )}
          </aside>
        </div>
      )}
      <p className="seat-local-note">
        Sơ đồ sẽ được lưu cùng sự kiện khi bạn gửi hoặc lưu biểu mẫu.
      </p>
    </section>
  );
}
