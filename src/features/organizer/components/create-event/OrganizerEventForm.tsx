import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import { OrganizerEventBasicFields } from "./OrganizerEventBasicFields.tsx";
import { OrganizerEventScheduleFields } from "./OrganizerEventScheduleFields.tsx";
import { OrganizerEventSeatMapSection } from "./OrganizerEventSeatMapSection.tsx";
import { OrganizerEventTicketTiersSection } from "./OrganizerEventTicketTiersSection.tsx";
import { OrganizerEventStepConfirmation } from "./OrganizerEventStepConfirmation.tsx";
import { OrganizerEventStepFinance } from "./OrganizerEventStepFinance.tsx";
import { OrganizerEventFormLayout } from "./OrganizerEventFormLayout.tsx";

import { useOrganizerEventForm } from "../../hooks/use-organizer-event-form.ts";
import {
  validateOrganizerTicketTier,
  type OrganizerTicketTierDraft,
} from "../../helpers/validate-organizer-ticket-tier.ts";
import type {
  OrganizerEvent,
  OrganizerEventFinance,
  OrganizerEventInput,
} from "../../types/organizer-event.ts";
import type { OrganizerTicketTier } from "../../types/organizer-commerce.ts";
import { findOwnedSeatMap } from "../../api/organizerEventApi.ts";
import type { SeatMap } from "../../../seat-map/types/seat-map.ts";

export type OrganizerEventFormSave = {
  readonly initialTicketTiers?: readonly OrganizerTicketTierDraft[];
  readonly finance?: OrganizerEventFinance;
  readonly input: OrganizerEventInput;
  readonly seatMap?: SeatMap;
  readonly seatMapExists?: boolean;
  readonly ticketTierKeys?: readonly string[];
};

type Props = {
  event?: OrganizerEvent;
  finance?: OrganizerEventFinance;
  locked?: boolean;
  saving?: boolean;
  error?: string | null;
  onCancel?: () => void;
  onDirtyChange?: (hasUnsavedChanges: boolean) => void;
  onSave: (value: OrganizerEventFormSave) => boolean | Promise<boolean>;
  submitLabel: string;
  wizard?: boolean;
  availableTicketTiers?: readonly OrganizerTicketTier[];
  activeSection?: number;
};

export function OrganizerEventForm({
  event,
  finance,
  locked = false,
  saving = false,
  error = null,
  onCancel,
  onDirtyChange,
  onSave,
  submitLabel,
  wizard = false,
  availableTicketTiers = [],
  activeSection,
}: Props) {
  const form = useOrganizerEventForm(event, { onDirtyChange, finance });
  const [step, setStep] = useState(0);
  const [tierMessage, setTierMessage] = useState("");
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [seatMapExists, setSeatMapExists] = useState(false);
  const [seatMapLoading, setSeatMapLoading] = useState(Boolean(event?.id));
  const [seatMapError, setSeatMapError] = useState("");
  const ignoreNextSeatMapChange = useRef(true);
  const [tierKeys, setTierKeys] = useState<string[]>(() =>
    form.values.tiers.map(() => crypto.randomUUID()),
  );
  const tiers = form.values.tiers;
  const seatEditorTiers = tiers.length
    ? tiers.map((tier, index) => ({
        id: tierKeys[index] ?? `ticket-tier-${index}`,
        name: tier.name,
        price: tier.price,
      }))
    : availableTicketTiers.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
      }));
  const handleSeatMapChange = useCallback(
    (nextMap: SeatMap) => {
      setSeatMap(nextMap);
      if (ignoreNextSeatMapChange.current) {
        ignoreNextSeatMapChange.current = false;
        return;
      }
      onDirtyChange?.(true);
    },
    [onDirtyChange],
  );

  useEffect(() => {
    if (!event?.id) return;
    let active = true;
    const loadSeatMap = async () => {
      setSeatMapLoading(true);
      setSeatMapError("");
      try {
        const { data } = await findOwnedSeatMap(event.id);
        if (!active) return;
        ignoreNextSeatMapChange.current = true;
        setSeatMap(data.seatMap);
        setSeatMapExists(true);
      } catch (error: unknown) {
        if (!active) return;
        ignoreNextSeatMapChange.current = true;
        setSeatMap(null);
        setSeatMapExists(false);
        if (!axios.isAxiosError(error) || error.response?.status !== 404) {
          setSeatMapError("Không thể tải sơ đồ ghế của sự kiện.");
        }
      } finally {
        if (active) setSeatMapLoading(false);
      }
    };
    void loadSeatMap();
    return () => {
      active = false;
    };
  }, [event?.id]);

  const update = (name: string, value: string) => form.setField(name, value);

  const saveTier = (
    draft: OrganizerTicketTierDraft,
    editingIndex: number | null,
  ) => {
    form.setValues((current) => ({
      ...current,
      tiers:
        editingIndex === null
          ? [...current.tiers, draft]
          : current.tiers.map((tier, index) =>
              index === editingIndex ? draft : tier,
            ),
    }));
    if (editingIndex === null)
      setTierKeys((current) => [...current, crypto.randomUUID()]);
    setTierMessage("");
  };

  const removeTier = (index: number) => {
    setTierKeys((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
    form.setValues((current) => ({
      ...current,
      tiers: current.tiers.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validateTiers = () => {
    if (!wizard) return true;
    if (!tiers.length) {
      setTierMessage("Thêm ít nhất một loại vé.");
      return false;
    }
    const invalid = tiers
      .map(validateOrganizerTicketTier)
      .find((item) => !item.valid);
    setTierMessage(
      invalid
        ? (Object.values(invalid.errors)[0] ?? "Kiểm tra lại loại vé.")
        : "",
    );
    return !invalid;
  };

  const next = () => {
    if (
      step === 0 &&
      !form.validate(["title", "categoryId", "provinceId", "street"])
    )
      return;
    if (
      step === 1 &&
      (!form.validate(["startAt", "endAt"]) || !validateTiers())
    )
      return;
    setStep((value) => Math.min(3, value + 1));
  };

  const save = async () => {
    if (locked || saving || seatMapLoading || seatMapError) return;

    if (wizard && step < 3) {
      next();
      return;
    }

    const step0Valid = form.validate([
      "title",
      "categoryId",
      "provinceId",
      "street",
    ]);
    if (!step0Valid) {
      setStep(0);
      return;
    }

    const step1Valid = form.validate(["startAt", "endAt"]);
    if (!step1Valid) {
      setStep(1);
      return;
    }

    const tiersValid = validateTiers();
    if (!tiersValid) {
      setStep(1);
      return;
    }

    const savePayload: OrganizerEventFormSave = {
      input: { ...form.toInput(), seatingChartImage: undefined },
      initialTicketTiers: wizard ? tiers : undefined,
      finance: form.values.finance,
      seatMap: seatMap ?? undefined,
      seatMapExists,
      ticketTierKeys: tiers.map((_, index) => tierKeys[index] ?? ""),
    };

    const ok = await onSave(savePayload);
    if (ok) form.markSaved();
  };

  const submit = (eventValue: FormEvent) => {
    eventValue.preventDefault();
    void save();
  };

  const basicSection = (
    <OrganizerEventBasicFields
      disabled={locked}
      errors={form.errors}
      onChange={form.onChange}
      registerField={form.registerField}
      values={form.values}
      onFieldChange={update}
    />
  );

  const scheduleSection = (
    <>
      <OrganizerEventScheduleFields
        disabled={locked}
        errors={form.errors}
        onChange={form.onChange}
        registerField={form.registerField}
        values={form.values}
      />
      {(wizard || event) && (
        <fieldset disabled={locked} className="mt-6 space-y-4">
          <OrganizerEventSeatMapSection
            eventId={event?.id}
            initialImage={form.values.seatingChartImage}
            loading={seatMapLoading}
            error={seatMapError}
            seatMap={seatMap}
            ticketTiers={seatEditorTiers}
            onImageChange={(value) => update("seatingChartImage", value)}
            onMapChange={handleSeatMapChange}
          />
          {wizard && (
            <OrganizerEventTicketTiersSection
              tiers={tiers}
              startAt={form.values.startAt}
              endAt={form.values.endAt}
              message={tierMessage}
              onSave={saveTier}
              onRemove={removeTier}
            />
          )}
        </fieldset>
      )}
    </>
  );
  const confirmationSection = (
    <OrganizerEventStepConfirmation
      disabled={locked}
      value={form.values.confirmationMessage}
      onChange={form.onChange}
    />
  );

  const paymentSection = (
    <OrganizerEventStepFinance
      disabled={locked}
      finance={form.values.finance}
      onChange={(field, value) =>
        form.setValues((current) => ({
          ...current,
          finance: { ...current.finance, [field]: value },
        }))
      }
    />
  );

  const sections = [
    basicSection,
    scheduleSection,
    confirmationSection,
    paymentSection,
  ];
  return (
    <>
      <OrganizerEventFormLayout
        wizard={wizard}
        activeSection={activeSection}
        step={step}
        sections={sections}
        error={error}
        saving={saving}
        seatMapLoading={seatMapLoading}
        seatMapError={seatMapError}
        submitLabel={submitLabel}
        onSubmit={submit}
        onNext={next}
        onPrevious={() => setStep((value) => value - 1)}
        onCancel={onCancel}
      />
    </>
  );
}
