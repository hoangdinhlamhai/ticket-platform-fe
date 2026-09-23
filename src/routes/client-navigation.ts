export type NavigationClick = {
  altKey: boolean
  button: number
  ctrlKey: boolean
  metaKey: boolean
  shiftKey: boolean
}

export function shouldUseClientNavigation(event: NavigationClick) {
  return event.button === 0 && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
}
