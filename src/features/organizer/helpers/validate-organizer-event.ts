import type { OrganizerEventInput } from "../types/organizer-event.ts";

export type OrganizerEventField =
  keyof OrganizerEventInput | "provinceId" | "wardId" | "street";
export type OrganizerEventErrors = Partial<Record<OrganizerEventField, string>>;

const fieldOrder: readonly OrganizerEventField[] = [
  "title",
  "startAt",
  "endAt",
  "venue",
  "city",
];

export function validateOrganizerEvent(input: OrganizerEventInput) {
  const errors: OrganizerEventErrors = {};
  if (!input.title.trim()) errors.title = "Nhập tên sự kiện.";
  if (!input.startAt) errors.startAt = "Chọn thời gian bắt đầu.";
  if (!input.endAt) errors.endAt = "Chọn thời gian kết thúc.";
  if (!input.provinceId && !input.venue?.trim())
    errors.venue = "Nhập địa điểm tổ chức.";
  if (!input.provinceId && !input.city?.trim())
    errors.city = "Nhập tỉnh/thành phố.";

  if (input.startAt && input.endAt) {
    const startAt = Date.parse(input.startAt);
    const endAt = Date.parse(input.endAt);
    if (!Number.isFinite(startAt) || !Number.isFinite(endAt))
      errors.startAt = "Thời gian sự kiện không hợp lệ.";
    else if (startAt >= endAt)
      errors.endAt = "Thời gian kết thúc phải sau thời gian bắt đầu.";
  }

  return {
    errors,
    firstInvalidField: fieldOrder.find((field) => errors[field]) ?? null,
  };
}
