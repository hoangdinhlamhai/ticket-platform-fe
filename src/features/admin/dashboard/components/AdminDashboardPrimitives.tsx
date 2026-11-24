import type { ReactNode } from "react";
import type { SectionState } from "../types/admin-dashboard.ts";

export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-5">
        <div>
          <h2 className="m-0 text-base font-extrabold text-pine">{title}</h2>
          {subtitle && (
            <p className="mb-0 mt-1 text-xs text-ink-soft">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function LoadingRows({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3" role="status" aria-label="Đang tải dữ liệu">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg border border-line p-3"
        >
          <span className="size-10 shrink-0 animate-pulse rounded-lg bg-paper-deep" />
          <span className="grid flex-1 gap-2">
            <span className="h-3 w-2/5 animate-pulse rounded bg-paper-deep" />
            <span className="h-3 w-3/5 animate-pulse rounded bg-paper-deep" />
          </span>
          <span className="h-5 w-16 animate-pulse rounded bg-paper-deep" />
        </div>
      ))}
    </div>
  );
}

export function ErrorBox({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error"
    >
      <p className="m-0">{message}</p>
      <button
        type="button"
        onClick={retry}
        className="mt-2 min-h-9 rounded border border-error/30 px-3 font-bold"
      >
        Thử tải lại
      </button>
    </div>
  );
}

export function Section<T>({
  state,
  retry,
  children,
}: {
  state: SectionState<T>;
  retry: () => void;
  children: (data: T) => ReactNode;
}) {
  if (state.loading) return <LoadingRows />;
  if (state.error) return <ErrorBox message={state.error} retry={retry} />;
  return state.data ? (
    children(state.data)
  ) : (
    <p className="rounded-lg border border-dashed border-line p-5 text-sm text-ink-soft">
      Chưa có dữ liệu.
    </p>
  );
}
