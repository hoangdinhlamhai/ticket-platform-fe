import { ADMIN_RECORD_FIXTURES } from './admin-record-data.ts'
import type { AdminWorkspace } from '../types/admin-workspace.ts'

export function createAdminWorkspace(): AdminWorkspace {
  const copy = structuredClone(ADMIN_RECORD_FIXTURES)
  return copy
}
