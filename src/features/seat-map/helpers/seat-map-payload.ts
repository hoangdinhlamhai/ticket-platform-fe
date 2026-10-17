import type { SeatMap, SeatMapBlock } from "../types/seat-map.ts";

export type SeatMapWritePayload = Omit<SeatMap, "id" | "eventId"> & {
  blocks: Array<Omit<SeatMapBlock, "id">>;
};

export function toSeatMapWritePayload(
  seatMap: SeatMap,
  ticketTypeIds: Readonly<Record<string, string>> = {},
): SeatMapWritePayload {
  return {
    mode: seatMap.mode,
    width: seatMap.width,
    height: seatMap.height,
    imageUrl: seatMap.imageUrl,
    blocks: seatMap.blocks.map((block) => ({
      name: block.name,
      color: block.color,
      x: block.x,
      y: block.y,
      width: block.width,
      height: block.height,
      rotation: block.rotation,
      rows: block.rows.map((row) => ({
        label: row.label,
        x: row.x,
        y: row.y,
        rotation: row.rotation,
        type: row.type,
        firstSeatNumber: row.firstSeatNumber,
        seatSpacing: row.seatSpacing,
        seatWidth: row.seatWidth,
        seatHeight: row.seatHeight,
        radius: row.radius,
        startAngle: row.startAngle,
        endAngle: row.endAngle,
        curveDirection: row.curveDirection,
        reverseNumbering: row.reverseNumbering,
        ticketTypeId: row.ticketTypeId
          ? (ticketTypeIds[row.ticketTypeId] ?? row.ticketTypeId)
          : null,
        seats: row.seats.map((seat) => ({
          number: seat.number,
          x: seat.x,
          y: seat.y,
          rotation: seat.rotation,
          width: seat.width,
          height: seat.height,
          ticketTypeId: seat.ticketTypeId
            ? (ticketTypeIds[seat.ticketTypeId] ?? seat.ticketTypeId)
            : null,
        })),
      })),
    })),
  };
}
