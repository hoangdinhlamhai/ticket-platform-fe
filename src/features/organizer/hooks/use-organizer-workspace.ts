import { useCallback, useRef, useState } from 'react'
import { organizerWorkspaceReducer } from '../helpers/organizer-workspace-reducer.ts'
import { createOrganizerWorkspace } from '../mock/create-organizer-workspace.ts'
import type { OrganizerTicketTier } from '../types/organizer-commerce.ts'
import type { OrganizerEventInput, OrganizerEventPatch } from '../types/organizer-event.ts'
import type { OrganizerOrganizationPatch } from '../types/organizer-organization.ts'
import type { OrganizerWorkspaceController } from './organizer-workspace-controller.ts'
import type {
  OrganizerInitialTicketTierInput,
  OrganizerOperationResult,
  OrganizerWorkspace,
  OrganizerWorkspaceAction,
} from '../types/organizer-workspace.ts'

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

  const runAction = useCallback((action: OrganizerWorkspaceAction) => {
    const nextState = reduceOrganizerWorkspace(stateRef.current, action)
    stateRef.current = nextState
    setState(nextState)
    return nextState.lastOperation
  }, [])

  const createEvent = useCallback(
    (input: OrganizerEventInput, initialTicketTier: OrganizerInitialTicketTierInput) =>
      runAction({ type: 'create_event', input, initialTicketTier }),
    [runAction],
  )
  const updateEvent = useCallback(
    (eventId: string, patch: OrganizerEventPatch) =>
      runAction({ type: 'update_event', eventId, patch }),
    [runAction],
  )
  const submitEventReview = useCallback(
    (eventId: string) => runAction({ type: 'submit_event_review', eventId }),
    [runAction],
  )
  const publishEvent = useCallback(
    (eventId: string) => runAction({ type: 'publish_event', eventId }),
    [runAction],
  )
  const saveTicketTier = useCallback(
    (tier: OrganizerTicketTier) =>
      runAction({
        type: 'upsert_ticket_tier',
        tier,
        currentAt: new Date().toISOString(),
      }),
    [runAction],
  )
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
    setTicketSaleStatus,
    checkInAttendee,
    updateOrganization,
    clearLastOperation,
  }
}
