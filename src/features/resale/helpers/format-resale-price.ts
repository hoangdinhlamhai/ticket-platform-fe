export function formatResalePrice(price: number) {
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`
}
