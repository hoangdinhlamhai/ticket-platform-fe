export function formatTicketPrice(price: number | string) {
  return `${new Intl.NumberFormat("vi-VN").format(Number(price))}đ`;
}

export function getTicketSubtotal(price: number | string, quantity: number) {
  return Number(price) * quantity;
}
