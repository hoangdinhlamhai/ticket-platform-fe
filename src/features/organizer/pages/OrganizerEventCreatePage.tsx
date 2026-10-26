import { useCallback, useRef, useState, type FormEvent } from "react";
import { findMineById } from "../api/organizerEventApi.ts";
import { uploadImage } from "../../events/api/eventApi.ts";
import { create as createSeatMap } from "../../seat-map/api/seatMapApi.ts";
import { toSeatMapWritePayload } from "../../seat-map/helpers/seat-map-payload.ts";
import { OrganizerPageHeader } from "../components/OrganizerPageHeader.tsx";
import { OrganizerEventFormLayout } from "../components/create-event/OrganizerEventFormLayout.tsx";
import { OrganizerEventStepBasic } from "../components/create-event/OrganizerEventStepBasic.tsx";
import { OrganizerEventStepConfirmation } from "../components/create-event/OrganizerEventStepConfirmation.tsx";
import { OrganizerEventStepFinance } from "../components/create-event/OrganizerEventStepFinance.tsx";
import { OrganizerEventStepSchedule } from "../components/create-event/OrganizerEventStepSchedule.tsx";
import { useOrganizerEventForm } from "../hooks/use-organizer-event-form.ts";
import {
  validateOrganizerTicketTier,
  type OrganizerTicketTierDraft,
} from "../helpers/validate-organizer-ticket-tier.ts";
import type { OrganizerEventFinance } from "../types/organizer-event.ts";
import type { SeatMap } from "../../seat-map/types/seat-map.ts";
import type { OrganizerPath } from "../../../routes/organizer-route.ts";
import {
  resolveOrganizerCreateRedirect,
  type OrganizerCreateRedirect,
} from "../helpers/resolve-organizer-create-redirect.ts";
import type { OrganizerWorkspaceController } from "../hooks/organizer-workspace-controller.ts";

type Props = {
  onCancel: () => void;
  onDirtyChange: (hasUnsavedChanges: boolean) => void;
  onNavigatePreservingNotice: (path: OrganizerPath) => void;
  workspace: Pick<
    OrganizerWorkspaceController,
    "createEvent" | "isSaving" | "saveError"
  >;
};

export function OrganizerEventCreatePage({
  onCancel,
  onDirtyChange,
  onNavigatePreservingNotice,
  workspace,
}: Props) {
  const form = useOrganizerEventForm(undefined, { onDirtyChange });
  const [step, setStep] = useState(0);
  const [tierMessage, setTierMessage] = useState("");
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [seatMapImageFile, setSeatMapImageFile] = useState<File | null>(null);
  const uploadedSeatMapImageUrl = useRef<string | null>(null);
  const seatMapError = "";
  const [seatMapSaveError, setSeatMapSaveError] = useState<string | null>(null);
  const pendingSeatMapCreate = useRef<string | null>(null);
  const [tierKeys, setTierKeys] = useState<string[]>([]);
  const tiers = form.values.tiers;

  const handleSeatMapChange = useCallback(
    (nextMap: SeatMap) => {
      setSeatMap(nextMap);
      onDirtyChange(true);
    },
    [onDirtyChange],
  );

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

  const validateStep = (index: number) => {
    if (index === 0)
      return form.validate(["title", "categoryId", "provinceId", "street"]);
    if (index === 1)
      return form.validate(["startAt", "endAt"]) && validateTiers();
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((value) => Math.min(3, value + 1));
  };

  const save = async () => {
    if (workspace.isSaving || seatMapError) return;
    for (const index of [0, 1]) {
      if (!validateStep(index)) {
        setStep(index);
        return;
      }
    }
    setSeatMapSaveError(null);
    if (seatMapImageFile && !uploadedSeatMapImageUrl.current) {
      try {
        uploadedSeatMapImageUrl.current = (
          await uploadImage(seatMapImageFile, "seating-chart")
        ).data.url;
      } catch {
        setSeatMapSaveError("Không thể tải ảnh sơ đồ lên. Hãy thử lưu lại.");
        return;
      }
    }
    const imageUrl =
      uploadedSeatMapImageUrl.current ?? seatMap?.imageUrl ?? null;
    let eventId = pendingSeatMapCreate.current;
    let redirect: OrganizerCreateRedirect | null = eventId
      ? { path: "/organizer/events" as const, clearDirtyFirst: true as const }
      : null;

    if (!eventId) {
      const result = await workspace.createEvent(
        { ...form.toInput(), seatingChartImage: undefined },
        tiers,
        form.values.finance,
      );
      redirect = resolveOrganizerCreateRedirect(result);
      if (!result || !redirect) return;
      eventId = result.targetIds.eventId;
      if (seatMap) pendingSeatMapCreate.current = eventId;
    }
    if (!eventId || !redirect) return;

    if (seatMap) {
      try {
        const { data } = await findMineById(eventId);
        const ticketTypes = data.event.ticketTypes ?? [];
        const ticketTypeIds: Record<string, string> = {};
        tiers.forEach((tier, index) => {
          const key = tierKeys[index];
          const persisted = ticketTypes.find(
            (ticket) =>
              ticket.name === tier.name &&
              ticket.price === tier.price &&
              ticket.quantity === tier.capacity,
          );
          if (key && persisted) ticketTypeIds[key] = persisted.id;
        });
        await createSeatMap(
          eventId,
          toSeatMapWritePayload({ ...seatMap, imageUrl }, ticketTypeIds),
        );
        pendingSeatMapCreate.current = null;
        setSeatMapImageFile(null);
      } catch {
        setSeatMapSaveError(
          "Sự kiện đã tạo nhưng chưa lưu được sơ đồ ghế. Hãy gửi lại để lưu sơ đồ mà không tạo trùng sự kiện.",
        );
        return;
      }
    }

    setSeatMapSaveError(null);
    if (redirect.clearDirtyFirst) form.markSaved();
    onNavigatePreservingNotice(redirect.path);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void save();
  };

  const seatMapTiers = tiers.map((tier, index) => ({
    id: tierKeys[index] ?? `ticket-tier-${index}`,
    name: tier.name,
    price: tier.price,
  }));

  const sections = [
    <OrganizerEventStepBasic
      key="basic"
      disabled={false}
      errors={form.errors}
      onChange={form.onChange}
      registerField={form.registerField}
      values={form.values}
      onFieldChange={form.setField}
    />,
    <OrganizerEventStepSchedule
      key="schedule"
      disabled={false}
      errors={form.errors}
      onChange={form.onChange}
      registerField={form.registerField}
      values={form.values}
      seatMap={seatMap}
      seatMapLoading={false}
      seatMapError={seatMapError}
      seatMapTiers={seatMapTiers}
      onImageChange={form.setField.bind(null, "seatingChartImage")}
      onImageFileChange={(file) => {
        setSeatMapImageFile(file);
        uploadedSeatMapImageUrl.current = null;
      }}
      onMapChange={handleSeatMapChange}
      tiers={tiers}
      tierMessage={tierMessage}
      onSaveTier={saveTier}
      onRemoveTier={removeTier}
    />,
    <OrganizerEventStepConfirmation
      key="confirmation"
      disabled={false}
      value={form.values.confirmationMessage}
      onChange={form.onChange}
    />,
    <OrganizerEventStepFinance
      key="finance"
      disabled={false}
      finance={form.values.finance}
      onChange={(field: keyof OrganizerEventFinance, value: string) =>
        form.setValues((current) => ({
          ...current,
          finance: { ...current.finance, [field]: value },
        }))
      }
    />,
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <OrganizerPageHeader eyebrow="TẠO SỰ KIỆN" title="Bắt đầu từ bản nháp.">
        <p>
          Hoàn thiện từng bước. Sự kiện sẽ được gửi cho Admin duyệt ngay sau khi
          bạn nhấn xác nhận ở bước cuối.
        </p>
      </OrganizerPageHeader>
      <OrganizerEventFormLayout
        wizard
        step={step}
        sections={sections}
        error={seatMapSaveError ?? workspace.saveError}
        saving={workspace.isSaving}
        seatMapLoading={false}
        seatMapError={seatMapError}
        submitLabel="Gửi sự kiện"
        onSubmit={submit}
        onNext={next}
        onPrevious={() => setStep((value) => value - 1)}
        onCancel={onCancel}
      />
      <div className="rounded-lg border border-dashed border-line bg-paper-deep p-4 text-sm leading-relaxed text-ink-soft">
        Sự kiện sau khi tạo sẽ ở trạng thái <strong>chờ duyệt</strong>. Admin sẽ
        xem xét và phê duyệt trước khi sự kiện được công bố.
      </div>
      <button
        className="min-h-12 rounded-md border border-line px-5 text-sm font-extrabold"
        type="button"
        onClick={onCancel}
      >
        Hủy tạo sự kiện
      </button>
    </div>
  );
}
