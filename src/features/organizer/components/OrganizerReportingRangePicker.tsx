import { useId, useState } from "react";
import type {
  OrganizerReportRange,
  OrganizerReportRangeInput,
} from "../../../types/event.ts";
import {
  localInputsToReportingRange,
  normalizeReportingRange,
  reportingRangeToLocalInputs,
} from "../helpers/organizer-reporting-range.ts";

type Props = {
  saleWindow: OrganizerReportRange;
  value: OrganizerReportRangeInput;
  loading?: boolean;
  onApply: (range: OrganizerReportRangeInput) => void;
};

const inputClass =
  "min-h-11 w-full rounded-md border border-line bg-paper px-3 text-base outline-none disabled:bg-paper-deep";

export function OrganizerReportingRangePicker({
  saleWindow,
  value,
  loading = false,
  onApply,
}: Props) {
  const fromId = useId();
  const toId = useId();
  const [local, setLocal] = useState(() => reportingRangeToLocalInputs(value));
  const [appliedKey, setAppliedKey] = useState(`${value.from}|${value.to}`);

  // Keep the visible inputs in sync when the applied range changes (initial load or an
  // external reset) using React's render-time adjustment pattern, so the organizer's
  // in-progress edits stay untouched without a setState-in-effect cascade.
  const nextKey = `${value.from}|${value.to}`;
  if (nextKey !== appliedKey) {
    setAppliedKey(nextKey);
    setLocal(reportingRangeToLocalInputs(value));
  }

  const bounds = reportingRangeToLocalInputs({
    from: saleWindow.startAt,
    to: saleWindow.endAt,
  });
  const min = bounds.from;
  const max = bounds.to;
  const parsed = localInputsToReportingRange(local);
  const validation = parsed
    ? normalizeReportingRange(parsed, saleWindow)
    : null;
  const error =
    local.from && local.to
      ? validation && !validation.ok
        ? validation.error
        : null
      : "Chọn khoảng thời gian hợp lệ.";
  const canApply = !loading && validation?.ok === true;

  const apply = () => {
    if (validation?.ok) onApply(validation.range);
  };

  return (
    <section className="rounded-lg border border-line bg-surface p-5">
      <h2 className="m-0 text-lg font-extrabold">Khoảng thời gian báo cáo</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Giới hạn trong thời gian mở bán vé của sự kiện.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="block text-sm font-bold" htmlFor={fromId}>
          Từ
          <input
            id={fromId}
            type="datetime-local"
            className={inputClass}
            min={min}
            max={max}
            step={1}
            value={local.from}
            disabled={loading}
            onChange={(changeEvent) =>
              setLocal((current) => ({
                ...current,
                from: changeEvent.target.value,
              }))
            }
          />
        </label>
        <label className="block text-sm font-bold" htmlFor={toId}>
          Đến
          <input
            id={toId}
            type="datetime-local"
            className={inputClass}
            min={min}
            max={max}
            step={1}
            value={local.to}
            disabled={loading}
            onChange={(changeEvent) =>
              setLocal((current) => ({
                ...current,
                to: changeEvent.target.value,
              }))
            }
          />
        </label>
        <button
          type="button"
          className="min-h-11 rounded-md bg-blue px-5 font-extrabold text-paper disabled:opacity-50"
          disabled={!canApply}
          onClick={apply}
        >
          {loading ? "Đang tải…" : "Áp dụng"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm font-bold text-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
