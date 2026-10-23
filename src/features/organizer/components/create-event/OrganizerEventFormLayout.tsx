import { useRef } from "react";
import type { FormEventHandler, KeyboardEventHandler, ReactNode } from "react";
import { OrganizerEventWizardProgress } from "./OrganizerEventWizardProgress.tsx";

type Props = {
  wizard: boolean;
  activeSection?: number;
  step: number;
  sections: readonly ReactNode[];
  error: string | null;
  saving: boolean;
  seatMapLoading: boolean;
  seatMapError: string;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  onNext: () => void;
  onPrevious: () => void;
  onCancel?: () => void;
};

export function OrganizerEventFormLayout({
  wizard,
  activeSection,
  step,
  sections,
  error,
  saving,
  seatMapLoading,
  seatMapError,
  submitLabel,
  onSubmit,
  onNext,
  onPrevious,
  onCancel,
}: Props) {
  const explicitSubmit = useRef(false);
  const submitDisabled = saving || seatMapLoading || Boolean(seatMapError);
  const onKeyDown: KeyboardEventHandler<HTMLFormElement> = (event) => {
    if (
      event.key === "Enter" &&
      (event.target as HTMLElement).tagName === "INPUT"
    ) {
      event.preventDefault();
      if (wizard && step < sections.length - 1) onNext();
    }
  };
  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    if (wizard && step < sections.length - 1) {
      event.preventDefault();
      onNext();
      return;
    }
    if (wizard && !explicitSubmit.current) {
      event.preventDefault();
      return;
    }
    explicitSubmit.current = false;
    onSubmit(event);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      onKeyDown={onKeyDown}
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
          {sections.map((section, index) => (
            <div key={index} hidden={step !== index}>
              {section}
            </div>
          ))}
        </section>
      ) : (
        <div className="space-y-5">
          {sections.map(
            (section, index) =>
              (activeSection === undefined || activeSection === index) && (
                <section
                  key={index}
                  className="rounded-lg border border-line bg-surface p-5 sm:p-6"
                >
                  {section}
                </section>
              ),
          )}
          <div className="flex gap-3">
            <button
              className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
              type="submit"
              disabled={submitDisabled}
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
            onClick={onPrevious}
          >
            Quay lại
          </button>
          <div className="flex gap-3">
            {step < sections.length - 1 ? (
              <button
                className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper"
                type="button"
                onClick={onNext}
              >
                Tiếp tục
              </button>
            ) : (
              <button
                className="min-h-12 rounded-md bg-coral px-5 font-extrabold text-paper"
                type="submit"
                disabled={submitDisabled}
                onClick={(event) => {
                  explicitSubmit.current = event.detail === 1;
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ")
                    explicitSubmit.current = true;
                }}
              >
                {saving ? "Đang lưu…" : submitLabel}
              </button>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
