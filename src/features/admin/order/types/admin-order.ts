export type AdminOrderRow = {
  id: string;
  total: number | string;
  subtotal?: number | string;
  status: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string };
  event: { id: string; title: string };
  ticketCount: number;
  payments?: {
    id: string;
    status: string;
    provider: string;
    transactionId: string | null;
    amount: number | string;
    paidAt: string | null;
  }[];
  tickets?: {
    id: string;
    ticketCode: string;
    status: string;
    ticketType: string;
    seat: string | null;
  }[];
};
export type AdminOrderQuery = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
};
