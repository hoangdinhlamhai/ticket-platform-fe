import { useCallback, useEffect, useMemo, useState } from 'react'
import { getTicketSubtotal } from '../helpers/formatTicketPrice'
import { clampTicketQuantity, getTicketAvailability, getTicketQuantityBounds } from '../helpers/ticket-selection'
import type { EventTicketTier } from '../types/event'

export function useTicketSelection(ticketTiers: readonly EventTicketTier[]) {
  const [selectedTierId, setSelectedTierId] = useState(ticketTiers[0]?.id ?? '')
  const [rawQuantity, setRawQuantity] = useState(1)
  const [now, setNow] = useState(() => new Date())
  const selectedTier = useMemo(() => ticketTiers.find((tier) => tier.id === selectedTierId) ?? ticketTiers[0], [selectedTierId, ticketTiers])
  const bounds = useMemo(() => selectedTier ? getTicketQuantityBounds(selectedTier) : { min: 1, max: 1 }, [selectedTier])
  const quantity = clampTicketQuantity(rawQuantity, bounds)
  const availability = useMemo(() => selectedTier ? getTicketAvailability(selectedTier, now) : undefined, [selectedTier, now])

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const selectTier = useCallback((tierId: string) => {
    const tier = ticketTiers.find((candidate) => candidate.id === tierId)
    if (!tier || !getTicketAvailability(tier).available) return
    setSelectedTierId(tierId)
    setRawQuantity(getTicketQuantityBounds(tier).min)
  }, [ticketTiers])
  const decreaseQuantity = useCallback(() => setRawQuantity((value) => value - 1), [])
  const increaseQuantity = useCallback(() => setRawQuantity((value) => value + 1), [])
  const subtotal = selectedTier && availability?.available ? getTicketSubtotal(selectedTier.price, quantity) : 0

  return { decreaseQuantity, increaseQuantity, quantity, selectedTier, selectedTierId, selectTier, subtotal, availability, bounds }
}
