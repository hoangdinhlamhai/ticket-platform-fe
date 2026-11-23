import { useRef } from "react";
import { useCategoryDialog } from "../hooks/useCategoryDialog.ts";
import type { AdminCategory } from "../types/admin-category.ts";

type Props = {
  category: AdminCategory;
  deleting: boolean;
  error: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function CategoryDeleteDialog({
  category,
  deleting,
  error,
  onCancel,
  onConfirm,
}: Props) {
  const panelRef = useRef<HTMLElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  useCategoryDialog(panelRef, cancelRef, onCancel, deleting);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-pine/60 p-4">
      <button
        className="absolute inset-0 h-full w-full"
        type="button"
        aria-label="Đóng hộp thoại xác nhận"
        disabled={deleting}
        onClick={onCancel}
      />
      <section
        ref={panelRef}
        className="relative w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-2xl sm:p-6"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="category-delete-title"
      >
        <h2
          id="category-delete-title"
          className="m-0 text-xl font-extrabold text-pine"
        >
          Xóa danh mục?
        </h2>
        <p className="mb-0 mt-3 text-sm leading-6 text-ink-soft">
          Bạn có chắc muốn xóa danh mục{" "}
          <strong className="text-ink">{category.name}</strong>?
          {category.eventCount > 0 && (
            <span className="mt-2 block font-bold text-error">
              Danh mục đang được {category.eventCount.toLocaleString("vi-VN")}{" "}
              sự kiện sử dụng và không thể xóa.
            </span>
          )}
        </p>
        {error && (
          <p className="mt-3 text-sm font-bold text-error" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelRef}
            className="min-h-11 rounded-lg border border-line px-4 text-sm font-bold text-ink-soft transition hover:bg-paper-deep disabled:opacity-50"
            type="button"
            disabled={deleting}
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            className="min-h-11 rounded-lg bg-error px-4 text-sm font-extrabold text-paper transition hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            disabled={deleting || category.eventCount > 0}
            onClick={onConfirm}
          >
            {deleting ? "Đang xóa…" : "Xóa danh mục"}
          </button>
        </div>
      </section>
    </div>
  );
}
