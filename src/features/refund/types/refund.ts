export type RefundRequestStatus =
  "PENDING" | "REJECTED" | "PROCESSING" | "FAILED" | "SUCCEEDED";

export type RefundRequestMoney = number | string;

export type RefundRequest = {
  id: string;
  orderId: string;
  amount: RefundRequestMoney;
  reason: string;
  status: RefundRequestStatus;
  failureReason: string | null;
  decisionReason: string | null;
  decidedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    total: RefundRequestMoney;
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
};

export type CreateRefundRequestInput = {
  reason: string;
};

export type CreateRefundRequestResponse = {
  refund: RefundRequest;
};

export type MyRefundRequestsResponse = {
  refunds: RefundRequest[];
};
