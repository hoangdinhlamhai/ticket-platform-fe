import { useState, type MouseEvent } from "react";
import { OrganizerEventTierDialog } from "./OrganizerEventTierDialog.tsx";
import type { OrganizerTicketTierDraft } from "../../helpers/validate-organizer-ticket-tier.ts";

type Props = {
  tiers: readonly OrganizerTicketTierDraft[];
  startAt: string;
  endAt: string;
  message: string;
  onSave: (
    draft: OrganizerTicketTierDraft,
    editingIndex: number | null,
  ) => void;
  onRemove: (index: number) => void;
};

export function OrganizerEventTicketTiersSection({
  tiers,
  startAt,
  endAt,
  message,
  onSave,
  onRemove,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);

  const addTier = (event: MouseEvent<HTMLButtonElement>) => {
    setEditingIndex(null);
    setReturnFocus(event.currentTarget);
    setOpen(true);
  };

  const editTier = (event: MouseEvent<HTMLButtonElement>, index: number) => {
    setEditingIndex(index);
    setReturnFocus(event.currentTarget);
    setOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <legend className="text-xl font-extrabold">Loại vé</legend>
        <span className="text-sm text-ink-soft">{tiers.length} loại vé</span>
      </div>
      {tiers.map((tier, index) => (
        <div
          key={`${tier.name}-${index}`}
          className="flex items-center justify-between gap-3 rounded-md border border-line p-3"
        >
          <button
            type="button"
            className="text-left"
            onClick={(event) => editTier(event, index)}
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
            onClick={() => onRemove(index)}
          >
            Xóa
          </button>
        </div>
      ))}
      <button
        type="button"
        className="min-h-10 rounded-md border border-blue px-4 font-bold text-blue-deep"
        onClick={addTier}
      >
        + Thêm loại vé
      </button>
      {message && (
        <p className="text-sm font-bold text-error" role="alert">
          {message}
        </p>
      )}
      <OrganizerEventTierDialog
        key={`${open}-${editingIndex ?? "new"}`}
        open={open}
        tier={editingIndex === null ? null : tiers[editingIndex]}
        onClose={() => setOpen(false)}
        onSave={(draft) => onSave(draft, editingIndex)}
        returnFocus={returnFocus}
        startAt={startAt}
        endAt={endAt}
      />
    </>
  );
}
