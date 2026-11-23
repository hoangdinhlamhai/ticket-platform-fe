import { useEffect, useMemo, useState } from "react";
import * as categoryApi from "../api/adminCategoryApi.ts";
import { AdminCategoryList } from "../components/AdminCategoryList.tsx";
import { CategoryDeleteDialog } from "../components/CategoryDeleteDialog.tsx";
import { CategoryFormDialog } from "../components/CategoryFormDialog.tsx";
import { categorySlug } from "../helpers/category-slug.ts";
import type {
  AdminCategory,
  AdminCategoryApiRecord,
} from "../types/admin-category.ts";

const PAGE_SIZE = 20;

function getErrorMessage(cause: unknown, fallback: string) {
  if (typeof cause === "object" && cause !== null && "response" in cause) {
    const response = cause.response;
    if (
      typeof response === "object" &&
      response !== null &&
      "data" in response
    ) {
      const data = response.data;
      if (typeof data === "object" && data !== null && "message" in data) {
        const message = data.message;
        if (typeof message === "string") return message;
        if (Array.isArray(message)) return message.join(" ");
      }
    }
  }
  return cause instanceof Error ? cause.message : fallback;
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-lg bg-paper-deep ${className}`}
    />
  );
}

function AdminCategoriesSkeleton() {
  return (
    <section
      className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none"
      role="status"
      aria-label="Đang tải danh mục"
    >
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div className="grid gap-3">
          <SkeletonBlock className="h-4 w-32" />
          <SkeletonBlock className="h-9 w-56" />
          <SkeletonBlock className="h-4 w-[min(28rem,75vw)]" />
        </div>
        <SkeletonBlock className="h-11 w-36" />
      </header>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((item) => (
          <article
            key={item}
            className="rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <SkeletonBlock className="h-4 w-36" />
              <SkeletonBlock className="size-9" />
            </div>
            <SkeletonBlock className="mb-0 mt-3 h-7 w-20" />
            <SkeletonBlock className="mb-0 mt-2 h-3 w-32" />
          </article>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="hidden sm:block">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-2 h-3 w-48" />
        </div>
        <SkeletonBlock className="h-11 w-full sm:w-80" />
      </div>
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <SkeletonBlock className="h-5 w-40" />
          <SkeletonBlock className="mt-2 h-3 w-56" />
        </div>
        <div className="overflow-x-hidden p-4">
          <div className="grid grid-cols-[28%_1fr_9rem_9rem] gap-4 border-b border-line bg-paper/70 px-3 py-3">
            {[0, 1, 2, 3].map((item) => (
              <SkeletonBlock key={item} className="h-3 w-full" />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid h-[4.25rem] grid-cols-[28%_1fr_9rem_9rem] items-center gap-4 border-b border-line px-3"
            >
              <SkeletonBlock className="h-3 w-4/5" />
              <SkeletonBlock className="h-4 w-3/5" />
              <SkeletonBlock className="ml-auto h-4 w-8" />
              <SkeletonBlock className="ml-auto h-9 w-24" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<
    readonly AdminCategoryApiRecord[]
  >([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const [editing, setEditing] = useState<
    AdminCategoryApiRecord | null | undefined
  >(undefined);
  const [deleting, setDeleting] = useState<AdminCategory | null>(null);
  const [working, setWorking] = useState(false);
  const [dialogError, setDialogError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function loadCategories() {
      setLoading(true);
      setError("");
      try {
        const response = await categoryApi.findCategories();
        if (active) setCategories(response.data.categories);
      } catch (cause) {
        if (active)
          setError(getErrorMessage(cause, "Không thể tải danh sách danh mục."));
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadCategories();
    return () => {
      active = false;
    };
  }, [retryKey]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("vi-VN");
    if (!normalizedQuery) return categories;
    return categories.filter((category) =>
      category.name.toLocaleLowerCase("vi-VN").includes(normalizedQuery),
    );
  }, [categories, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleCategories = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  const eventCount = categories.reduce(
    (sum, category) => sum + category.eventCount,
    0,
  );

  function openAdd() {
    setDialogError("");
    setEditing(null);
  }

  async function saveCategory(name: string) {
    if (working) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setDialogError("Vui lòng nhập tên danh mục.");
      return;
    }
    if (editing && trimmed === editing.name) {
      setEditing(undefined);
      setDialogError("");
      return;
    }
    setWorking(true);
    setDialogError("");
    try {
      if (editing) {
        const response = await categoryApi.updateCategory(
          editing.id,
          trimmed,
          editing.slug,
        );
        setCategories((current) =>
          current.map((category) =>
            category.id === editing.id
              ? { ...category, name: response.data.category.name }
              : category,
          ),
        );
        setNotice(`Đã cập nhật danh mục “${trimmed}”.`);
      } else {
        const response = await categoryApi.createCategory(
          trimmed,
          categorySlug(trimmed),
        );
        setCategories((current) =>
          [...current, { ...response.data.category, eventCount: 0 }].sort(
            (a, b) => a.name.localeCompare(b.name, "vi"),
          ),
        );
        setNotice(`Đã tạo danh mục “${trimmed}”.`);
      }
      setEditing(undefined);
    } catch (cause) {
      setDialogError(
        getErrorMessage(cause, "Không thể lưu danh mục. Vui lòng thử lại."),
      );
    } finally {
      setWorking(false);
    }
  }

  async function confirmDelete() {
    if (!deleting || deleting.eventCount > 0 || working) return;
    setWorking(true);
    setDialogError("");
    try {
      await categoryApi.deleteCategory(deleting.id);
      setCategories((current) =>
        current.filter((category) => category.id !== deleting.id),
      );
      setNotice(`Đã xóa danh mục “${deleting.name}”.`);
      setDeleting(null);
      setPage((current) =>
        Math.min(
          current,
          Math.max(1, Math.ceil((filtered.length - 1) / PAGE_SIZE)),
        ),
      );
    } catch (cause) {
      setDialogError(
        getErrorMessage(
          cause,
          "Không thể xóa danh mục. Có thể danh mục đang được sự kiện sử dụng.",
        ),
      );
    } finally {
      setWorking(false);
    }
  }

  if (loading && categories.length === 0 && !error)
    return <AdminCategoriesSkeleton />;

  const cards = [
    {
      label: "Tổng số danh mục",
      value: error ? "—" : categories.length,
      icon: "▦",
      tone: "text-pine",
      sub: "Danh mục trên nền tảng",
    },
    {
      label: "Sự kiện đang phân loại",
      value: error ? "—" : eventCount,
      icon: "◷",
      tone: "text-blue-deep",
      sub: "Tổng số sự kiện thuộc danh mục",
    },
  ];

  return (
    <section className="grid gap-5 animate-[transaction-enter_.2s_ease-out] motion-reduce:animate-none">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-ink-soft">
            Admin · Nội dung
          </p>
          <h1 className="mt-1 text-3xl font-extrabold">Danh mục</h1>
          <p className="mt-2 text-ink-soft">
            Quản lý các danh mục phân loại sự kiện trên nền tảng.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="min-h-11 rounded-lg bg-pine px-4 text-sm font-extrabold text-paper shadow-sm transition hover:bg-pine/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          + Thêm danh mục
        </button>
      </header>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <article
            key={card.label}
            className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="m-0 text-sm font-semibold text-ink-soft">
                {card.label}
              </p>
              <span
                aria-hidden="true"
                className={`grid size-9 place-items-center rounded-lg bg-paper-deep text-lg font-bold ${card.tone}`}
              >
                {card.icon}
              </span>
            </div>
            <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
              {typeof card.value === "number"
                ? card.value.toLocaleString("vi-VN")
                : card.value}
            </p>
            <p className="mb-0 mt-1 text-xs text-ink-soft">{card.sub}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="hidden sm:block">
          <h2 className="m-0 text-base font-extrabold text-pine">
            Tìm danh mục
          </h2>
          <p className="mb-0 mt-1 text-xs text-ink-soft">
            Tìm kiếm theo tên danh mục
          </p>
        </div>
        <label className="text-xs font-bold text-ink-soft">
          Tìm kiếm
          <span className="mt-1 flex min-h-11 w-full rounded-lg border border-line bg-paper focus-within:border-pine sm:w-80">
            <input
              className="min-w-0 flex-1 rounded-lg bg-transparent px-3 text-sm font-normal text-ink outline-none"
              placeholder="Tên danh mục"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
            {query && (
              <button
                className="px-3 text-lg text-ink-soft hover:text-pine"
                type="button"
                aria-label="Xóa nội dung tìm kiếm"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
              >
                ×
              </button>
            )}
          </span>
        </label>
      </div>
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-success/40 bg-mint p-4 text-sm text-success"
        >
          {notice}
          <button
            type="button"
            className="ml-3 font-bold underline"
            onClick={() => setNotice("")}
          >
            Đóng
          </button>
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          <span>{error}</span>
          <button
            className="min-h-10 rounded-lg border border-error/30 px-4 font-bold"
            type="button"
            onClick={() => setRetryKey((key) => key + 1)}
          >
            Thử tải lại
          </button>
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-4 sm:px-5">
          <div>
            <h2 className="m-0 text-base font-extrabold text-pine">
              Danh sách danh mục
            </h2>
            <p className="mb-0 mt-1 text-xs text-ink-soft">
              {filtered.length.toLocaleString("vi-VN")} kết quả · Trang {page} /{" "}
              {pageCount}
            </p>
          </div>
        </div>
        {loading ? (
          <div
            className="grid gap-3 p-4"
            role="status"
            aria-label="Đang làm mới danh mục"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <SkeletonBlock key={index} className="h-14" />
            ))}
          </div>
        ) : error ? null : (
          <AdminCategoryList
            categories={visibleCategories}
            hasCategories={categories.length > 0}
            onAdd={openAdd}
            onEdit={(category) => {
              setDialogError("");
              const record = categories.find((item) => item.id === category.id);
              if (record) setEditing(record);
            }}
            onDelete={(category) => {
              setDialogError("");
              setDeleting(category);
            }}
            onResetSearch={() => {
              setQuery("");
              setPage(1);
            }}
          />
        )}
      </div>
      {!loading && !error && filtered.length > PAGE_SIZE && (
        <nav
          aria-label="Phân trang danh mục"
          className="flex items-center justify-between text-sm text-ink-soft"
        >
          <span>
            Trang {page} / {pageCount}
          </span>
          <div className="flex gap-2">
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold transition hover:bg-paper-deep disabled:opacity-50"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              type="button"
            >
              Trước
            </button>
            <button
              className="min-h-10 rounded-lg border border-line px-3 font-bold transition hover:bg-paper-deep disabled:opacity-50"
              disabled={page >= pageCount}
              onClick={() => setPage((current) => current + 1)}
              type="button"
            >
              Tiếp
            </button>
          </div>
        </nav>
      )}
      {editing !== undefined && (
        <CategoryFormDialog
          key={editing?.id ?? "new-category"}
          category={editing}
          saving={working}
          error={dialogError}
          onCancel={() => {
            if (!working) {
              setEditing(undefined);
              setDialogError("");
            }
          }}
          onSubmit={(name) => void saveCategory(name)}
        />
      )}
      {deleting && (
        <CategoryDeleteDialog
          category={deleting}
          deleting={working}
          error={dialogError}
          onCancel={() => {
            if (!working) {
              setDeleting(null);
              setDialogError("");
            }
          }}
          onConfirm={() => void confirmDelete()}
        />
      )}
    </section>
  );
}
