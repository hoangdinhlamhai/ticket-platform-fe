export type AttendeeOrderSource = "primary" | "resale";
export type AttendeeOrderStatus = "completed" | "failed" | "expired";
export type DemoPaymentOutcome = AttendeeOrderStatus;
export type AttendeeOrderLineItem = {
  label: string;
  quantity: number;
  unitPrice: number;
};
export type AttendeeOrderBuyer = {
  fullName: string;
  email: string;
  phone?: string;
};
export type AttendeeOrder = {
  id: string;
  source: AttendeeOrderSource;
  status: AttendeeOrderStatus;
  eventId: string;
  eventTitle: string;
  buyer: AttendeeOrderBuyer;
  items: readonly AttendeeOrderLineItem[];
  subtotal: number;
  serviceFee: 0;
  total: number;
  createdAt: string;
  paidAt: string | null;
  issuedTicketIds: readonly string[];
  resaleListingId?: string;
};
export type PrimaryCheckoutSelection = {
  eventId: string;
  eventTitle: string;
  date: string;
  venue: string;
  address: string;
  ticketTierId: string;
  ticketTierName: string;
  unitPrice: number;
  quantity: number;
};
export type OrderFilters = {
  status: "all" | "PENDING_PAYMENT" | "PAID" | "FAILED" | "EXPIRED";
};

export type CreateOrderInput = {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  payerEmail: string;
};

export type CreateOrderResponse = {
  orderId: string;
  paymentSessionId: string;
  paymentLinkUrl: string;
};

export type OrderMoney = number | string;

export type OrderEventSummary = {
  id: string;
  title: string;
  thumbnail: string | null;
  startAt: string;
};

export type OrderItemSummary = {
  quantity: number;
  unitPrice: OrderMoney;
  ticketType: { id: string; name: string };
};

export type OrderPaymentSummary = {
  provider: string;
  amount: OrderMoney;
  status: string;
  paidAt: string | null;
};

export type AttendeeOrderRecord = {
  id: string;
  total: OrderMoney;
  status: string;
  expiresAt: string | null;
  createdAt: string;
  event: OrderEventSummary;
  items: OrderItemSummary[];
  payment: OrderPaymentSummary | null;
};

export type AttendeeOrderDetail = Omit<
  AttendeeOrderRecord,
  "event" | "payment"
> & {
  updatedAt: string;
  event: OrderEventSummary & {
    endAt: string;
    venueName: string | null;
  };
  payment:
    | (OrderPaymentSummary & {
        transactionId: string | null;
        paymentSessionId: string | null;
      })
    | null;
  tickets: { id: string; ticketCode: string; status: string }[];
};
