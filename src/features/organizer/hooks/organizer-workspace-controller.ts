import axios from "axios";
import * as api from "../../../features/events/api/eventApi.ts";
import type {
  OrganizerEventOwnerDetail,
  OrganizerEventReport,
  OrganizerReportRangeInput,
} from "../../../types/event.ts";
import { createEmptyOrganizerWorkspace } from "../mock/create-organizer-workspace.ts";
import { organizerWorkspaceReducer } from "../helpers/organizer-workspace-reducer.ts";
import type { OrganizerTicketTier } from "../types/organizer-commerce.ts";
import type {
  OrganizerEvent,
  OrganizerEventFinance,
  OrganizerEventInput,
  OrganizerEventPatch,
  OrganizerEventStatus,
} from "../types/organizer-event.ts";
import type { OrganizerOrganizationPatch } from "../types/organizer-organization.ts";
import type {
  OrganizerInitialTicketTierInput,
  OrganizerOperationName,
  OrganizerOperationResult,
  OrganizerWorkspace,
} from "../types/organizer-workspace.ts";

// Report state is kept separate from the mock business workspace so a connected,
// server-computed report never falls back to mock orders on error or while loading.
export type OrganizerReportState = {
  readonly eventId: string | null;
  readonly loading: boolean;
  readonly error: string | null;
  readonly data: OrganizerEventReport | null;
};

export type OrganizerWorkspaceController = {
  readonly workspace: OrganizerWorkspace;
  readonly lastOperation: OrganizerOperationResult | null;
  readonly isSaving: boolean;
  readonly saveError: string | null;
  readonly loading: boolean;
  readonly loadError: string | null;
  readonly report: OrganizerReportState;
  readonly loadEventReport: (
    eventId: string,
    range?: OrganizerReportRangeInput,
  ) => Promise<OrganizerEventReport | null>;
  readonly retry: () => void;
  readonly createEvent: (
    input: OrganizerEventInput,
    initialTicketTiers: readonly OrganizerInitialTicketTierInput[],
    finance?: OrganizerEventFinance,
  ) => Promise<OrganizerOperationResult | null>;
  readonly updateEvent: (
    eventId: string,
    patch: OrganizerEventPatch,
    finance?: OrganizerEventFinance,
  ) => Promise<OrganizerOperationResult | null>;
  readonly submitEventReview: (
    eventId: string,
  ) => Promise<OrganizerOperationResult | null>;
  readonly publishEvent: (eventId: string) => OrganizerOperationResult | null;
  readonly saveTicketTier: (
    tier: OrganizerTicketTier,
  ) => Promise<OrganizerOperationResult | null>;
  readonly updateEventImage: (
    eventId: string,
    field: "seatingChartImage",
    value: string,
  ) => Promise<OrganizerOperationResult | null>;
  readonly setTicketSaleStatus: (
    tierId: string,
    status: OrganizerTicketTier["saleStatus"],
  ) => OrganizerOperationResult | null;
  readonly checkInAttendee: (
    eventId: string,
    attendeeId: string,
  ) => OrganizerOperationResult | null;
  readonly updateOrganization: (
    patch: OrganizerOrganizationPatch,
  ) => OrganizerOperationResult | null;
  readonly clearLastOperation: () => OrganizerOperationResult | null;
};

export type OrganizerAuthStatus = "restoring" | "anonymous" | "authenticated";
export type OrganizerIdentity = {
  readonly userId: string | null;
  readonly accessToken: string | null;
  readonly status: OrganizerAuthStatus;
};

export type OrganizerWorkspaceSnapshot = {
  // The auth user the snapshot's data belongs to. The React hook syncs identity in
  // an effect, so on the first render after an account switch useSyncExternalStore
  // still returns the previous owner's snapshot; comparing this to the current auth
  // user lets the view be masked before that effect runs.
  readonly userId: string | null;
  readonly workspace: OrganizerWorkspace;
  readonly lastOperation: OrganizerOperationResult | null;
  readonly isSaving: boolean;
  readonly saveError: string | null;
  readonly loading: boolean;
  readonly loadError: string | null;
  readonly report: OrganizerReportState;
};

const EMPTY_REPORT_STATE: OrganizerReportState = {
  eventId: null,
  loading: false,
  error: null,
  data: null,
};

const NO_TOKEN_MESSAGE =
  "Bạn cần đăng nhập bằng tài khoản người dùng để thực hiện thao tác này.";
const UNSUPPORTED_MESSAGE = "Thao tác này chưa được hỗ trợ trên máy chủ.";
const DEFAULT_SAVE_ERROR = "Không thể lưu sự kiện. Vui lòng thử lại.";
const DEFAULT_LOAD_ERROR = "Không thể tải sự kiện của bạn. Vui lòng thử lại.";

const STALE_IDENTITY_WORKSPACE = createEmptyOrganizerWorkspace();

// Masks a snapshot whose owning account is not the current auth user. The consuming
// component syncs identity in an effect, so on the first render after an account switch
// (or logout) useSyncExternalStore still returns the previous account's snapshot. This
// hides that data before the effect flushes: a still-authenticated mismatch reads as
// loading (an identity change in progress), an anonymous view as a plain empty state.
// Actions must be gated on the same mismatch by the caller so a stale closure cannot
// mutate the wrong account.
export function maskOrganizerWorkspaceView(
  snapshot: OrganizerWorkspaceSnapshot,
  currentUserId: string | null,
): OrganizerWorkspaceSnapshot {
  if (snapshot.userId === currentUserId) return snapshot;
  return {
    userId: currentUserId,
    workspace: STALE_IDENTITY_WORKSPACE,
    lastOperation: null,
    isSaving: false,
    saveError: null,
    loading: currentUserId !== null,
    loadError: null,
    report: EMPTY_REPORT_STATE,
  };
}

function errorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error))
    return (
      (error.response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      fallback
    );
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

function unsupported(
  operation: OrganizerOperationName,
  targetIds: Readonly<Record<string, string>>,
): OrganizerOperationResult {
  return {
    operation,
    targetIds,
    kind: "action_not_supported",
    reason: UNSUPPORTED_MESSAGE,
  };
}

const OWNER_STATUS_TO_ORGANIZER: Record<string, OrganizerEventStatus> = {
  DRAFT: "draft",
  PENDING_REVIEW: "pending_review",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function toWorkspaceEvent(
  event: import("../../../types/event.ts").OwnerEvent,
): OrganizerEvent {
  return {
    id: event.id,
    title: event.title,
    startAt: event.startAt,
    endAt: event.endAt,
    venue: event.venueName ?? "",
    city: event.location.province.name,
    status: OWNER_STATUS_TO_ORGANIZER[event.status] ?? "draft",
    reviewFeedback: event.rejectionReason,
    thumbnail: event.thumbnail,
    coverImage: event.coverImage,
    category: event.category.name,
    categoryId: event.categoryId,
    provinceId: event.location.provinceId,
    wardId: event.location.wardId ?? undefined,
    street: event.location.address,
    description: event.description,
    organizerName: event.organizerName,
    organizerBio: event.organizerBio,
    organizerLogo: event.organizerLogo,
    visibility: event.visibility === "PUBLIC" ? "public" : "link_only",
    confirmationMessage: event.confirmationMessage ?? undefined,
  };
}

function toEventUpdatePayload(
  patch: OrganizerEventPatch,
): import("../../../types/event.ts").EventUpdatePayload {
  return {
    title: patch.title,
    startAt: patch.startAt,
    endAt: patch.endAt,
    venueName: patch.venueName ?? patch.venue,
    description: patch.description,
    thumbnail: patch.thumbnail,
    coverImage: patch.coverImage,
    organizerName: patch.organizerName,
    organizerBio: patch.organizerBio,
    organizerLogo: patch.organizerLogo,
    visibility:
      patch.visibility === "public"
        ? "PUBLIC"
        : patch.visibility === "link_only"
          ? "LINK_ONLY"
          : undefined,
    confirmationMessage: patch.confirmationMessage,
    seatingChartImage: patch.seatingChartImage,
    categoryId: patch.categoryId,
    location:
      patch.provinceId && patch.street
        ? {
            address: patch.street,
            provinceId: patch.provinceId,
            wardId: patch.wardId,
          }
        : undefined,
  };
}

export function createOrganizerWorkspaceController() {
  let identity: OrganizerIdentity = {
    userId: null,
    accessToken: null,
    status: "anonymous",
  };
  let generation = 0;
  // Bumped whenever a local mutation changes the events list. An in-flight mine
  // load captures the revision it started at and applies its result only if the
  // revision is unchanged; otherwise a load that began before a successful create
  // would resolve late and drop the just-created event.
  let loadRevision = 0;
  // Bumped on every report request; a resolving load applies only if it is still the
  // latest so switching events/accounts or ranges never shows a stale report.
  let reportRequest = 0;
  let snapshot: OrganizerWorkspaceSnapshot = {
    userId: null,
    workspace: createEmptyOrganizerWorkspace(),
    lastOperation: null,
    isSaving: false,
    saveError: null,
    loading: false,
    loadError: null,
    report: EMPTY_REPORT_STATE,
  };
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((listener) => listener());
  }
  function set(next: Partial<OrganizerWorkspaceSnapshot>) {
    snapshot = { ...snapshot, ...next };
    emit();
  }

  function hydrateDetail(
    detail:
      | OrganizerEventOwnerDetail
      | {
          event: OrganizerEvent;
          ticketTypes: OrganizerEventOwnerDetail["ticketTypes"];
          seatMap: OrganizerEventOwnerDetail["seatMap"];
          payoutInfo: OrganizerEventOwnerDetail["payoutInfo"];
        },
    workspace: OrganizerWorkspace,
  ): OrganizerWorkspace {
    const event = detail.event;
    const workspaceEvent =
      "location" in event ? toWorkspaceEvent(event) : event;
    const ticketTiers = detail.ticketTypes.map((ticket) => ({
      id: ticket.id,
      eventId: workspaceEvent.id,
      name: ticket.name,
      price: ticket.price,
      capacity: ticket.quantity,
      soldCount: 0,
      saleStatus:
        ticket.saleStartAt &&
        new Date(ticket.saleStartAt).getTime() > Date.now()
          ? ("scheduled" as const)
          : ticket.saleEndAt &&
              new Date(ticket.saleEndAt).getTime() <= Date.now()
            ? ("ended" as const)
            : ("on_sale" as const),
      salesStartAt: ticket.saleStartAt ?? event.startAt,
      salesEndAt: ticket.saleEndAt ?? event.endAt,
      perOrderLimit: ticket.maxPerOrder ?? 4,
      ...(ticket.minPerOrder === undefined
        ? {}
        : { minPerOrder: ticket.minPerOrder }),
      ...(ticket.description == null
        ? {}
        : { description: ticket.description }),
      ...(ticket.image == null ? {} : { image: ticket.image }),
    }));
    return {
      ...workspace,
      events: workspace.events.map((item) =>
        item.id === workspaceEvent.id ? workspaceEvent : item,
      ),
      ticketTiers: [
        ...workspace.ticketTiers.filter(
          (tier) => tier.eventId !== workspaceEvent.id,
        ),
        ...ticketTiers,
      ],
      eventFinance: detail.payoutInfo
        ? { ...workspace.eventFinance, [workspaceEvent.id]: detail.payoutInfo }
        : workspace.eventFinance,
    };
  }

  function loadMine(currentGeneration: number) {
    const startedRevision = loadRevision;
    set({ loading: true, loadError: null });
    void api
      .findMine()
      .then(async (response) => {
        const events = response.data.events;
        if (currentGeneration !== generation) return;
        if (loadRevision !== startedRevision) {
          set({ loading: false, loadError: null });
          return;
        }
        let hydrated: OrganizerWorkspace = {
          ...snapshot.workspace,
          events: events.map(toWorkspaceEvent),
        };
        // Per-event detail hydration is best-effort: a single detail request failing must
        // not blank the whole event list or read as a whole-list failure. The event list
        // from findMine is published regardless; only the details that resolve are
        // hydrated, and a failed detail simply leaves that event without its tiers/finance.
        const details = await Promise.allSettled(
          events.map((event) => api.findMineById(event.id)),
        );
        if (
          currentGeneration !== generation ||
          loadRevision !== startedRevision
        )
          return;
        for (const outcome of details) {
          if (outcome.status === "fulfilled" && outcome.value)
            hydrated = hydrateDetail(
              {
                ...outcome.value.data,
                event: toWorkspaceEvent(outcome.value.data.event),
                ticketTypes: [],
                seatMap: null,
                payoutInfo: null,
              },
              hydrated,
            );
        }
        set({ workspace: hydrated, loading: false, loadError: null });
      })
      .catch((error) => {
        if (currentGeneration !== generation) return;
        if (loadRevision !== startedRevision) {
          set({ loading: false });
          return;
        }
        // A findMine failure is a genuine whole-list failure: never silently seed mock
        // events — surface it and keep the list empty.
        set({
          loading: false,
          loadError: errorMessage(error, DEFAULT_LOAD_ERROR),
        });
      });
  }

  function sync(next: OrganizerIdentity) {
    const sameUser =
      next.userId !== null &&
      next.userId === identity.userId &&
      next.status === "authenticated" &&
      identity.status === "authenticated";
    identity = {
      ...next,
      accessToken: next.accessToken || identity.accessToken,
    };
    if (sameUser) return; // a token refresh for the same user must not reset work or reload
    generation += 1;
    // Clear previously visible account data immediately, before any async load resolves.
    // The snapshot's userId records the account it belongs to so a stale view can be
    // detected and masked before the consuming component's sync effect runs.
    reportRequest += 1; // invalidate any in-flight report load for the previous account
    snapshot = {
      userId: next.status === "authenticated" ? next.userId : null,
      workspace: createEmptyOrganizerWorkspace(),
      lastOperation: null,
      isSaving: false,
      saveError: null,
      loading: false,
      loadError: null,
      report: EMPTY_REPORT_STATE,
    };
    console.log("[WorkspaceController] sync identity received:", next);
    emit();
    if (next.status === "authenticated" && next.accessToken && next.userId) {
      loadMine(generation);
    }
  }

  function requireToken(): string | null {
    if (identity.status !== "authenticated" || !identity.accessToken) {
      console.warn("[WorkspaceController] requireToken that bai!", {
        status: identity.status,
        hasAccessToken: Boolean(identity.accessToken),
        userId: identity.userId,
      });
      set({ saveError: NO_TOKEN_MESSAGE, lastOperation: null });
      return null;
    }
    return identity.accessToken;
  }

  async function createEvent(
    input: OrganizerEventInput,
    initialTicketTiers: readonly OrganizerInitialTicketTierInput[],
    finance?: OrganizerEventFinance,
  ) {
    console.log("[WorkspaceController] createEvent duoc goi:", {
      input,
      initialTicketTiers,
      finance,
    });
    const token = requireToken();
    if (!token) {
      console.warn(
        "[WorkspaceController] createEvent bi huy vi khong co token hop le!",
      );
      return null;
    }
    if (snapshot.isSaving) {
      console.warn(
        "[WorkspaceController] createEvent bi bo qua vi dang saving!",
      );
      return null;
    }
    const currentGeneration = generation;
    set({ isSaving: true, saveError: null });
    try {
      const payload = {
        title: input.title,
        startAt: input.startAt,
        endAt: input.endAt,
        venueName: input.venueName ?? input.venue,
        description: input.description ?? undefined,
        thumbnail: input.thumbnail,
        coverImage: input.coverImage,
        organizerName: input.organizerName,
        organizerBio: input.organizerBio,
        organizerLogo: input.organizerLogo,
        visibility: (input.visibility === "public"
          ? "PUBLIC"
          : input.visibility === "link_only"
            ? "LINK_ONLY"
            : undefined) as "PUBLIC" | "LINK_ONLY" | undefined,
        seatingChartImage: input.seatingChartImage,
        categoryId: input.categoryId ?? "",
        location:
          input.provinceId && input.street
            ? {
                address: input.street,
                provinceId: input.provinceId,
                wardId: input.wardId,
              }
            : undefined,
        tickets: initialTicketTiers.map((tier) => ({
          name: tier.name,
          price: tier.price,
          quantity: tier.capacity,
          minPerOrder: tier.minPerOrder ?? 1,
          maxPerOrder: tier.perOrderLimit,
          saleStartAt: tier.salesStartAt,
          saleEndAt: tier.salesEndAt,
          description: tier.description,
          image: tier.image,
        })),
        payoutInfo: finance,
      };
      console.log("[WorkspaceController] api.create payload:", payload);
      const created = (await api.create(payload)).data.event;
      console.log("[WorkspaceController] api.create thanh cong:", created);
      if (currentGeneration !== generation) return null; // user switched mid-flight; drop the result
      loadRevision += 1; // invalidate any in-flight load so it can't drop this created event
      const lastOperation: OrganizerOperationResult = {
        operation: "create_event",
        targetIds: { eventId: created.id },
        kind: "event_created",
      };
      set({
        isSaving: false,
        workspace: {
          ...snapshot.workspace,
          events: [toWorkspaceEvent(created), ...snapshot.workspace.events],
        },
        lastOperation,
      });
      try {
        const detail = (await api.findMineById(created.id)).data
          .event as OrganizerEventOwnerDetail["event"];
        if (currentGeneration === generation && detail) {
          set({
            workspace: hydrateDetail(
              {
                event: detail,
                ticketTypes: detail.ticketTypes ?? [],
                seatMap: detail.seatMap ?? null,
                payoutInfo: detail.payoutInfo ?? null,
              },
              snapshot.workspace,
            ),
          });
        }
      } catch {
        // The event was already created. Keep it visible if its follow-up detail read fails.
      }
      return lastOperation;
    } catch (error) {
      console.error("[WorkspaceController] api.create BI LOI:", error);
      if (currentGeneration !== generation) return null;
      set({
        isSaving: false,
        saveError: errorMessage(error, DEFAULT_SAVE_ERROR),
      });
      return null;
    }
  }

  async function updateEvent(
    eventId: string,
    patch: OrganizerEventPatch,
    finance?: OrganizerEventFinance,
  ) {
    const token = requireToken();
    if (!token) return null;
    if (snapshot.isSaving) return null;
    const currentGeneration = generation;
    set({ isSaving: true, saveError: null });
    try {
      // Finance is NOT part of the event body: UpdateEventDto rejects payoutInfo/location.
      // The event scalars go through PATCH /events/:id; finance goes through its own
      // POST /events/:id/payout. Both must succeed to report event_updated — a payout
      // failure surfaces an error rather than a false full success.
      const updated = (await api.update(eventId, toEventUpdatePayload(patch)))
        .data.event;
      if (finance) await api.setPayout(eventId, finance);
      if (currentGeneration !== generation) return null;
      loadRevision += 1;
      const lastOperation: OrganizerOperationResult = {
        operation: "update_event",
        targetIds: { eventId },
        kind: "event_updated",
      };
      set({
        isSaving: false,
        workspace: {
          ...snapshot.workspace,
          events: snapshot.workspace.events.map((item) =>
            item.id === eventId ? toWorkspaceEvent(updated) : item,
          ),
        },
        lastOperation,
      });
      return lastOperation;
    } catch (error) {
      if (currentGeneration !== generation) return null;
      set({
        isSaving: false,
        saveError: errorMessage(error, DEFAULT_SAVE_ERROR),
      });
      return null;
    }
  }

  async function submitEventReview(eventId: string) {
    const token = requireToken();
    if (!token) return null;
    const currentGeneration = generation;
    set({ saveError: null });
    try {
      const updated = (await api.submitReview(eventId)).data.event;
      if (currentGeneration !== generation) return null;
      const lastOperation: OrganizerOperationResult = {
        operation: "submit_event_review",
        targetIds: { eventId },
        kind: "event_review_submitted",
      };
      set({
        workspace: {
          ...snapshot.workspace,
          events: snapshot.workspace.events.map((item) =>
            item.id === eventId ? toWorkspaceEvent(updated) : item,
          ),
        },
        lastOperation,
      });
      return lastOperation;
    } catch (error) {
      if (currentGeneration !== generation) return null;
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) });
      return null;
    }
  }

  async function saveTicketTier(tier: OrganizerTicketTier) {
    const token = requireToken();
    if (!token) return null;
    const currentGeneration = generation;
    set({ saveError: null });
    const existing = snapshot.workspace.ticketTiers.find(
      (item) => item.id === tier.id,
    );
    const payload = {
      eventId: tier.eventId,
      name: tier.name,
      price: tier.price,
      quantity: tier.capacity,
      description: tier.description,
      image: tier.image,
      maxPerOrder: tier.perOrderLimit,
      minPerOrder: tier.minPerOrder ?? 1,
      saleStartAt: tier.salesStartAt,
      saleEndAt: tier.salesEndAt,
    };
    try {
      const saved = existing
        ? (await api.updateTicketType(tier.id, payload)).data.ticketType
        : (await api.createTicketType(payload)).data.ticketType;
      if (currentGeneration !== generation) return null;
      const savedTier = {
        ...tier,
        id: saved?.id ?? tier.id,
        image: saved?.image ?? tier.image,
      };
      const transition = organizerWorkspaceReducer(snapshot.workspace, {
        type: "upsert_ticket_tier",
        tier: savedTier,
        currentAt: new Date().toISOString(),
      });
      set({ workspace: transition.state, lastOperation: transition.result });
      return transition.result;
    } catch (error) {
      if (currentGeneration !== generation) return null;
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) });
      return null;
    }
  }

  async function updateEventImage(
    eventId: string,
    field: "seatingChartImage",
    value: string,
  ) {
    const token = requireToken();
    if (!token) return null;
    const currentGeneration = generation;
    set({ saveError: null });
    try {
      const updated = (await api.update(eventId, { [field]: value })).data
        .event;
      if (currentGeneration !== generation) return null;
      const lastOperation: OrganizerOperationResult = {
        operation: "update_event",
        targetIds: { eventId },
        kind: "event_updated",
      };
      set({
        workspace: {
          ...snapshot.workspace,
          events: snapshot.workspace.events.map((item) =>
            item.id === eventId ? toWorkspaceEvent(updated) : item,
          ),
        },
        lastOperation,
      });
      return lastOperation;
    } catch (error) {
      if (currentGeneration !== generation) return null;
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) });
      return null;
    }
  }

  async function loadEventReport(
    eventId: string,
    range?: OrganizerReportRangeInput,
  ): Promise<OrganizerEventReport | null> {
    const token = requireToken();
    if (!token) return null;
    const currentGeneration = generation;
    const requestId = (reportRequest += 1);
    // Preserve any existing data while reloading so the picker selection and chart do
    // not flash empty between requests; only overwrite once the fresh result arrives.
    set({
      report: { ...snapshot.report, eventId, loading: true, error: null },
    });
    try {
      const data = (await api.reporting(eventId, range)).data.report;
      if (currentGeneration !== generation || requestId !== reportRequest)
        return null;
      set({ report: { eventId, loading: false, error: null, data } });
      return data;
    } catch (error) {
      if (currentGeneration !== generation || requestId !== reportRequest)
        return null;
      set({
        report: {
          eventId,
          loading: false,
          error: errorMessage(error, DEFAULT_LOAD_ERROR),
          data: null,
        },
      });
      return null;
    }
  }

  function reportUnsupported(
    operation: OrganizerOperationName,
    targetIds: Readonly<Record<string, string>>,
  ) {
    const result = unsupported(operation, targetIds);
    set({ lastOperation: result });
    return result;
  }

  return {
    sync,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => snapshot,
    retry() {
      if (identity.status === "authenticated" && identity.accessToken)
        loadMine(generation);
    },
    createEvent,
    updateEvent,
    submitEventReview,
    saveTicketTier,
    updateEventImage,
    loadEventReport,
    // No backend for these operations — never claim persistence, never mutate data.
    publishEvent: (eventId: string) =>
      reportUnsupported("publish_event", { eventId }),
    setTicketSaleStatus: (tierId: string) =>
      reportUnsupported("set_ticket_sale_status", { ticketTierId: tierId }),
    checkInAttendee: (eventId: string, attendeeId: string) =>
      reportUnsupported("check_in_attendee", { eventId, attendeeId }),
    updateOrganization: () =>
      reportUnsupported("update_organization", {
        organizationId: snapshot.workspace.organization.id,
      }),
    clearLastOperation: () => {
      if (snapshot.lastOperation !== null) set({ lastOperation: null });
      return null;
    },
  };
}
