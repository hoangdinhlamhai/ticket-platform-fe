type DialogEntry = {
  readonly id: symbol
  readonly close: () => void
  readonly restoreFocus: () => void
}

export type AdminDialogRegistration = {
  readonly isTopmost: () => boolean
  readonly handleEscape: () => boolean
  readonly close: () => void
}

export function createAdminDialogStack() {
  const entries: DialogEntry[] = []

  return {
    open(
      close: () => void,
      restoreFocus: () => void = () => undefined,
    ): AdminDialogRegistration {
      const entry: DialogEntry = {
        id: Symbol('admin-dialog'),
        close,
        restoreFocus,
      }
      entries.push(entry)

      return {
        isTopmost() {
          return entries.at(-1)?.id === entry.id
        },
        handleEscape() {
          if (entries.at(-1)?.id !== entry.id) return false
          entry.close()
          return true
        },
        close() {
          const index = entries.findIndex(
            (candidate) => candidate.id === entry.id,
          )
          if (index === -1) return
          entries.splice(index, 1)
          entry.restoreFocus()
        },
      }
    },
  }
}

export const adminDialogStack = createAdminDialogStack()
