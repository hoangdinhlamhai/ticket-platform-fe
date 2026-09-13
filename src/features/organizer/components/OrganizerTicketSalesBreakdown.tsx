import { OrganizerAccessibleBarChart } from './OrganizerAccessibleBarChart.tsx'
import type { OrganizerAnalyticsBar } from '../helpers/select-organizer-metrics.ts'

type Props = { ticketTiers: readonly OrganizerAnalyticsBar[] }

export function OrganizerTicketSalesBreakdown({ ticketTiers }: Props) {
  return <OrganizerAccessibleBarChart title="Vé đã bán theo hạng" unit="Số vé đã bán trên sức chứa" values={ticketTiers} />
}
