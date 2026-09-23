export function buildOrganizerEventPolicy(value: string) {
  return { confirmationMessage: value.slice(0, 500) }
}
