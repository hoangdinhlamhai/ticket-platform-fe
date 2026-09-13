export function formatTicketPrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`
}

export function getTicketSubtotal(price: number, quantity: number) {
  return price * quantity
}
