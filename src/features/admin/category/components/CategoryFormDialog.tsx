import { useRef, useState, type FormEvent } from "react";
import { useCategoryDialog } from "../hooks/useCategoryDialog.ts";
import type { AdminCategory } from "../types/admin-category.ts";

type Props = {
  category: AdminCategory | null;
  saving: boolean;
  error: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
};

export function CategoryFormDialog({
  category,
  saving,
  error,
  onCancel,
  onSubmit,
}: Props) {
  const [name, setName] = useState(category?.name ?? "");
  const [validationError, setValidationError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const title = category ? "Chỉnh sửa danh mục" : "Thêm danh mục";

  useCategoryDialog(panelRef, inputRef, onCancel, saving);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setValidationError("Vui lòng nhập tên danh mục.");
      inputRef.current?.focus();
      return;
    }
    setValidationError("");
    onSubmit(trimmed);
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-pine/60 p-4">
      <button
        className="absolute inset-0 h-full w-full"
        type="button"
        aria-label="Đóng hộp thoại"
        disabled={saving}
        onClick={onCancel}
      />
      <section
        ref={panelRef}
        className="relative w-full max-w-lg rounded-xl border border-line bg-surface p-5 shadow-2xl sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-dialog-title"
      >
        <h2
          id="category-dialog-title"
          className="m-0 text-xl font-extrabold text-pine"
        >
          {title}
        </h2>
        <p className="mb-5 mt-2 text-sm text-ink-soft">
          {category
            ? "Cập nhật tên danh mục sự kiện."
            : "Nhập tên cho danh mục sự kiện mới."}
        </p>
        <form onSubmit={submit}>
          <label
            className="block text-sm font-bold text-ink-soft"
            htmlFor="category-name"
          >
            Tên danh mục
          </label>
          <input
            ref={inputRef}
            id="category-name"
            className="mt-1 min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-sm font-normal text-ink focus:border-pine focus:outline-none"
            value={name}
            maxLength={120}
            disabled={saving}
            aria-invalid={Boolean(error || validationError)}
            aria-describedby={
              error || validationError ? "category-form-error" : undefined
            }
            onChange={(event) => {
              setName(event.target.value);
              setValidationError("");
            }}
          />
          {(error || validationError) && (
            <p
              id="category-form-error"
              className="mb-0 mt-2 text-sm font-bold text-error"
              role="alert"
            >
              {validationError || error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-3">
            <button
              className="min-h-11 rounded-lg border border-line px-4 text-sm font-bold text-ink-soft transition hover:bg-paper-deep disabled:opacity-50"
              type="button"
              disabled={saving}
              onClick={onCancel}
            >
              Hủy
            </button>
            <button
              className="min-h-11 rounded-lg bg-pine px-4 text-sm font-extrabold text-paper transition hover:bg-pine/90 disabled:cursor-wait disabled:opacity-60"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu…"
                : category
                  ? "Lưu thay đổi"
                  : "Tạo danh mục"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
