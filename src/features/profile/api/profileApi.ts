import axiosClient from "../../../api/axiosClient";

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: string;
  status: string;
};

export type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string | null;
  status: string;
};

export type BankAccountPayload = Omit<BankAccount, "id" | "status">;
type BankAccountResponse = {
  id: string;
  tenNganHang: string;
  soTaiKhoan: string;
  chuTaiKhoan: string;
  chiNhanh: string | null;
  trangThai: string;
};

export type UpdateProfilePayload = {
  fullName?: string;
  phone?: string | null;
  currentPassword?: string;
  newPassword?: string;
};

export const getMyProfile = () =>
  axiosClient.get<{ user: UserProfile }>("/auth/me");

export const updateMyProfile = (payload: UpdateProfilePayload) =>
  axiosClient.patch<{ user: UserProfile }>("/users/me", payload);

function mapBankAccount(account: BankAccountResponse): BankAccount {
  return {
    id: account.id,
    bankName: account.tenNganHang,
    accountNumber: account.soTaiKhoan,
    accountHolder: account.chuTaiKhoan,
    branch: account.chiNhanh,
    status: account.trangThai,
  };
}

export async function getMyBankAccounts(): Promise<{
  data: { bankAccounts: BankAccount[] };
}> {
  const response = await axiosClient.get<{
    bankAccounts: BankAccountResponse[];
  }>("/users/me/bank-accounts");
  return {
    ...response,
    data: { bankAccounts: response.data.bankAccounts.map(mapBankAccount) },
  };
}

export async function getMyBankAccount(bankAccountId: string) {
  const response = await axiosClient.get<{
    bankAccount: BankAccountResponse;
  }>(`/users/me/bank-accounts/${encodeURIComponent(bankAccountId)}`);
  return {
    ...response,
    data: { bankAccount: mapBankAccount(response.data.bankAccount) },
  };
}

export async function createMyBankAccount(payload: BankAccountPayload) {
  const response = await axiosClient.post<{
    bankAccount: BankAccountResponse;
  }>("/users/me/bank-accounts", payload);
  return {
    ...response,
    data: { bankAccount: mapBankAccount(response.data.bankAccount) },
  };
}

export async function updateMyBankAccount(
  bankAccountId: string,
  payload: Partial<BankAccountPayload>,
) {
  const response = await axiosClient.patch<{
    bankAccount: BankAccountResponse;
  }>(`/users/me/bank-accounts/${encodeURIComponent(bankAccountId)}`, payload);
  return {
    ...response,
    data: { bankAccount: mapBankAccount(response.data.bankAccount) },
  };
}

export const deleteMyBankAccount = (bankAccountId: string) =>
  axiosClient.delete<{ message: string }>(
    `/users/me/bank-accounts/${encodeURIComponent(bankAccountId)}`,
  );
