export type SeatMapMode = "ASSIGNED_SEATING" | "NO_SELECTION";

export type SeatMapSeat = {
  id?: string;
  number: string;
  x: number;
  y: number;
  rotation?: number;
  width?: number;
  height?: number;
  ticketTypeId?: string | null;
  ticketType?: { id: string; name: string; price: number } | null;
};

export type SeatMapRow = {
  id?: string;
  label: string;
  x: number;
  y: number;
  rotation?: number;
  type?: "STRAIGHT" | "ARC";
  firstSeatNumber?: number;
  seatSpacing?: number;
  seatWidth?: number;
  seatHeight?: number;
  radius?: number | null;
  startAngle?: number | null;
  endAngle?: number | null;
  curveDirection?: -1 | 1;
  reverseNumbering?: boolean;
  ticketTypeId?: string | null;
  ticketType?: { id: string; name: string; price: number } | null;
  seats: SeatMapSeat[];
};

export type SeatMapBlock = {
  id?: string;
  name: string;
  color?: string | null;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  rows: SeatMapRow[];
};

export type SeatMap = {
  id?: string;
  eventId?: string;
  mode: SeatMapMode;
  width?: number | null;
  height?: number | null;
  imageUrl?: string | null;
  blocks: SeatMapBlock[];
};

export type SeatMapResponse = { seatMap: SeatMap };
