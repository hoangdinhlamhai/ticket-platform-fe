import { shouldUseClientNavigation } from "../../../routes/client-navigation";
import type {
  OrganizerPath,
  OrganizerRoute,
} from "../../../routes/organizer-route";

type OrganizerEventNavigationProps = {
  activeRoute: OrganizerRoute;
  eventId: string;
  onNavigate: (path: OrganizerPath) => void;
  editStep?: number;
  onEditStepChange?: (step: number) => void;
};

const destinations = [
  { label: "Tổng quan", step: null },
  { label: "Thông tin sự kiện", step: 0 },
  { label: "Thời gian & Loại vé", step: 1 },
  { label: "Xác nhận sau khi mua", step: 2 },
  { label: "Thông tin thanh toán", step: 3 },
] as const;

export function OrganizerEventNavigation({
  activeRoute,
  eventId,
  onNavigate,
  editStep = 0,
  onEditStepChange,
}: OrganizerEventNavigationProps) {
  return (
    <nav
      className="overflow-x-auto border-b border-line"
      aria-label="Quản lý sự kiện"
    >
      <div className="flex min-w-max gap-1">
        {destinations.map((destination) => {
          const href =
            destination.step === null
              ? (`/organizer/events/${eventId}` as OrganizerPath)
              : (`/organizer/events/${eventId}/edit?step=${destination.step}` as OrganizerPath);
          const active =
            destination.step === null
              ? activeRoute === "event-overview"
              : activeRoute === "event-edit" && editStep === destination.step;
          return (
            <a
              key={destination.label}
              className={`min-h-11 border-b-2 px-3 py-3 text-sm font-bold no-underline ${active ? "border-blue text-blue-deep" : "border-transparent text-ink-soft hover:text-blue-deep"}`}
              href={href}
              aria-current={active ? "page" : undefined}
              onClick={(event) => {
                if (!shouldUseClientNavigation(event)) return;
                event.preventDefault();
                if (
                  destination.step !== null &&
                  onEditStepChange &&
                  activeRoute === "event-edit"
                ) {
                  onEditStepChange(destination.step);
                  return;
                }
                onNavigate(href);
              }}
            >
              {destination.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
