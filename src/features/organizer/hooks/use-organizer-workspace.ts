import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import { useAttendeeAuth } from '../../auth/hooks/use-attendee-auth.ts'
import { createEventApi, dataUrlFile } from '../../auth/api/event-api.ts'
import { createOrganizerWorkspaceController, maskOrganizerWorkspaceView } from './organizer-workspace-controller.ts'
import type { OrganizerWorkspaceController } from './organizer-workspace-controller.ts'

// Single module-level controller: it holds server-backed organizer state and is
// the only persistence path. It reuses the existing auth session singleton for
// identity via sync(); it never creates a second session controller or token store.
const controller = createOrganizerWorkspaceController({
  api: createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch }),
})

// Shared instance used by the seating-chart image upload flow, which must upload a
// data URL to the backend before persisting the returned URL through the controller.
const uploadApi = createEventApi({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api', fetch: globalThis.fetch })

const NO_ACTIVE_IDENTITY_MESSAGE = 'Bạn cần đăng nhập bằng tài khoản người dùng để thực hiện thao tác này.'

export function useOrganizerWorkspace(): OrganizerWorkspaceController {
  const rawSnapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot)
  const auth = useAttendeeAuth(true)
  const currentUserId = auth.status === 'authenticated' ? (auth.user?.id ?? null) : null

  // Feed the auth session's identity into the controller. userId changes clear and
  // reload; a token-only change (refresh) keeps same-user work; logout/anonymous clears.
  useEffect(() => {
    console.log('[OrganizerWorkspace] useEffect sync identity:', {
      authStatus: auth.status,
      user: auth.user,
      hasToken: Boolean(auth.accessToken),
      currentUserId,
    })
    controller.sync({ userId: currentUserId, accessToken: auth.accessToken, status: auth.status })
  }, [currentUserId, auth.accessToken, auth.status])

  // The sync above runs in an effect, so on the first render after an account switch
  // or logout the store still holds the previous account's snapshot. Mask it against
  // the current auth user so no stale data is shown before the effect flushes.
  const snapshot = maskOrganizerWorkspaceView(rawSnapshot, currentUserId)
  // A masked view means the store snapshot does not yet belong to the current user;
  // action closures must not run against the wrong account until sync() has caught up.
  const identityStale = snapshot !== rawSnapshot

  console.log('[OrganizerWorkspace] render snapshot:', {
    authStatus: auth.status,
    authUserId: auth.user?.id,
    userRole: auth.user?.role,
    hasToken: Boolean(auth.accessToken),
    currentUserId,
    rawSnapshotUserId: rawSnapshot.userId,
    identityStale,
    saveError: identityStale ? NO_ACTIVE_IDENTITY_MESSAGE : snapshot.saveError,
  })

  const updateEventImage = useCallback(async (eventId: string, field: 'seatingChartImage', value: string) => {
    if (identityStale) return null
    // Resolve a data URL to an uploaded URL first, then persist through the controller.
    if (value && auth.accessToken) {
      const file = dataUrlFile(value, 'seating-chart.img')
      if (file) {
        try {
          const url = await uploadApi.uploadImage(auth.accessToken, file)
          return controller.updateEventImage(eventId, field, url)
        } catch {
          return null
        }
      }
    }
    return controller.updateEventImage(eventId, field, value)
  }, [auth.accessToken, identityStale])

  return useMemo<OrganizerWorkspaceController>(() => {
    // While identity is stale, gate every mutation so a closure captured on the previous
    // render cannot mutate the newly signed-in (or logged-out) account. Reads stay masked.
    const blockedAsync = async (...args: unknown[]) => {
      console.warn('[OrganizerWorkspace] THAO TAC BI CHAN (identityStale = true)!', {
        identityStale,
        authStatus: auth.status,
        currentUserId,
        rawSnapshotUserId: rawSnapshot.userId,
        args,
      })
      return null
    }
    const blockedSync = (...args: unknown[]) => {
      console.warn('[OrganizerWorkspace] THAO TAC SYNC BI CHAN (identityStale = true)!', args)
      return null
    }
    return {
      workspace: snapshot.workspace,
      lastOperation: snapshot.lastOperation,
      isSaving: snapshot.isSaving,
      saveError: identityStale ? NO_ACTIVE_IDENTITY_MESSAGE : snapshot.saveError,
      loading: snapshot.loading,
      loadError: snapshot.loadError,
      retry: identityStale ? blockedSync : controller.retry,
      createEvent: identityStale ? blockedAsync : controller.createEvent,
      updateEvent: identityStale ? blockedAsync : controller.updateEvent,
      submitEventReview: identityStale ? blockedAsync : controller.submitEventReview,
      publishEvent: identityStale ? blockedSync : controller.publishEvent,
      saveTicketTier: identityStale ? blockedAsync : controller.saveTicketTier,
      updateEventImage: identityStale ? blockedAsync : updateEventImage,
      setTicketSaleStatus: identityStale ? blockedSync : controller.setTicketSaleStatus,
      checkInAttendee: identityStale ? blockedSync : controller.checkInAttendee,
      updateOrganization: identityStale ? blockedSync : controller.updateOrganization,
      clearLastOperation: identityStale ? blockedSync : controller.clearLastOperation,
    }
  }, [snapshot, identityStale, updateEventImage, auth.status, currentUserId, rawSnapshot.userId])
}
