import { useCallback, useEffect, useRef, useState } from 'react'
import { useAttendeeAuth } from '../../auth/hooks/use-attendee-auth.ts'
import { createEventApi, dataUrlFile } from '../../auth/api/event-api.ts'
import { organizerWorkspaceReducer } from '../helpers/organizer-workspace-reducer.ts'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'
import type { OrganizerEventFinance, OrganizerEventInput, OrganizerEventPatch } from '../types/organizer-event.ts'
import type { OrganizerOrganizationPatch } from '../types/organizer-organization.ts'
import type { OrganizerWorkspaceController } from './organizer-workspace-controller.ts'
import type {
  OrganizerInitialTicketTierInput,
  OrganizerOperationResult,
  OrganizerWorkspace,
  OrganizerWorkspaceAction,
} from '../types/organizer-workspace.ts'

const eventApi = createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })

type OrganizerWorkspaceHookState = {
  readonly workspace: OrganizerWorkspace
  readonly lastOperation: OrganizerOperationResult | null
}

function createInitialOrganizerWorkspaceState(): OrganizerWorkspaceHookState {
  return { workspace: createOrganizerWorkspace(), lastOperation: null }
}

function reduceOrganizerWorkspace(
  current: OrganizerWorkspaceHookState,
  action: OrganizerWorkspaceAction,
): OrganizerWorkspaceHookState {
  const transition = organizerWorkspaceReducer(current.workspace, action)
  return { workspace: transition.state, lastOperation: transition.result }
}

export function useOrganizerWorkspace(): OrganizerWorkspaceController {
  const [state, setState] = useState(createInitialOrganizerWorkspaceState)
  const stateRef = useRef(state)
  const auth = useAttendeeAuth(true)
  const api = eventApi
  useEffect(() => {
    if (!auth.accessToken) return
    void Promise.all([api.findMine(auth.accessToken), api.categories(auth.accessToken), api.locations(auth.accessToken)]).then(([events, categories, locations]) => {
      catalogRef.current = { categoryId: categories[0]?.id, locationId: locations[0]?.id }
      const next = { ...stateRef.current, workspace: { ...stateRef.current.workspace, events } }
      stateRef.current = next
      setState(next)
    }).catch(() => {})
  }, [auth.accessToken, api])
  const catalogRef = useRef<{ categoryId?: string; locationId?: string }>({})

  const runAction = useCallback((action: OrganizerWorkspaceAction) => {
    const nextState = reduceOrganizerWorkspace(stateRef.current, action)
    stateRef.current = nextState
    setState(nextState)
    return nextState.lastOperation
  }, [])

  const createEvent = useCallback(
    async (input: OrganizerEventInput, initialTicketTiers: readonly OrganizerInitialTicketTierInput[], finance?: OrganizerEventFinance) => {
      if (!auth.accessToken) return runAction({ type: 'create_event', input, initialTicketTiers, finance })
      try {
        const event = await api.create(auth.accessToken, { ...input, categoryId: catalogRef.current.categoryId ?? '', locationId: catalogRef.current.locationId ?? '' })
        const next = { ...stateRef.current, workspace: { ...stateRef.current.workspace, events: [event, ...stateRef.current.workspace.events] }, lastOperation: { operation: 'create_event' as const, targetIds: { eventId: event.id }, kind: 'event_created' as const } }
        stateRef.current = next; setState(next); return next.lastOperation
      } catch { return runAction({ type: 'create_event', input, initialTicketTiers, finance }) }
    }, [api, auth.accessToken, runAction],
  )
  const updateEvent = useCallback(
    async (eventId: string, patch: OrganizerEventPatch, finance?: OrganizerEventFinance) => {
      if (!auth.accessToken) return runAction({ type: 'update_event', eventId, patch, finance })
      try {
        const event = await api.update(auth.accessToken, eventId, { ...patch, categoryId: patch.provinceId, locationId: patch.wardId })
        const next = { ...stateRef.current, workspace: { ...stateRef.current.workspace, events: stateRef.current.workspace.events.map((item) => item.id === eventId ? event : item) }, lastOperation: { operation: 'update_event' as const, targetIds: { eventId }, kind: 'event_updated' as const } }
        stateRef.current = next; setState(next); return next.lastOperation
      } catch { return runAction({ type: 'update_event', eventId, patch, finance }) }
    }, [api, auth.accessToken, runAction],
  )
  const submitEventReview = useCallback(async (eventId: string) => {
    if (!auth.accessToken) return runAction({ type: 'submit_event_review', eventId })
    try {
      const event = await api.submitReview(auth.accessToken, eventId)
      const next = { ...stateRef.current, workspace: { ...stateRef.current.workspace, events: stateRef.current.workspace.events.map((item) => item.id === eventId ? event : item) }, lastOperation: { operation: 'submit_event_review' as const, targetIds: { eventId }, kind: 'event_review_submitted' as const } }
      stateRef.current = next; setState(next); return next.lastOperation
    } catch { return runAction({ type: 'submit_event_review', eventId }) }
  }, [api, auth.accessToken, runAction])

  const publishEvent = useCallback(
    (eventId: string) => runAction({ type: 'publish_event', eventId }),
    [runAction],
  )
  const saveTicketTier = useCallback(
    async (tier: OrganizerTicketTier) => {
      if (!auth.accessToken) {
        return runAction({ type: 'upsert_ticket_tier', tier, currentAt: new Date().toISOString() })
      }

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
      const saved = await api.createTicketType(auth.accessToken, payload) as { id: string; image?: string | null }
      return runAction({
        type: 'upsert_ticket_tier',
        tier: { ...tier, id: saved.id, image: saved.image ?? tier.image },
        currentAt: new Date().toISOString(),
      })
    }, [api, auth.accessToken, runAction],
  )
  const updateEventImage = useCallback(async (eventId: string, field: 'seatingChartImage', value: string) => {
    if (!auth.accessToken || !value) return runAction({ type: 'update_event', eventId, patch: { [field]: value }, finance: undefined })
    const file = dataUrlFile(value, 'seating-chart.img')
    try {
      const nextValue = file ? await api.uploadImage(auth.accessToken, file) : value
      const result = await api.update(auth.accessToken, eventId, { [field]: nextValue, categoryId: catalogRef.current.categoryId ?? '', locationId: catalogRef.current.locationId ?? '' })
      const next = { ...stateRef.current, workspace: { ...stateRef.current.workspace, events: stateRef.current.workspace.events.map((item) => item.id === eventId ? result : item) }, lastOperation: { operation: 'update_event' as const, targetIds: { eventId }, kind: 'event_updated' as const } }
      stateRef.current = next; setState(next); return next.lastOperation
    } catch { return null }
  }, [api, auth.accessToken, runAction])
  const setTicketSaleStatus = useCallback(
    (tierId: string, status: OrganizerTicketTier['saleStatus']) =>
      runAction({
        type: 'set_ticket_sale_status',
        tierId,
        status,
        currentAt: new Date().toISOString(),
      }),
    [runAction],
  )
  const checkInAttendee = useCallback(
    (eventId: string, attendeeId: string) =>
      runAction({
        type: 'check_in_attendee',
        eventId,
        attendeeId,
        checkedInAt: new Date().toISOString(),
      }),
    [runAction],
  )
  const updateOrganization = useCallback(
    (patch: OrganizerOrganizationPatch) => runAction({ type: 'update_organization', patch }),
    [runAction],
  )
  const clearLastOperation = useCallback(
    () => runAction({ type: 'clear_last_operation' }),
    [runAction],
  )

  return {
    workspace: state.workspace,
    lastOperation: state.lastOperation,
    createEvent,
    updateEvent,
    submitEventReview,
    publishEvent,
    saveTicketTier,
    updateEventImage,
    setTicketSaleStatus,
    checkInAttendee,
    updateOrganization,
    clearLastOperation,
  }
}
