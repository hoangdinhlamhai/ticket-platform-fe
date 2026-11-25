export function ResaleListingDetailSkeleton() {
  return (
    <section
      className="grid gap-6"
      aria-busy="true"
      aria-label="Đang tải tin đăng"
    >
      <div className="grid gap-3">
        <span className="h-4 w-32 animate-pulse rounded bg-paper-deep" />
        <span className="h-10 w-2/3 animate-pulse rounded bg-paper-deep" />
      </div>
      <div className="grid gap-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <span className="h-6 w-48 animate-pulse rounded bg-paper-deep" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="grid gap-2" key={index}>
              <span className="h-3 w-20 animate-pulse rounded bg-paper-deep" />
              <span className="h-5 w-4/5 animate-pulse rounded bg-paper-deep" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
