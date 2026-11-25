import type { ReactNode } from "react";

export type ResaleStatCard = {
  readonly label: string;
  readonly value: number | null;
  readonly icon: ReactNode;
  readonly tone: string;
  readonly sub: string;
};

export function ResaleStatsCards({
  cards,
  loading,
}: {
  readonly cards: readonly ResaleStatCard[];
  readonly loading: boolean;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-3 xl:grid-cols-4"
      aria-busy={loading}
      aria-label="Thống kê resale"
    >
      {cards.map((card) => (
        <article
          key={card.label}
          className="group rounded-xl border border-line bg-surface p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
        >
          <div className="flex items-start justify-between gap-2">
            {loading ? (
              <>
                <span className="h-4 w-28 animate-pulse rounded bg-paper-deep" />
                <span className="size-9 animate-pulse rounded-lg bg-paper-deep" />
              </>
            ) : (
              <>
                <p className="m-0 text-sm font-semibold text-ink-soft">
                  {card.label}
                </p>
                <span
                  aria-hidden="true"
                  className={`grid size-9 place-items-center rounded-lg bg-paper-deep ${card.tone}`}
                >
                  {card.icon}
                </span>
              </>
            )}
          </div>
          {loading ? (
            <span
              className="mt-3 block h-8 w-20 animate-pulse rounded bg-paper-deep"
              role="status"
              aria-label={`Đang tải ${card.label}`}
            />
          ) : (
            <p className={`mb-0 mt-3 text-2xl font-extrabold ${card.tone}`}>
              {card.value?.toLocaleString("vi-VN") ?? "—"}
            </p>
          )}
          {loading ? (
            <span className="mb-0 mt-2 block h-3 w-32 animate-pulse rounded bg-paper-deep" />
          ) : (
            <p className="mb-0 mt-1 text-xs text-ink-soft">{card.sub}</p>
          )}
        </article>
      ))}
    </div>
  );
}
