import { useEffect, useRef, type RefObject } from "react";

const focusableSelector =
  'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useCategoryDialog(
  panelRef: RefObject<HTMLElement | null>,
  initialFocusRef: RefObject<HTMLElement | null>,
  onCancel: () => void,
  disabled: boolean,
) {
  const onCancelRef = useRef(onCancel);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onCancelRef.current = onCancel;
    disabledRef.current = disabled;
  }, [disabled, onCancel]);

  useEffect(() => {
    const activeElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const focusFrame = window.requestAnimationFrame(() =>
      initialFocusRef.current?.focus(),
    );
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !disabledRef.current) {
        onCancelRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable =
        panelRef.current?.querySelectorAll<HTMLElement>(focusableSelector);
      if (!focusable?.length) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", onKeyDown);
      activeElement?.focus();
    };
  }, [initialFocusRef, panelRef]);
}
