import axiosClient from "../../../api/axiosClient";
import type { AttendeeOrderRecord } from "../../orders/types/order";
import type { OwnedTicket } from "../types/ticket";

type TicketApiRecord = {
  id: string;
  ticketCode: string;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    thumbnail: string | null;
    startAt: string;
    endAt: string;
    venueName: string | null;
  };
  ticketType: { id: string; name: string };
  seat: { id: string; number: string; row: string } | null;
  order: { id: string; payment: { paidAt: string | null } | null };
};

export const findMine = () =>
  axiosClient.get<{ tickets: TicketApiRecord[] }>("/tickets/mine");

export const findMineOrders = () =>
  axiosClient.get<{ orders: AttendeeOrderRecord[] }>("/orders");

export function toOwnedTicket(
  ticket: TicketApiRecord,
  orders: readonly AttendeeOrderRecord[],
): OwnedTicket {
  const order = orders.find((item) => item.id === ticket.order.id);
  const startAt = new Date(ticket.event.startAt);
  const seatLabel = ticket.seat?.number ?? null;
  const paidAt = order?.payment?.paidAt ?? ticket.order.payment?.paidAt;

  return {
    id: ticket.id,
    eventId: ticket.event.id,
    eventTitle: ticket.event.title,
    date: Number.isNaN(startAt.getTime())
      ? "Chưa có lịch"
      : new Intl.DateTimeFormat("vi-VN", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(startAt),
    venue: ticket.event.venueName ?? "Địa điểm sẽ được cập nhật",
    address: ticket.event.venueName ?? "",
    ticketType: [ticket.ticketType.name, seatLabel].filter(Boolean).join(" · "),
    holderName: "Vé của bạn",
    referenceCode: ticket.ticketCode,
    purchaseLabel: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(paidAt ?? ticket.createdAt)),
    status:
      startAt.getTime() > Date.now() ? "Sắp diễn ra" : "Sẵn sàng check-in",
    source: "primary",
    orderId: ticket.order.id,
    credentialCode: ticket.ticketCode,
    credentialStatus: "pending",
    resaleStatus: "ineligible",
    row: ticket.seat?.row ?? null,
    seats: seatLabel ? [seatLabel] : undefined,
    journey: [
      {
        label: "Thanh toán đã xác nhận",
        detail: `Đơn ${ticket.order.id} đã được thanh toán.`,
        state: "complete",
      },
      {
        label: "Vé đã được phát hành",
        detail: "Mã vé đã được ghi nhận trong tài khoản của bạn.",
        state: "current",
      },
      {
        label: "Check-in tại sự kiện",
        detail:
          "Thông tin QR check-in sẽ khả dụng khi backend phát hành credential.",
        state: "future",
      },
    ],
  };
}
