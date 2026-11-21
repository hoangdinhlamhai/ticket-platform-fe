export type AdminPaymentQuery = {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
};

export type AdminPayment = {
  id: string;
  provider?: string;
  transactionId?: string | null;
  amount: number | string;
  status: string;
  paidAt?: string | null;
  createdAt: string;
  order: {
    id: string;
    user: { fullName: string; email: string };
    event: { title: string };
    tickets?: readonly {
      id: string;
      ticketCode: string;
      status: string;
      ticketType: string;
      seat: string | null;
    }[];
  };
};
