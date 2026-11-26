export function ResaleListingDetailSkeleton() {
  return (
    <section
      className="grid gap-6"
      aria-busy="true"
      aria-label="Đang tải tin đăng"
    >
      <span className="admin-loading-skeleton h-11 w-44 rounded-lg" />
      <div className="grid gap-3">
        <span className="h-4 w-32 admin-loading-skeleton rounded" />
        <span className="h-10 w-2/3 admin-loading-skeleton rounded" />
      </div>
      <div className="grid gap-6 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <span className="h-6 w-48 admin-loading-skeleton rounded" />
        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="grid gap-2" key={index}>
              <span className="h-3 w-20 admin-loading-skeleton rounded" />
              <span className="h-5 w-4/5 admin-loading-skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
