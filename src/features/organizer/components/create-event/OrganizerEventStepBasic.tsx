import { OrganizerEventBasicFields } from "./OrganizerEventBasicFields.tsx";
import type { OrganizerEventErrors } from "../../helpers/validate-organizer-event.ts";
import type { OrganizerEventFormValues } from "../../hooks/use-organizer-event-form.ts";
import type { ChangeEvent } from "react";

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
  onFieldChange: (field: string, value: string) => void;
};

export function OrganizerEventStepBasic({
  disabled,
  errors,
  onChange,
  registerField,
  values,
  onFieldChange,
}: Props) {
  return (
    <OrganizerEventBasicFields
      disabled={disabled}
      errors={errors}
      onChange={onChange}
      registerField={registerField}
      values={values}
      onFieldChange={onFieldChange}
    />
  );
}
