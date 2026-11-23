import axiosClient from "../../../../api/axiosClient.ts";
import type {
  AdminCategoryApiRecord,
  AdminCategoryMutation,
} from "../types/admin-category.ts";

export const findCategories = () =>
  axiosClient.get<{ categories: readonly AdminCategoryApiRecord[] }>(
    "/admin/categories",
  );

export const createCategory = (name: string, slug: string) =>
  axiosClient.post<{ category: AdminCategoryMutation }>("/admin/categories", {
    name,
    slug,
  });

export const updateCategory = (id: string, name: string, slug: string) =>
  axiosClient.patch<{ category: AdminCategoryMutation }>(
    `/admin/categories/${encodeURIComponent(id)}`,
    { name, slug },
  );

export const deleteCategory = (id: string) =>
  axiosClient.delete<{ id: string }>(
    `/admin/categories/${encodeURIComponent(id)}`,
  );
