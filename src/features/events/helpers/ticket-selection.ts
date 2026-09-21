import type { EventTicketTier } from '../types/event.ts'

export type TicketAvailabilityStatus = 'available' | 'future' | 'expired' | 'sold-out' | 'invalid-price' | 'event-ended'

export type TicketAvailability = {
  status: TicketAvailabilityStatus
  available: boolean
}

export type TicketQuantityBounds = {
  min: number
  max: number
}

function isReached(value: string | null | undefined, now: Date) {
  if (!value) return false
  const time = Date.parse(value)
  return Number.isFinite(time) && time <= now.getTime()
}

function isFuture(value: string | null | undefined, now: Date) {
  if (!value) return false
  const time = Date.parse(value)
  return Number.isFinite(time) && time > now.getTime()
}

export function getTicketAvailability(tier: EventTicketTier, now: Date = new Date()): TicketAvailability {
  if (!Number.isFinite(tier.price) || tier.price <= 0) return { status: 'invalid-price', available: false }
  if (isReached(tier.eventEndAt, now)) return { status: 'event-ended', available: false }
  if (isFuture(tier.saleStartAt, now)) return { status: 'future', available: false }
  if (isReached(tier.saleEndAt, now)) return { status: 'expired', available: false }
  if (typeof tier.quantity === 'number' && tier.quantity <= 0) return { status: 'sold-out', available: false }
  return { status: 'available', available: true }
}

function positiveInteger(value: number | undefined, fallback: number) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 ? value : fallback
}

export function getTicketQuantityBounds(tier: EventTicketTier): TicketQuantityBounds {
  const min = positiveInteger(tier.minPerOrder, 1)
  const configuredMax = positiveInteger(tier.maxPerOrder, min)
  const allocation = positiveInteger(tier.quantity, configuredMax)
  return { min, max: Math.max(min, Math.min(configuredMax, allocation)) }
}

export function clampTicketQuantity(quantity: number, bounds: TicketQuantityBounds) {
  return Math.min(bounds.max, Math.max(bounds.min, quantity))
}
