export type AdminCategory = {
  id: string;
  name: string;
  eventCount: number;
};

// The current admin API includes its existing URL identifier for update compatibility.
export type AdminCategoryApiRecord = AdminCategory & { slug: string };
export type AdminCategoryMutation = Omit<AdminCategoryApiRecord, "eventCount">;
