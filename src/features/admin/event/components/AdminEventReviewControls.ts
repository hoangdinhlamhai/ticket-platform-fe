import { adminStatusLabel } from '../../helpers/admin-display.ts';
import { formatAdminMoney } from '../../helpers/admin-display.ts';
import type { AdminEvent } from '../../types/admin-records.ts';

const statusOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: adminStatusLabel(value) }));

export const eventReviewStatusOptions = statusOptions([
  'pending_review',
  'approved',
  'changes_requested',
  'rejected',
]);

export function ticketPriceRange(event: AdminEvent) {
  const prices = event.ticketTiers.map((tier) => tier.price);
  if (!prices.length) return '—';
  const minimum = Math.min(...prices);
  const maximum = Math.max(...prices);
  return minimum === maximum
    ? formatAdminMoney(minimum)
    : `${formatAdminMoney(minimum)} – ${formatAdminMoney(maximum)}`;
}
