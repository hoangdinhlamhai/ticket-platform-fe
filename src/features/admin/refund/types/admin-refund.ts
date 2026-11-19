export type AdminRefundStatus =
  "PENDING" | "REJECTED" | "PROCESSING" | "FAILED" | "SUCCEEDED";

export type AdminRefundMoney = number | string;

export type AdminRefund = {
  id: string;
  orderId: string | null;
  targetType: "ORDER" | "RESALE";
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
  } | null;
  resaleTransaction: {
    id: string;
    amount: AdminRefundMoney;
    status: string;
    payoutStatus: string | null;
    payoutFailureCode: string | null;
    payoutUpdatedAt: string | null;
    buyer: { id: string; hoTen: string; email: string };
    seller: { id: string; hoTen: string; email: string };
    event: { id: string; tieuDe: string };
    listing: { id: string; status: string };
    ticket: { id: string; type: string; seat: string | null };
  } | null;
  payment: {
    provider: string;
    paymentRequestId: string | null;
    transactionId: string | null;
    providerPaymentId: string | null;
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
