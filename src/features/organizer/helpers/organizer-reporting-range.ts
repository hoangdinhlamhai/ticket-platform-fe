import { isoToDateTimeLocal, dateTimeLocalToIso } from './organizer-datetime-local.ts'
import type { OrganizerReportRange, OrganizerReportRangeInput } from '../../events/api/event-api.ts'

export type ReportingLocalInputs = { readonly from: string; readonly to: string }

export type ReportingRangeResult =
  | { readonly ok: true; readonly range: OrganizerReportRangeInput }
  | { readonly ok: false; readonly error: string }

// Validation is intentionally strict: the picker prevents out-of-window values with
// min/max, and this helper rejects any range that is reversed, degenerate, invalid,
// or outside the sale window rather than silently clamping the organizer's intent.
export function normalizeReportingRange(
  input: OrganizerReportRangeInput,
  saleWindow: OrganizerReportRange,
): ReportingRangeResult {
  const from = Date.parse(input.from)
  const to = Date.parse(input.to)
  const windowStart = Date.parse(saleWindow.startAt)
  const windowEnd = Date.parse(saleWindow.endAt)

  if (!Number.isFinite(from) || !Number.isFinite(to)) {
    return { ok: false, error: 'Chọn khoảng thời gian hợp lệ.' }
  }
  if (Number.isFinite(windowStart) && from < windowStart) {
    return { ok: false, error: 'Thời gian bắt đầu không được trước khi mở bán.' }
  }
  if (Number.isFinite(windowEnd) && to > windowEnd) {
    return { ok: false, error: 'Thời gian kết thúc không được sau khi đóng bán.' }
  }
  if (from >= to) {
    return { ok: false, error: 'Thời gian bắt đầu phải trước thời gian kết thúc.' }
  }
  return { ok: true, range: { from: input.from, to: input.to } }
}

// The reporting picker uses datetime-local with step=1 (second precision). The shared
// isoToDateTimeLocal helper always renders a .mmm milliseconds component, which some
// browsers reject or mis-render at second precision, so trim it to seconds here.
function toSecondPrecision(local: string): string {
  return local.replace(/(\d{2}:\d{2}:\d{2})\.\d{1,3}$/, '$1')
}

// datetime-local inputs are wall-clock strings with no zone; convert through the
// shared helpers so the API always receives a zone-correct ISO instant.
export function reportingRangeToLocalInputs(range: OrganizerReportRangeInput): ReportingLocalInputs {
  return { from: toSecondPrecision(isoToDateTimeLocal(range.from)), to: toSecondPrecision(isoToDateTimeLocal(range.to)) }
}

export function localInputsToReportingRange(inputs: ReportingLocalInputs): OrganizerReportRangeInput | null {
  const from = dateTimeLocalToIso(inputs.from)
  const to = dateTimeLocalToIso(inputs.to)
  if (!from || !to) return null
  return { from, to }
}
