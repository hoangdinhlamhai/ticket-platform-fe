import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import axios from "axios";
import { OrganizerEventBasicFields } from "./OrganizerEventBasicFields.tsx";
import { OrganizerEventPreview } from "./OrganizerEventPreview.tsx";
import { OrganizerEventScheduleFields } from "./OrganizerEventScheduleFields.tsx";
import { OrganizerEventWizardProgress } from "./OrganizerEventWizardProgress.tsx";
import { SeatMapEditor } from "./SeatMapEditor.tsx";
import { OrganizerEventTierDialog } from "./OrganizerEventTierDialog.tsx";
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
import { findOwned } from "../../../seat-map/api/seatMapApi.ts";
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
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base outline-none disabled:bg-paper-deep";

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
}: Props) {
  const form = useOrganizerEventForm(event, { onDirtyChange, finance });
  const [step, setStep] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<number | null>(null);
  const [tierReturnFocus, setTierReturnFocus] = useState<HTMLElement | null>(
    null,
  );
  const [tierMessage, setTierMessage] = useState("");
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null);
  const [seatMapExists, setSeatMapExists] = useState(false);
  const [seatMapLoading, setSeatMapLoading] = useState(Boolean(event?.id));
  const [seatMapError, setSeatMapError] = useState("");
  const ignoreNextSeatMapChange = useRef(true);
  const [tierKeys, setTierKeys] = useState<string[]>(() =>
    form.values.tiers.map(() => crypto.randomUUID()),
  );
  const previewRef = useRef<HTMLButtonElement>(null);
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
        const { data } = await findOwned(event.id);
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

  const saveTier = (draft: OrganizerTicketTierDraft) => {
    form.setValues((current) => ({
      ...current,
      tiers:
        editingTier === null
          ? [...current.tiers, draft]
          : current.tiers.map((tier, index) =>
              index === editingTier ? draft : tier,
            ),
    }));
    if (editingTier === null)
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
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-extrabold">Sơ đồ chỗ ngồi</h2>
              <p className="mt-1 text-sm text-ink-soft">
                Chọn tải ảnh sơ đồ hoặc tự thiết kế khu vực và ghế. Có thể bỏ
                qua nếu sự kiện không dùng chỗ ngồi cố định.
              </p>
            </div>
            <SeatMapEditor
              key={`${event?.id ?? "new"}-${seatMap?.id ?? (seatMapLoading ? "loading" : "empty")}`}
              initialImage={form.values.seatingChartImage}
              onImageChange={(value) => update("seatingChartImage", value)}
              initialMap={seatMap}
              onMapChange={handleSeatMapChange}
              ticketTiers={seatEditorTiers}
            />
            {seatMapLoading && <p role="status">Đang tải sơ đồ ghế...</p>}
            {seatMapError && <p role="alert">{seatMapError}</p>}
          </div>
          {wizard && (
            <>
              <div className="flex items-center justify-between">
                <legend className="text-xl font-extrabold">Loại vé</legend>
                <span className="text-sm text-ink-soft">
                  {tiers.length} loại vé
                </span>
              </div>
              {tiers.map((tier, index) => (
                <div
                  key={`${tier.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
                >
                  <button
                    type="button"
                    className="text-left"
                    onClick={(clickEvent) => {
                      setEditingTier(index);
                      setTierReturnFocus(clickEvent.currentTarget);
                      setTierOpen(true);
                    }}
                  >
                    <strong>{tier.name}</strong> ·{" "}
                    {tier.price === 0
                      ? "Miễn phí"
                      : `${tier.price.toLocaleString("vi-VN")} đ`}{" "}
                    · {tier.capacity} vé
                  </button>
                  <button
                    type="button"
                    className="text-sm font-bold text-coral-dark"
                    onClick={() => removeTier(index)}
                  >
                    Xóa
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="min-h-10 rounded-md border border-blue px-4 font-bold text-blue-deep"
                onClick={(clickEvent) => {
                  setEditingTier(null);
                  setTierReturnFocus(clickEvent.currentTarget);
                  setTierOpen(true);
                }}
              >
                + Thêm loại vé
              </button>
              {tierMessage && (
                <p className="text-sm font-bold text-error" role="alert">
                  {tierMessage}
                </p>
              )}
            </>
          )}
        </fieldset>
      )}
    </>
  );
  const confirmationSection = (
    <fieldset disabled={locked} className="space-y-4">
      <legend className="text-xl font-extrabold">Xác nhận sau khi mua</legend>
      <label
        className="block text-sm font-bold"
        htmlFor="organizer-confirmation-message"
      >
        Tin nhắn xác nhận
        <textarea
          id="organizer-confirmation-message"
          name="confirmationMessage"
          maxLength={500}
          className={inputClass}
          value={form.values.confirmationMessage}
          onChange={form.onChange}
        />
      </label>
      <p className="text-right text-xs text-ink-soft">
        {form.values.confirmationMessage.length}/500
      </p>
    </fieldset>
  );

  const paymentSection = (
    <fieldset disabled={locked} className="space-y-4">
      <legend className="text-xl font-extrabold">
        Thông tin thanh toán và hóa đơn
      </legend>
      <label className="block text-sm font-bold">
        Loại hình kinh doanh
        <select
          className={inputClass}
          name="businessType"
          value={form.values.finance.businessType}
          onChange={(selectEvent) =>
            form.setValues((current) => ({
              ...current,
              finance: {
                ...current.finance,
                businessType: selectEvent.target.value,
              },
            }))
          }
        >
          <option value="INDIVIDUAL">Cá nhân</option>
          <option value="ORGANIZATION">Tổ chức</option>
        </select>
      </label>
      {(
        [
          "accountHolder",
          "accountNumber",
          "bankName",
          "branch",
          "invoiceName",
          "invoiceAddress",
          "taxCode",
        ] as const
      ).map((key) => (
        <label className="block text-sm font-bold" key={key}>
          {
            (
              {
                accountHolder: "Chủ tài khoản",
                accountNumber: "Số tài khoản",
                bankName: "Tên ngân hàng",
                branch: "Chi nhánh",
                invoiceName: "Tên xuất hóa đơn",
                invoiceAddress: "Địa chỉ hóa đơn",
                taxCode: "Mã số thuế",
              } as const
            )[key]
          }
          <input
            className={inputClass}
            value={form.values.finance[key] ?? ""}
            onChange={(inputEvent) =>
              form.setValues((current) => ({
                ...current,
                finance: { ...current.finance, [key]: inputEvent.target.value },
              }))
            }
          />
        </label>
      ))}
    </fieldset>
  );

  // Wizard mode shows one section per step. Edit mode (non-wizard) has no stepper, so
  // it must expose every section at once — otherwise confirmation and payout stay hidden.
  const wizardSections = [
    basicSection,
    scheduleSection,
    confirmationSection,
    paymentSection,
  ];

  return (
    <>
      <form
        noValidate
        onSubmit={submit}
        onKeyDown={(e) => {
          if (
            e.key === "Enter" &&
            (e.target as HTMLElement).tagName === "INPUT"
          ) {
            e.preventDefault();
            if (wizard && step < 3) next();
          }
        }}
        className="space-y-5"
      >
        {error && (
          <div
            className="rounded-md border border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {wizard && <OrganizerEventWizardProgress currentStep={step} />}

        {wizard ? (
          <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            {wizardSections.map((section, index) => (
              <div key={index} hidden={step !== index}>
                {section}
              </div>
            ))}
          </section>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
              {basicSection}
            </section>
            <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
              {scheduleSection}
            </section>
            <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
              {confirmationSection}
            </section>
            <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
              {paymentSection}
            </section>
            <div className="flex gap-3">
              <button
                className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                type="submit"
                disabled={saving || seatMapLoading || Boolean(seatMapError)}
              >
                {saving ? "Đang lưu…" : submitLabel}
              </button>
              {onCancel && (
                <button
                  className="min-h-12 rounded-md border border-line px-5 font-extrabold"
                  type="button"
                  onClick={onCancel}
                >
                  Hủy
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-md border border-red-500 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        {wizard && (
          <div className="flex justify-between gap-3">
            <button
              className="min-h-12 rounded-md border border-line px-5 font-extrabold"
              type="button"
              disabled={step === 0}
              onClick={() => setStep((value) => value - 1)}
            >
              Quay lại
            </button>
            <div className="flex gap-3">
              <button
                ref={previewRef}
                className="min-h-12 rounded-md border border-blue px-5 font-extrabold text-blue-deep"
                type="button"
                onClick={() => setPreviewOpen(true)}
              >
                Xem trước
              </button>
              {step < 3 ? (
                <button
                  key="step-next-btn"
                  className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
                  type="button"
                  onClick={next}
                >
                  Tiếp tục
                </button>
              ) : (
                <button
                  key="step-submit-btn"
                  className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                  type="submit"
                  disabled={saving || seatMapLoading || Boolean(seatMapError)}
                >
                  {saving ? "Đang lưu…" : submitLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </form>

      <OrganizerEventPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        returnFocus={previewRef}
        values={form.values}
      />

      <OrganizerEventTierDialog
        key={`${tierOpen}-${editingTier ?? "new"}`}
        open={tierOpen}
        tier={editingTier === null ? null : tiers[editingTier]}
        onClose={() => setTierOpen(false)}
        onSave={saveTier}
        returnFocus={tierReturnFocus}
        startAt={form.values.startAt}
        endAt={form.values.endAt}
      />
    </>
  );
}
