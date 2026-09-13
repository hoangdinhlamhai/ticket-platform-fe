import { useMemo, useState } from 'react'
import { getTicketSubtotal } from '../helpers/formatTicketPrice'
import type { EventTicketTier } from '../types/event'

const MIN_QUANTITY = 1
const MAX_QUANTITY = 4

export function useMockTicketSelection(ticketTiers: readonly EventTicketTier[]) {
  const [selectedTierId, setSelectedTierId] = useState(ticketTiers[0]?.id ?? '')
  const [quantity, setQuantity] = useState(MIN_QUANTITY)

  const selectedTier = useMemo(
    () => ticketTiers.find((tier) => tier.id === selectedTierId) ?? ticketTiers[0],
    [selectedTierId, ticketTiers],
  )
  const subtotal = selectedTier ? getTicketSubtotal(selectedTier.price, quantity) : 0

  const decreaseQuantity = () => setQuantity((value) => Math.max(MIN_QUANTITY, value - 1))
  const increaseQuantity = () => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))

  return {
    decreaseQuantity,
    increaseQuantity,
    quantity,
    selectedTier,
    selectedTierId,
    selectTier: setSelectedTierId,
    subtotal,
  }
}
