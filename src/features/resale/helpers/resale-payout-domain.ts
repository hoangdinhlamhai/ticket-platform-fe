export const resalePayoutFailureReasons: Readonly<Record<string, string>> = {
  INSUFFICIENT_BALANCE: "Tài khoản Xendit không đủ số dư để thực hiện chi trả.",
  INVALID_DESTINATION: "Tài khoản nhận không tồn tại hoặc không hợp lệ.",
  DESTINATION_MAXIMUM_LIMIT:
    "Số tiền vượt quá hạn mức nhận tiền của tài khoản nhận.",
  ACCOUNT_NAME_MISMATCH: "Tên chủ tài khoản nhận không hợp lệ hoặc không khớp.",
  REJECTED_BY_CHANNEL:
    "Kênh ngân hàng hoặc ví nhận đã từ chối giao dịch. Hãy kiểm tra tài khoản còn hoạt động và có thể nhận tiền.",
  TEMPORARY_TRANSFER_ERROR:
    "Mạng lưới chuyển tiền đang gặp sự cố tạm thời. Vui lòng thử lại sau.",
  TRANSFER_ERROR:
    "Đã xảy ra lỗi khi xử lý chi trả. Thông tin yêu cầu có thể không hợp lệ.",
  SLS_SENDER: "Người gửi không vượt qua bước kiểm tra danh sách trừng phạt.",
  SLS_RECIPIENT:
    "Người nhận không vượt qua bước kiểm tra danh sách trừng phạt.",
};

export function canRetryResalePayout(
  status?: string | null,
  failureCode?: string | null,
) {
  return (
    (status === "FAILED" || status === "REVERSED") &&
    failureCode !== "SLS_SENDER" &&
    failureCode !== "SLS_RECIPIENT"
  );
}
