export type AdminUserStatus = "ACTIVE" | "SUSPENDED";

export type AdminUserRow = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: AdminUserStatus;
  createdAt: string;
  eventCount: number;
  orderCount: number;
  ticketCount: number;
};

export type AdminUser = AdminUserRow & {
  orders: readonly {
    id: string;
    total: number | string;
    status: string;
    createdAt: string;
    paymentStatus: string | null;
  }[];
  organizedEvents: readonly {
    id: string;
    title: string;
    status: string;
    createdAt: string;
    startAt?: string;
  }[];
  tickets: readonly {
    id: string;
    code: string;
    status: string;
    createdAt: string;
    event: { id: string; title: string; startAt: string };
    ticketType: string;
    transferred: boolean;
  }[];
};

export type AdminUserMetrics = {
  total: number;
  newThisMonth: number;
  active: number;
  locked: number;
};
