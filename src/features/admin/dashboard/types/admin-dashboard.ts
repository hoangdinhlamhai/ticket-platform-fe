export type Metrics = {
  userCount: number;
  organizerCount: number;
  eventCount: number;
  pendingReviewCount: number;
  paidOrderCount: number;
  grossRevenue: number | string;
  soldTicketCount: number;
  refundPendingCount: number;
  resaleActiveCount: number;
};

export type TimelineRow = {
  date: string;
  revenue: number;
  orders: number;
  tickets: number;
};

export type UserRow = {
  id: string;
  fullName: string;
  email: string;
  status: string;
  createdAt: string;
};

export type OrderRow = {
  id: string;
  total: number | string;
  status: string;
  createdAt: string;
  user: { fullName: string; email: string };
};

export type SectionState<T> = {
  data: T | null;
  error: string;
  loading: boolean;
};
