export type AdminPayout = {
  id: string;
  amount: string | number;
  currency: string;
  breakdown?: {
    grossAmount: string | number | null;
    refundAmount: string | number | null;
    platformFee: string | number | null;
    paymentFee: string | number | null;
    platformFeeRate?: string | number | null;
    paymentFeeRate?: string | number | null;
  };
  status: string;
  providerPayoutId?: string | null;
  approvedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
  event: {
    id: string;
    title: string;
    status: string;
    startAt: string;
    endAt: string;
  };
  organizer: {
    id: string;
    fullName: string;
    email: string;
  };
  bankAccount: {
    accountHolder: string;
    accountNumber: string;
    bankName: string;
    branch: string;
    bankCode?: string | null;
    recipientCity?: string | null;
    recipientAddress?: string | null;
  } | null;
};

export type PendingPayoutsResponse = {
  payouts: readonly AdminPayout[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminPayoutResponse = {
  payout: AdminPayout;
};

export type AdminPayoutActionResponse = {
  payout: {
    id: string;
    eventId: string;
    amount: string | number;
    currency: string;
    status: string;
    providerPayoutId: string | null;
  };
  provider: {
    payout_id: string;
    status: string;
  };
};
