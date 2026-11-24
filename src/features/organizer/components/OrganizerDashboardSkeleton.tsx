function Skeleton({ className = "" }: { readonly className?: string }) {
  return (
    <span
      className={`block animate-pulse rounded bg-paper-deep ${className}`}
    />
  );
}

function SectionSkeleton({ rows = 3 }: { readonly rows?: number }) {
  return (
    <section className="rounded-xl border border-line bg-surface p-5 shadow-sm">
      <Skeleton className="h-5 w-44" />
      <div className="mt-5 grid gap-3">
        {Array.from({ length: rows }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-lg border border-line p-3"
          >
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="grid min-w-0 flex-1 gap-2">
              <Skeleton className="h-4 w-2/5" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-2 w-full" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function OrganizerDashboardSkeleton() {
  return (
    <div
      className="mx-auto grid max-w-7xl gap-6"
      role="status"
      aria-label="Đang tải tổng quan Organizer"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-3">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-10 w-56" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-12 w-36 rounded-md" />
      </header>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="min-h-36 rounded-xl border border-line bg-surface p-5 shadow-sm"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="size-9 rounded-lg" />
            </div>
            <Skeleton className="mt-5 h-8 w-32" />
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        ))}
      </div>
      <SectionSkeleton rows={5} />
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionSkeleton rows={3} />
        <SectionSkeleton rows={3} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionSkeleton rows={4} />
        <SectionSkeleton rows={4} />
      </div>
    </div>
  );
}
