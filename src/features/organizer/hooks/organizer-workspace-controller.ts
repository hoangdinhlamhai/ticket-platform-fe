import { ApiError } from '../../auth/api/api-error.ts'
import type { EventApi } from '../../auth/api/event-api.ts'
import { createEmptyOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import { organizerWorkspaceReducer } from '../helpers/organizer-workspace-reducer.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'
import type { OrganizerEventFinance, OrganizerEventInput, OrganizerEventPatch } from '../types/organizer-event.ts'
import type { OrganizerOrganizationPatch } from '../types/organizer-organization.ts'
import type {
  OrganizerInitialTicketTierInput,
  OrganizerOperationName,
  OrganizerOperationResult,
  OrganizerWorkspace,
} from '../types/organizer-workspace.ts'

export type OrganizerWorkspaceController = {
  readonly workspace: OrganizerWorkspace
  readonly lastOperation: OrganizerOperationResult | null
  readonly isSaving: boolean
  readonly saveError: string | null
  readonly loading: boolean
  readonly loadError: string | null
  readonly retry: () => void
  readonly createEvent: (input: OrganizerEventInput, initialTicketTiers: readonly OrganizerInitialTicketTierInput[], finance?: OrganizerEventFinance) => Promise<OrganizerOperationResult | null>
  readonly updateEvent: (eventId: string, patch: OrganizerEventPatch, finance?: OrganizerEventFinance) => Promise<OrganizerOperationResult | null>
  readonly submitEventReview: (eventId: string) => Promise<OrganizerOperationResult | null>
  readonly publishEvent: (eventId: string) => OrganizerOperationResult | null
  readonly saveTicketTier: (tier: OrganizerTicketTier) => Promise<OrganizerOperationResult | null>
  readonly updateEventImage: (eventId: string, field: 'seatingChartImage', value: string) => Promise<OrganizerOperationResult | null>
  readonly setTicketSaleStatus: (tierId: string, status: OrganizerTicketTier['saleStatus']) => OrganizerOperationResult | null
  readonly checkInAttendee: (eventId: string, attendeeId: string) => OrganizerOperationResult | null
  readonly updateOrganization: (patch: OrganizerOrganizationPatch) => OrganizerOperationResult | null
  readonly clearLastOperation: () => OrganizerOperationResult | null
}

export type OrganizerAuthStatus = 'restoring' | 'anonymous' | 'authenticated'
export type OrganizerIdentity = { readonly userId: string | null; readonly accessToken: string | null; readonly status: OrganizerAuthStatus }

export type OrganizerWorkspaceSnapshot = {
  // The auth user the snapshot's data belongs to. The React hook syncs identity in
  // an effect, so on the first render after an account switch useSyncExternalStore
  // still returns the previous owner's snapshot; comparing this to the current auth
  // user lets the view be masked before that effect runs.
  readonly userId: string | null
  readonly workspace: OrganizerWorkspace
  readonly lastOperation: OrganizerOperationResult | null
  readonly isSaving: boolean
  readonly saveError: string | null
  readonly loading: boolean
  readonly loadError: string | null
}

const NO_TOKEN_MESSAGE = 'Bạn cần đăng nhập bằng tài khoản người dùng để thực hiện thao tác này.'
const UNSUPPORTED_MESSAGE = 'Thao tác này chưa được hỗ trợ trên máy chủ.'
const DEFAULT_SAVE_ERROR = 'Không thể lưu sự kiện. Vui lòng thử lại.'
const DEFAULT_LOAD_ERROR = 'Không thể tải sự kiện của bạn. Vui lòng thử lại.'

const STALE_IDENTITY_WORKSPACE = createEmptyOrganizerWorkspace()

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
  if (snapshot.userId === currentUserId) return snapshot
  return {
    userId: currentUserId,
    workspace: STALE_IDENTITY_WORKSPACE,
    lastOperation: null,
    isSaving: false,
    saveError: null,
    loading: currentUserId !== null,
    loadError: null,
  }
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message || fallback
  if (error instanceof Error) return error.message || fallback
  return fallback
}

function unsupported(operation: OrganizerOperationName, targetIds: Readonly<Record<string, string>>): OrganizerOperationResult {
  return { operation, targetIds, kind: 'action_not_supported', reason: UNSUPPORTED_MESSAGE }
}

type Options = { api: EventApi }

export function createOrganizerWorkspaceController({ api }: Options) {
  let identity: OrganizerIdentity = { userId: null, accessToken: null, status: 'anonymous' }
  let generation = 0
  // Bumped whenever a local mutation changes the events list. An in-flight mine
  // load captures the revision it started at and applies its result only if the
  // revision is unchanged; otherwise a load that began before a successful create
  // would resolve late and drop the just-created event.
  let loadRevision = 0
  let snapshot: OrganizerWorkspaceSnapshot = {
    userId: null,
    workspace: createEmptyOrganizerWorkspace(),
    lastOperation: null,
    isSaving: false,
    saveError: null,
    loading: false,
    loadError: null,
  }
  const listeners = new Set<() => void>()

  function emit() { listeners.forEach((listener) => listener()) }
  function set(next: Partial<OrganizerWorkspaceSnapshot>) { snapshot = { ...snapshot, ...next }; emit() }

  function loadMine(currentGeneration: number, token: string) {
    const startedRevision = loadRevision
    set({ loading: true, loadError: null })
    void api.findMine(token).then((events) => {
      if (currentGeneration !== generation) return
      // A local mutation (e.g. a successful create) happened after this load began,
      // so its response is stale for the events list — keep the mutated list. Still
      // clear the loading flag so the UI does not appear stuck.
      if (loadRevision !== startedRevision) { set({ loading: false, loadError: null }); return }
      set({ workspace: { ...snapshot.workspace, events: events.map((event) => ({ ...event })) }, loading: false, loadError: null })
    }).catch((error) => {
      if (currentGeneration !== generation) return
      if (loadRevision !== startedRevision) { set({ loading: false }); return }
      // Never silently seed mock events on a load failure — surface it and keep the list empty.
      set({ loading: false, loadError: errorMessage(error, DEFAULT_LOAD_ERROR) })
    })
  }

  function sync(next: OrganizerIdentity) {
    const sameUser = next.userId !== null && next.userId === identity.userId && next.status === 'authenticated' && identity.status === 'authenticated'
    identity = {
      ...next,
      accessToken: next.accessToken || identity.accessToken,
    }
    if (sameUser) return // a token refresh for the same user must not reset work or reload
    generation += 1
    // Clear previously visible account data immediately, before any async load resolves.
    // The snapshot's userId records the account it belongs to so a stale view can be
    // detected and masked before the consuming component's sync effect runs.
    snapshot = {
      userId: next.status === 'authenticated' ? next.userId : null,
      workspace: createEmptyOrganizerWorkspace(),
      lastOperation: null,
      isSaving: false,
      saveError: null,
      loading: false,
      loadError: null,
    }
    console.log('[WorkspaceController] sync identity received:', next)
    emit()
    if (next.status === 'authenticated' && next.accessToken && next.userId) {
      loadMine(generation, next.accessToken)
    }
  }

  function requireToken(): string | null {
    if (identity.status !== 'authenticated' || !identity.accessToken) {
      console.warn('[WorkspaceController] requireToken that bai!', {
        status: identity.status,
        hasAccessToken: Boolean(identity.accessToken),
        userId: identity.userId,
      })
      set({ saveError: NO_TOKEN_MESSAGE, lastOperation: null })
      return null
    }
    return identity.accessToken
  }

  async function createEvent(input: OrganizerEventInput, initialTicketTiers: readonly OrganizerInitialTicketTierInput[], finance?: OrganizerEventFinance) {
    console.log('[WorkspaceController] createEvent duoc goi:', { input, initialTicketTiers, finance })
    const token = requireToken()
    if (!token) {
      console.warn('[WorkspaceController] createEvent bi huy vi khong co token hop le!')
      return null
    }
    if (snapshot.isSaving) {
      console.warn('[WorkspaceController] createEvent bi bo qua vi dang saving!')
      return null
    }
    const currentGeneration = generation
    set({ isSaving: true, saveError: null })
    try {
      const payload = {
        ...input,
        initialTicketTiers,
        finance,
        // Never send organizerId — the server derives ownership from the token.
        categoryId: input.categoryId ?? '',
        location: input.provinceId && input.street ? { address: input.street, provinceId: input.provinceId, wardId: input.wardId } : undefined,
        locationId: undefined,
      }
      console.log('[WorkspaceController] api.create payload:', payload)
      const created = await api.create(token, payload)
      console.log('[WorkspaceController] api.create thanh cong:', created)
      if (currentGeneration !== generation) return null // user switched mid-flight; drop the result
      loadRevision += 1 // invalidate any in-flight load so it can't drop this created event
      const lastOperation: OrganizerOperationResult = { operation: 'create_event', targetIds: { eventId: created.id }, kind: 'event_created' }
      set({ isSaving: false, workspace: { ...snapshot.workspace, events: [created, ...snapshot.workspace.events] }, lastOperation })
      return lastOperation
    } catch (error) {
      console.error('[WorkspaceController] api.create BI LOI:', error)
      if (currentGeneration !== generation) return null
      set({ isSaving: false, saveError: errorMessage(error, DEFAULT_SAVE_ERROR) })
      return null
    }
  }

  async function updateEvent(eventId: string, patch: OrganizerEventPatch, finance?: OrganizerEventFinance) {
    const token = requireToken()
    if (!token) return null
    if (snapshot.isSaving) return null
    const currentGeneration = generation
    set({ isSaving: true, saveError: null })
    try {
      // Finance is NOT part of the event body: UpdateEventDto rejects payoutInfo/location.
      // The event scalars go through PATCH /events/:id; finance goes through its own
      // POST /events/:id/payout. Both must succeed to report event_updated — a payout
      // failure surfaces an error rather than a false full success.
      const updated = await api.update(token, eventId, patch)
      if (finance) await api.setPayout(token, eventId, finance)
      if (currentGeneration !== generation) return null
      loadRevision += 1
      const lastOperation: OrganizerOperationResult = { operation: 'update_event', targetIds: { eventId }, kind: 'event_updated' }
      set({ isSaving: false, workspace: { ...snapshot.workspace, events: snapshot.workspace.events.map((item) => item.id === eventId ? updated : item) }, lastOperation })
      return lastOperation
    } catch (error) {
      if (currentGeneration !== generation) return null
      set({ isSaving: false, saveError: errorMessage(error, DEFAULT_SAVE_ERROR) })
      return null
    }
  }

  async function submitEventReview(eventId: string) {
    const token = requireToken()
    if (!token) return null
    const currentGeneration = generation
    set({ saveError: null })
    try {
      const updated = await api.submitReview(token, eventId)
      if (currentGeneration !== generation) return null
      const lastOperation: OrganizerOperationResult = { operation: 'submit_event_review', targetIds: { eventId }, kind: 'event_review_submitted' }
      set({ workspace: { ...snapshot.workspace, events: snapshot.workspace.events.map((item) => item.id === eventId ? updated : item) }, lastOperation })
      return lastOperation
    } catch (error) {
      if (currentGeneration !== generation) return null
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) })
      return null
    }
  }

  async function saveTicketTier(tier: OrganizerTicketTier) {
    const token = requireToken()
    if (!token) return null
    const currentGeneration = generation
    set({ saveError: null })
    const existing = snapshot.workspace.ticketTiers.find((item) => item.id === tier.id)
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
    }
    try {
      const saved = (existing
        ? await api.updateTicketType(token, tier.id, payload)
        : await api.createTicketType(token, payload)) as { id?: string; image?: string | null }
      if (currentGeneration !== generation) return null
      const savedTier = { ...tier, id: saved?.id ?? tier.id, image: saved?.image ?? tier.image }
      const transition = organizerWorkspaceReducer(snapshot.workspace, { type: 'upsert_ticket_tier', tier: savedTier, currentAt: new Date().toISOString() })
      set({ workspace: transition.state, lastOperation: transition.result })
      return transition.result
    } catch (error) {
      if (currentGeneration !== generation) return null
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) })
      return null
    }
  }

  async function updateEventImage(eventId: string, field: 'seatingChartImage', value: string) {
    const token = requireToken()
    if (!token) return null
    const currentGeneration = generation
    set({ saveError: null })
    try {
      const updated = await api.update(token, eventId, { [field]: value })
      if (currentGeneration !== generation) return null
      const lastOperation: OrganizerOperationResult = { operation: 'update_event', targetIds: { eventId }, kind: 'event_updated' }
      set({ workspace: { ...snapshot.workspace, events: snapshot.workspace.events.map((item) => item.id === eventId ? updated : item) }, lastOperation })
      return lastOperation
    } catch (error) {
      if (currentGeneration !== generation) return null
      set({ saveError: errorMessage(error, DEFAULT_SAVE_ERROR) })
      return null
    }
  }

  function reportUnsupported(operation: OrganizerOperationName, targetIds: Readonly<Record<string, string>>) {
    const result = unsupported(operation, targetIds)
    set({ lastOperation: result })
    return result
  }

  return {
    sync,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener) } },
    getSnapshot: () => snapshot,
    retry() {
      if (identity.status === 'authenticated' && identity.accessToken) loadMine(generation, identity.accessToken)
    },
    createEvent,
    updateEvent,
    submitEventReview,
    saveTicketTier,
    updateEventImage,
    // No backend for these operations — never claim persistence, never mutate data.
    publishEvent: (eventId: string) => reportUnsupported('publish_event', { eventId }),
    setTicketSaleStatus: (tierId: string) => reportUnsupported('set_ticket_sale_status', { ticketTierId: tierId }),
    checkInAttendee: (eventId: string, attendeeId: string) => reportUnsupported('check_in_attendee', { eventId, attendeeId }),
    updateOrganization: () => reportUnsupported('update_organization', { organizationId: snapshot.workspace.organization.id }),
    clearLastOperation: () => { if (snapshot.lastOperation !== null) set({ lastOperation: null }); return null },
  }
}
