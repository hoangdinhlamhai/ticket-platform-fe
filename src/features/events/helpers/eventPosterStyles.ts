import type { EventPosterTone } from '../types/event'

export const eventPosterToneClasses: Record<EventPosterTone, string> = {
  yellow: 'bg-poster-yellow text-pine',
  mint: 'bg-mint text-pine',
  blue: 'bg-blue text-paper',
  coral: 'bg-coral text-paper',
}

export const eventPosterAccentClasses: Record<EventPosterTone, string> = {
  yellow: 'border-coral bg-coral',
  mint: 'border-blue bg-blue',
  blue: 'border-poster-yellow bg-poster-yellow',
  coral: 'border-pine bg-pine',
}
