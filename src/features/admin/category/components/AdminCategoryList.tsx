import type { AdminCategory } from "../types/admin-category.ts";

type Props = {
  categories: readonly AdminCategory[];
  hasCategories: boolean;
  onEdit: (category: AdminCategory) => void;
  onDelete: (category: AdminCategory) => void;
  onAdd: () => void;
  onResetSearch: () => void;
};

export function AdminCategoryList({
  categories,
  hasCategories,
  onEdit,
  onDelete,
  onAdd,
  onResetSearch,
}: Props) {
  if (!categories.length) {
    return (
      <div className="grid min-h-64 place-items-center p-8 text-center">
        <div>
          <span
            aria-hidden="true"
            className="mx-auto grid size-12 place-items-center rounded-full bg-paper-deep text-xl text-ink-soft"
          >
            {hasCategories ? "⌕" : "+"}
          </span>
          <h3 className="mb-0 mt-3 text-base font-extrabold text-pine">
            {hasCategories ? "Không tìm thấy danh mục" : "Chưa có danh mục nào"}
          </h3>
          <p className="mb-0 mt-1 text-sm text-ink-soft">
            {hasCategories
              ? "Thử thay đổi từ khóa tìm kiếm."
              : "Tạo danh mục để phân loại sự kiện trên nền tảng."}
          </p>
          {hasCategories ? (
            <button
              className="mt-4 min-h-10 rounded-lg border border-line px-4 text-sm font-bold text-pine transition hover:bg-paper-deep"
              type="button"
              onClick={onResetSearch}
            >
              Xóa từ khóa
            </button>
          ) : (
            <button
              className="mt-4 min-h-10 rounded-lg bg-pine px-4 text-sm font-extrabold text-paper transition hover:bg-pine/90"
              type="button"
              onClick={onAdd}
            >
              Thêm danh mục
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-paper/70 text-xs uppercase tracking-wide text-ink-soft">
          <tr>
            <th className="w-[28%] px-4 py-3 font-bold">ID</th>
            <th className="px-4 py-3 font-bold">Tên danh mục</th>
            <th className="w-36 px-4 py-3 text-right font-bold">Số sự kiện</th>
            <th className="w-36 px-4 py-3 text-right font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <tr
              key={category.id}
              className="border-t border-line transition-colors hover:bg-paper/40"
            >
              <td className="px-4 py-4">
                <span
                  className="block max-w-52 truncate font-mono text-xs text-ink-soft"
                  title={category.id}
                >
                  {category.id}
                </span>
              </td>
              <td className="px-4 py-4">
                <strong className="block truncate text-ink">
                  {category.name}
                </strong>
              </td>
              <td className="px-4 py-4 text-right tabular-nums text-ink-soft">
                {category.eventCount.toLocaleString("vi-VN")}
              </td>
              <td className="px-4 py-4 text-right">
                <details className="relative inline-block text-left">
                  <summary className="min-h-9 cursor-pointer list-none rounded-lg border border-line px-3 py-2 text-center font-bold text-pine transition hover:bg-paper-deep">
                    Thao tác
                  </summary>
                  <div className="absolute right-0 z-10 mt-1 grid min-w-36 gap-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
                    <button
                      type="button"
                      className="rounded px-3 py-2 text-left text-sm font-bold transition hover:bg-paper-deep"
                      onClick={() => onEdit(category)}
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      title={
                        category.eventCount > 0
                          ? "Không thể xóa danh mục đang được sự kiện sử dụng"
                          : undefined
                      }
                      className="rounded px-3 py-2 text-left text-sm font-bold text-error transition hover:bg-error/10"
                      onClick={() => onDelete(category)}
                    >
                      Xóa
                    </button>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
