import type { ChangeEvent } from "react";
import { OrganizerEventScheduleFields } from "./OrganizerEventScheduleFields.tsx";
import { OrganizerEventSeatMapSection } from "./OrganizerEventSeatMapSection.tsx";
import { OrganizerEventTicketTiersSection } from "./OrganizerEventTicketTiersSection.tsx";
import type { OrganizerEventErrors } from "../../helpers/validate-organizer-event.ts";
import type { OrganizerTicketTierDraft } from "../../helpers/validate-organizer-ticket-tier.ts";
import type { OrganizerEventFormValues } from "../../hooks/use-organizer-event-form.ts";
import type { SeatMap } from "../../../seat-map/types/seat-map.ts";

type Props = {
  disabled: boolean;
  errors: OrganizerEventErrors;
  onChange: (
    event: ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void;
  registerField: (
    field: string,
  ) => (node: HTMLInputElement | HTMLSelectElement | null) => void;
  values: OrganizerEventFormValues;
  eventId?: string;
  seatMap: SeatMap | null;
  seatMapLoading: boolean;
  seatMapError: string;
  seatMapTiers: readonly { id: string; name: string; price: number }[];
  onImageChange: (value: string) => void;
  onImageFileChange?: (file: File) => void;
  onMapChange: (map: SeatMap) => void;
  tiers: readonly OrganizerTicketTierDraft[];
  tierMessage: string;
  onSaveTier: (
    draft: OrganizerTicketTierDraft,
    editingIndex: number | null,
  ) => void;
  onRemoveTier: (index: number) => void;
};

export function OrganizerEventStepSchedule({
  disabled,
  errors,
  onChange,
  registerField,
  values,
  eventId,
  seatMap,
  seatMapLoading,
  seatMapError,
  seatMapTiers,
  onImageChange,
  onImageFileChange,
  onMapChange,
  tiers,
  tierMessage,
  onSaveTier,
  onRemoveTier,
}: Props) {
  return (
    <>
      <OrganizerEventScheduleFields
        {...{ disabled, errors, onChange, registerField, values }}
      />
      <fieldset disabled={disabled} className="mt-6 space-y-4">
        <OrganizerEventSeatMapSection
          eventId={eventId}
          initialImage={values.seatingChartImage}
          loading={seatMapLoading}
          error={seatMapError}
          seatMap={seatMap}
          ticketTiers={seatMapTiers}
          onImageChange={onImageChange}
          onImageFileChange={onImageFileChange}
          onMapChange={onMapChange}
        />
        <OrganizerEventTicketTiersSection
          tiers={tiers}
          startAt={values.startAt}
          endAt={values.endAt}
          message={tierMessage}
          onSave={onSaveTier}
          onRemove={onRemoveTier}
        />
      </fieldset>
    </>
  );
}
