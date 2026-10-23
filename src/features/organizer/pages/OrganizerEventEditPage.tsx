import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  findMineById,
  findOwnedSeatMap,
  updateEvent,
  updateSeatMap,
  deleteTicketType,
} from "../api/organizerEventApi.ts";
import {
  createTicketType,
  updateTicketType,
  setPayout,
  uploadImage,
} from "../../events/api/eventApi.ts";
import { create as createSeatMap } from "../../seat-map/api/seatMapApi.ts";
import { toSeatMapWritePayload } from "../../seat-map/helpers/seat-map-payload.ts";
import { dataUrlFile } from "../../../utils/eventImage.ts";
import { OrganizerEventNavigation } from "../components/OrganizerEventNavigation.tsx";
import { OrganizerPageHeader } from "../components/OrganizerPageHeader.tsx";
import { OrganizerEventFormLayout } from "../components/create-event/OrganizerEventFormLayout.tsx";
import { OrganizerEventStepBasic } from "../components/create-event/OrganizerEventStepBasic.tsx";
import { OrganizerEventStepSchedule } from "../components/create-event/OrganizerEventStepSchedule.tsx";
import { OrganizerEventStepConfirmation } from "../components/create-event/OrganizerEventStepConfirmation.tsx";
import { OrganizerEventStepFinance } from "../components/create-event/OrganizerEventStepFinance.tsx";
import { useOrganizerEventForm } from "../hooks/use-organizer-event-form.ts";
import {
  toEditValues,
  toEditPayload,
  toTicketPayload,
} from "../helpers/organizer-event-edit.ts";
import {
  validateOrganizerTicketTier,
  type OrganizerTicketTierDraft,
} from "../helpers/validate-organizer-ticket-tier.ts";
import type { OwnerEvent } from "../../../types/event.ts";
import type { SeatMap } from "../../seat-map/types/seat-map.ts";
import type {
  OrganizerPath,
  OrganizerRoute,
} from "../../../routes/organizer-route.ts";

type Props = {
  activeRoute: OrganizerRoute;
  eventId: string;
  onDirtyChange: (dirty: boolean) => void;
  onNavigate: (path: OrganizerPath) => void;
};

export function OrganizerEventEditPage({
  activeRoute,
  eventId,
  onDirtyChange,
  onNavigate,
}: Props) {
  const form = useOrganizerEventForm();
  const { reset } = form;
  const [event, setEvent] = useState<OwnerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [retry, setRetry] = useState(0);
  const [step, setStep] = useState(() => {
    const value = Number(
      new URLSearchParams(window.location.search).get("step"),
    );
    return Number.isInteger(value) && value >= 0 && value <= 3 ? value : 0;
  });
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const seatMapExists = useRef(false);
  const [mapDirty, setMapDirty] = useState(false);
  const [tierKeys, setTierKeys] = useState<string[]>([]);
  const persistedTiers = useRef(new Map<string, string>());
  const [tierMessage, setTierMessage] = useState("");
  const locked = event?.status !== "DRAFT" && event?.status !== "REJECTED";

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await findMineById(eventId);
        let map: SeatMap | null = null;
        try {
          map = (await findOwnedSeatMap(eventId)).data.seatMap;
        } catch (cause) {
          if (!axios.isAxiosError(cause) || cause.response?.status !== 404)
            throw cause;
        }
        if (!active) return;

        //sau khi api trả về chi tiết sự kiện thì chạy hàm bên dưới
        //form được tạo trước khi sự kiện tải xong
        //toEditValues() chuyển dữ liệu API sang cấu trúc mà form sử dụng.
        //reset() đưa dữ liệu đó vào form, đồng thời đặt nó làm giá trị gốc đã lưu
        reset(toEditValues(data.event));
        setEvent(data.event);
        setSeatMap(map);
        seatMapExists.current = map !== null;
        setMapDirty(false);
        setTierKeys(data.event.ticketTypes.map((tier) => tier.id));
        persistedTiers.current = new Map(
          data.event.ticketTypes.map((tier) => [tier.id, tier.id]),
        );
      } catch {
        if (active) setError("Không thể tải sự kiện. Vui lòng thử lại.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [eventId, retry, reset]);

  useEffect(() => {
    onDirtyChange(form.isDirty || mapDirty);
  }, [form.isDirty, mapDirty, onDirtyChange]);
  useEffect(() => () => onDirtyChange(false), [onDirtyChange]);

  const savedMap = useRef<string | null>(null);
  const handleMapChange = useCallback((next: SeatMap) => {
    const serialized = JSON.stringify(next);
    if (savedMap.current === null) savedMap.current = serialized;
    setMapDirty(serialized !== savedMap.current);
    setSeatMap(next);
  }, []);

  const saveTier = (draft: OrganizerTicketTierDraft, index: number | null) => {
    form.setValues((current) => ({
      ...current,
      tiers:
        index === null
          ? [...current.tiers, draft]
          : current.tiers.map((tier, i) => (i === index ? draft : tier)),
    }));
    if (index === null) setTierKeys((keys) => [...keys, crypto.randomUUID()]);
    setTierMessage("");
  };
  const removeTier = (index: number) => {
    const key = tierKeys[index];
    if (
      seatMap?.hangs.some(
        (row) =>
          row.ticketTypeId === key ||
          row.seats.some((seat) => seat.ticketTypeId === key),
      )
    ) {
      setTierMessage("Hãy bỏ gán loại vé này khỏi sơ đồ ghế trước khi xóa.");
      return;
    }
    form.setValues((current) => ({
      ...current,
      tiers: current.tiers.filter((_, i) => i !== index),
    }));
    setTierKeys((keys) => keys.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (locked || savingRef.current || loading) return;
    if (!form.validate(["title", "categoryId", "provinceId", "street"])) {
      setStep(0);
      return;
    }
    if (!form.validate(["startAt", "endAt"])) {
      setStep(1);
      return;
    }
    const invalid = form.values.tiers
      .map(validateOrganizerTicketTier)
      .find((result) => !result.valid);
    if (!form.values.tiers.length || invalid) {
      setTierMessage(
        invalid
          ? (Object.values(invalid.errors)[0] ?? "Kiểm tra loại vé.")
          : "Thêm ít nhất một loại vé.",
      );
      setStep(1);
      return;
    }
    savingRef.current = true;
    setSaving(true);
    setError(null);
    setNotice("");
    try {
      const upload = async (
        value: string,
        category: Parameters<typeof uploadImage>[1],
      ) => {
        const file = dataUrlFile(value, `${category}.png`);
        return file ? (await uploadImage(file, category)).data.url : value;
      };
      const payload = toEditPayload(form.values);
      if (
        event?.location.address === form.values.street &&
        event.location.provinceId === form.values.provinceId &&
        (event.location.wardId ?? "") === form.values.wardId
      )
        delete payload.location;
      payload.thumbnail = await upload(form.values.thumbnail, "thumbnail");
      payload.coverImage = await upload(form.values.coverImage, "cover");
      payload.organizerLogo = await upload(
        form.values.organizerLogo,
        "organizer-avatar",
      );
      const { data } = await updateEvent(eventId, payload);
      setEvent(data.event);
      for (const [index, tier] of form.values.tiers.entries()) {
        const key = tierKeys[index];
        const id = persistedTiers.current.get(key);
        const ticket = toTicketPayload(tier);
        ticket.image = await upload(tier.image ?? "", "ticket-tier");
        if (id) {
          await updateTicketType(id, ticket);
        } else {
          const result = await createTicketType({ ...ticket, eventId });
          persistedTiers.current.set(key, result.data.ticketType.id);
        }
      }
      if (seatMap && mapDirty) {
        const payload = toSeatMapWritePayload(
          seatMap,
          Object.fromEntries(persistedTiers.current),
        );
        if (seatMapExists.current) await updateSeatMap(eventId, payload);
        else {
          await createSeatMap(eventId, payload);
          seatMapExists.current = true;
        }
      }
      for (const [key, id] of persistedTiers.current) {
        if (!tierKeys.includes(key)) {
          await deleteTicketType(id);
          persistedTiers.current.delete(key);
        }
      }
      await setPayout(eventId, form.values.finance);
      form.markSaved();
      savedMap.current = JSON.stringify(seatMap);
      setMapDirty(false);
      onDirtyChange(false);
      setNotice("Đã lưu thay đổi sự kiện.");
    } catch (cause) {
      const message = axios.isAxiosError(cause)
        ? cause.response?.data?.message
        : null;
      setError(
        `${Array.isArray(message) ? message.join(" ") : message || "Không thể lưu sự kiện."} Một số thông tin có thể đã được lưu. Bạn có thể thử lưu lại.`,
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  if (loading) return <p role="status">Đang tải sự kiện…</p>;
  if (!event)
    return (
      <div role="alert">
        <p>{error}</p>
        <button type="button" onClick={() => setRetry((value) => value + 1)}>
          Thử lại
        </button>
      </div>
    );

  const disabled = locked || saving;
  const sections = [
    <OrganizerEventStepBasic
      key="basic"
      disabled={disabled}
      errors={form.errors}
      onChange={form.onChange}
      registerField={form.registerField}
      values={form.values}
      onFieldChange={form.setField}
    />,
    <OrganizerEventStepSchedule
      key="schedule"
      disabled={disabled}
      errors={form.errors}
      onChange={form.onChange}
      registerField={form.registerField}
      values={form.values}
      eventId={eventId}
      seatMap={seatMap}
      seatMapLoading={false}
      seatMapError=""
      seatMapTiers={form.values.tiers.map((tier, index) => ({
        id: tierKeys[index],
        name: tier.name,
        price: tier.price,
      }))}
      onImageChange={(value) => form.setField("seatingChartImage", value)}
      onMapChange={handleMapChange}
      tiers={form.values.tiers}
      tierMessage={tierMessage}
      onSaveTier={saveTier}
      onRemoveTier={removeTier}
    />,
    <OrganizerEventStepConfirmation
      key="confirmation"
      disabled={disabled}
      value={form.values.confirmationMessage}
      onChange={form.onChange}
    />,
    <OrganizerEventStepFinance
      key="finance"
      disabled={disabled}
      finance={form.values.finance}
      onChange={(field, value) =>
        form.setValues((current) => ({
          ...current,
          finance: { ...current.finance, [field]: value },
        }))
      }
    />,
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <OrganizerPageHeader eyebrow="THÔNG TIN SỰ KIỆN" title={event.title}>
        <p>
          {locked
            ? "Sự kiện đang khóa chỉnh sửa."
            : "Cập nhật thông tin trước khi gửi Admin duyệt."}
        </p>
      </OrganizerPageHeader>
      <OrganizerEventNavigation
        activeRoute={activeRoute}
        eventId={eventId}
        onNavigate={onNavigate}
        editStep={step}
        onEditStepChange={setStep}
      />
      {notice && (
        <p role="status" className="text-sm font-bold text-green-700">
          {notice}
        </p>
      )}
      <fieldset disabled={disabled}>
        <OrganizerEventFormLayout
          wizard={false}
          activeSection={step}
          step={step}
          sections={sections}
          error={error}
          saving={saving}
          seatMapLoading={false}
          seatMapError=""
          submitLabel="Lưu thay đổi"
          onSubmit={(event) => {
            event.preventDefault();
            void save();
          }}
          onNext={() => setStep((value) => Math.min(3, value + 1))}
          onPrevious={() => setStep((value) => Math.max(0, value - 1))}
          onCancel={() => onNavigate(`/organizer/events/${eventId}`)}
        />
      </fieldset>
    </div>
  );
}
