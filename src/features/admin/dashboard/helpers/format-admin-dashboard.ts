export const money = (value: number | string) =>
  `${Number(value).toLocaleString("vi-VN")} ₫`;

export const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;

export const shortDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });

export const axisMoney = (value: number) => {
  if (value === 0) return "0";
  const formatAmount = (amount: number) =>
    amount.toLocaleString("vi-VN", { maximumFractionDigits: 1 });
  if (value < 1_000) return Math.round(value).toLocaleString("vi-VN");
  if (value < 1_000_000) return `${formatAmount(value / 1_000)} N`;
  if (value < 1_000_000_000) return `${formatAmount(value / 1_000_000)} Tr`;
  return `${formatAmount(value / 1_000_000_000)} Tỷ`;
};

export const dateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
