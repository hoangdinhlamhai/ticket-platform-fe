export type AdminPayout = {
  id: string;
  amount: string | number;
  currency: string;
  status: string;
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
