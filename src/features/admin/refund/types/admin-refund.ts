export type AdminRefundStatus =
  "PENDING" | "REJECTED" | "PROCESSING" | "FAILED" | "SUCCEEDED";

export type AdminRefundMoney = number | string;

export type AdminRefund = {
  id: string;
  orderId: string;
  amount: AdminRefundMoney;
  reason: string;
  status: AdminRefundStatus;
  providerRefundId: string | null;
  failureReason: string | null;
  decisionReason: string | null;
  decidedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    total: AdminRefundMoney;
    status: string;
    user: {
      id: string;
      fullName: string;
      email: string;
    };
    event: {
      id: string;
      title: string;
    };
  };
  payment: {
    provider: string;
    paymentRequestId: string | null;
    transactionId: string | null;
    amount: AdminRefundMoney;
    paidAt: string | null;
  } | null;
};

export type AdminRefundListResponse = {
  refunds: AdminRefund[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminRefundResponse = {
  refund: AdminRefund;
};
