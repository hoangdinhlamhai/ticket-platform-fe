export function AdminOrderDetailSkeleton() {
  return (
    <section
      className="grid gap-5"
      role="status"
      aria-label="Đang tải chi tiết đơn hàng"
      aria-busy="true"
    >
      <span className="admin-loading-skeleton h-11 w-44 rounded-lg" />
      <div className="grid gap-2">
        <span className="admin-loading-skeleton h-4 w-36 rounded" />
        <span className="admin-loading-skeleton h-7 w-80 max-w-full rounded" />
        <span className="admin-loading-skeleton h-4 w-52 rounded" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((item) => (
          <div
            key={item}
            className="grid gap-3 rounded-xl border border-line bg-surface p-5"
          >
            <span className="admin-loading-skeleton h-5 w-40 rounded" />
            <span className="admin-loading-skeleton h-5 w-52 max-w-full rounded" />
            <span className="admin-loading-skeleton h-4 w-64 max-w-full rounded" />
          </div>
        ))}
      </div>
      {[0, 1, 2].map((section) => (
        <div
          key={section}
          className="grid gap-4 rounded-xl border border-line bg-surface p-5"
        >
          <span className="admin-loading-skeleton h-5 w-44 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <span
                key={item}
                className="admin-loading-skeleton h-10 rounded"
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
