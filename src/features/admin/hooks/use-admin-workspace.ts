import { useCallback, useRef, useState } from 'react'
import { adminWorkspaceReducer } from '../helpers/admin-workspace-reducer.ts'
import { createAdminWorkspace } from '../mock/create-admin-workspace.ts'
import type { AdminWorkspaceAction } from '../types/admin-workspace.ts'
import type { AdminWorkspaceController } from './admin-workspace-controller.ts'

type HookState = { readonly workspace: ReturnType<typeof createAdminWorkspace>; readonly lastOperation: AdminWorkspaceController['lastOperation'] }
function initialState(): HookState { return { workspace: createAdminWorkspace(), lastOperation: null } }
function withOperationFields<T extends Omit<AdminWorkspaceAction, 'occurredAt' | 'auditId'>>(action: T) { return { ...action, occurredAt: new Date().toISOString(), auditId: crypto.randomUUID() } as AdminWorkspaceAction }

export function useAdminWorkspace(): AdminWorkspaceController {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)
  const run = useCallback((action: AdminWorkspaceAction) => {
    const transition = adminWorkspaceReducer(stateRef.current.workspace, action)
    const next = { workspace: transition.state, lastOperation: transition.result }
    stateRef.current = next
    setState(next)
    return transition.result
  }, [])
  const dispatched = useCallback(<T extends Omit<AdminWorkspaceAction, 'occurredAt' | 'auditId'>>(action: T) => run(withOperationFields(action)), [run])
  return {
    workspace: state.workspace,
    lastOperation: state.lastOperation,
    reviewEvent: (eventId, decision, reason) => dispatched({ type: 'review_event', eventId, decision, reason }),
    decideOrganizerVerification: (organizerId, decision, reason) => dispatched({ type: 'decide_organizer_verification', organizerId, decision, reason }),
    setOrganizerAccountStatus: (organizerId, status, reason) => dispatched({ type: 'set_organizer_account_status', organizerId, status, reason }),
    setUserAccountStatus: (userId, status, reason) => dispatched({ type: 'set_user_account_status', userId, status, reason }),
    setResaleVisibility: (listingId, visibility, reason) => dispatched({ type: 'set_resale_visibility', listingId, visibility, reason }),
    updateCaseStatus: (caseId, status, resolution) => dispatched({ type: 'update_case_status', caseId, status, resolution }),
    decideRefund: (refundId, status, reason) => dispatched({ type: 'decide_refund', refundId, status, reason }),
    setPayoutStatus: (payoutId, status, reason) => dispatched({ type: 'set_payout_status', payoutId, status, reason }),
    updateCategory: (categoryId, patch) => dispatched({ type: 'update_category', categoryId, patch }),
    updateModerationSettings: (checklist, reasons) => dispatched({ type: 'update_moderation_settings', checklist, reasons }),
    clearLastOperation: () => run({ type: 'clear_last_operation' }),
  }
}
