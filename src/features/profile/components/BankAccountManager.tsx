import { useEffect, useState, type FormEvent } from "react";
import {
  createMyBankAccount,
  deleteMyBankAccount,
  getMyBankAccounts,
  updateMyBankAccount,
  type BankAccount,
  type BankAccountPayload,
} from "../api/profileApi";

const supportedBanks = [
  { name: "Vietcombank", swiftCode: "BFTVVNVX", aliases: ["VCB"] },
  { name: "BIDV", swiftCode: "BIDVVNVX", aliases: [] },
  { name: "Agribank", swiftCode: "VBAAVNVX", aliases: [] },
  { name: "VietinBank", swiftCode: "ICBVVNVX", aliases: ["Vietinbank"] },
  { name: "Techcombank", swiftCode: "VTCBVNVX", aliases: [] },
  { name: "MB", swiftCode: "MSCBVNVX", aliases: ["MBBank", "MB Bank"] },
  { name: "ACB", swiftCode: "ASCBVNVX", aliases: [] },
  { name: "Sacombank", swiftCode: "SGTTVNVX", aliases: [] },
  { name: "TPBank", swiftCode: "TPBVVNVX", aliases: [] },
  { name: "VPBank", swiftCode: "VPBKVNVX", aliases: [] },
] as const;

function findSupportedBank(bankName: string, bankCode: string | null) {
  const normalizedName = bankName.trim().toLocaleLowerCase("vi");
  const normalizedCode = bankCode?.trim().toUpperCase();

  return supportedBanks.find(
    (bank) =>
      bank.swiftCode === normalizedCode ||
      bank.name.toLocaleLowerCase("vi") === normalizedName ||
      bank.aliases.some(
        (alias) => alias.toLocaleLowerCase("vi") === normalizedName,
      ),
  );
}

const emptyDraft: BankAccountPayload = {
  bankName: "",
  accountNumber: "",
  accountHolder: "",
  branch: "",
  bankCode: "",
  recipientGivenName: "",
  recipientSurname: "",
  recipientCity: "",
  recipientAddress: "",
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)]";

export function BankAccountManager() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [draft, setDraft] = useState<BankAccountPayload>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [customBankSelected, setCustomBankSelected] = useState(false);
  const selectedBank = findSupportedBank(draft.bankName, draft.bankCode);
  const bankSelection = customBankSelected
    ? "OTHER"
    : selectedBank
      ? selectedBank.swiftCode
      : draft.bankName || draft.bankCode
        ? "OTHER"
        : "";

  useEffect(() => {
    let active = true;
    const loadAccounts = async () => {
      try {
        const response = await getMyBankAccounts();
        if (active) setAccounts(response.data.bankAccounts);
      } catch {
        if (active) setError("Không tải được danh sách tài khoản ngân hàng.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAccounts();
    return () => {
      active = false;
    };
  }, []);

  const resetForm = () => {
    setDraft(emptyDraft);
    setEditingId(null);
    setCustomBankSelected(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!editingId && accounts.length > 0) {
      setError(
        "Mỗi hồ sơ chỉ được lưu một tài khoản ngân hàng. Hãy sửa hoặc xóa tài khoản hiện có.",
      );
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        const response = await updateMyBankAccount(editingId, draft);
        setAccounts((current) =>
          current.map((account) =>
            account.id === editingId ? response.data.bankAccount : account,
          ),
        );
        setNotice("Đã cập nhật tài khoản ngân hàng.");
      } else {
        const response = await createMyBankAccount(draft);
        setAccounts((current) => [response.data.bankAccount, ...current]);
        setNotice("Đã thêm tài khoản ngân hàng.");
      }
      resetForm();
    } catch {
      setError(
        "Không lưu được tài khoản. Vui lòng kiểm tra thông tin và thử lại.",
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (account: BankAccount) => {
    const knownBank = findSupportedBank(account.bankName, account.bankCode);
    setEditingId(account.id);
    setCustomBankSelected(!knownBank);
    setDraft({
      bankName: knownBank?.name ?? account.bankName,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      branch: account.branch ?? "",
      bankCode: knownBank?.swiftCode ?? account.bankCode ?? "",
      recipientGivenName: account.recipientGivenName ?? "",
      recipientSurname: account.recipientSurname ?? "",
      recipientCity: account.recipientCity ?? "",
      recipientAddress: account.recipientAddress ?? "",
    });
    setError("");
    setNotice("");
  };

  const removeAccount = async (account: BankAccount) => {
    setError("");
    setNotice("");
    try {
      await deleteMyBankAccount(account.id);
      setAccounts((current) =>
        current.filter((item) => item.id !== account.id),
      );
      if (editingId === account.id) resetForm();
      setNotice("Đã xóa tài khoản ngân hàng.");
    } catch {
      setError("Không xóa được tài khoản. Vui lòng thử lại.");
    }
  };

  return (
    <section
      className="rounded-lg border border-line bg-surface p-6 mobile:p-4"
      aria-labelledby="bank-accounts-title"
    >
      <div className="mb-6 border-b border-line pb-4">
        <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">
          THANH TOÁN
        </p>
        <h2
          id="bank-accounts-title"
          className="mt-2 mb-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-ink"
        >
          Tài khoản ngân hàng
        </h2>
        <p className="mt-2 mb-0 text-sm text-ink-soft">
          Thông tin tài khoản và người nhận.
        </p>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-error" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="mb-4 text-sm text-green-800" role="status">
          {notice}
        </p>
      ) : null}
      {loading ? (
        <p className="text-sm text-ink-soft">Đang tải tài khoản...</p>
      ) : null}
      {!loading && accounts.length === 0 ? (
        <p className="mb-5 text-sm text-ink-soft">
          Bạn chưa thêm tài khoản ngân hàng.
        </p>
      ) : null}

      <ul className="mb-6 space-y-3 p-0">
        {accounts.map((account) => (
          <li
            key={account.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line p-4"
          >
            <div>
              <strong className="block text-sm text-ink">
                {account.bankName}
              </strong>
              <span className="mt-1 block text-sm text-ink-soft">
                {account.accountHolder} · {account.accountNumber}
              </span>
              {account.branch ? (
                <span className="mt-1 block text-xs text-ink-soft">
                  {account.branch}
                </span>
              ) : null}
              <span className="mt-1 block text-xs text-ink-soft">
                {account.bankCode || "Thiếu mã SWIFT/BIC"} ·{" "}
                {account.recipientCity || "Thiếu thành phố nhận"}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                className="min-h-10 rounded-md border border-line px-3 text-sm font-bold text-ink hover:bg-paper-deep"
                type="button"
                onClick={() => startEditing(account)}
              >
                Sửa
              </button>
              <button
                className="min-h-10 rounded-md border border-error/40 px-3 text-sm font-bold text-error hover:bg-error/5"
                type="button"
                onClick={() => void removeAccount(account)}
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>

      {accounts.length === 0 || editingId ? (
        <form
          className="grid grid-cols-2 gap-4 mobile:grid-cols-1"
          onSubmit={handleSubmit}
        >
          <h3 className="col-span-2 m-0 text-base font-extrabold text-ink mobile:col-span-1">
            {editingId ? "Cập nhật tài khoản" : "Thêm tài khoản"}
          </h3>
          <label className="col-span-2 block text-sm font-bold text-ink mobile:col-span-1">
            Ngân hàng
            <select
              className={`${inputClass} mt-2 font-normal`}
              value={bankSelection}
              required
              onChange={(event) => {
                const bank = supportedBanks.find(
                  (item) => item.swiftCode === event.target.value,
                );
                setCustomBankSelected(event.target.value === "OTHER");
                setDraft((current) =>
                  bank
                    ? {
                        ...current,
                        bankName: bank.name,
                        bankCode: bank.swiftCode,
                      }
                    : { ...current, bankName: "", bankCode: "" },
                );
              }}
            >
              <option value="">Chọn ngân hàng</option>
              {supportedBanks.map((bank) => (
                <option key={bank.swiftCode} value={bank.swiftCode}>
                  {bank.name}
                </option>
              ))}
              <option value="OTHER">Ngân hàng khác</option>
            </select>
            {selectedBank && !customBankSelected ? (
              <span className="mt-2 block text-xs font-normal text-ink-soft">
                Mã SWIFT/BIC được điền tự động: {selectedBank.swiftCode}
              </span>
            ) : null}
          </label>
          {bankSelection === "OTHER" ? (
            <>
              <label className="block text-sm font-bold text-ink">
                Tên ngân hàng
                <input
                  className={`${inputClass} mt-2 font-normal`}
                  value={draft.bankName}
                  required
                  maxLength={255}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      bankName: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="block text-sm font-bold text-ink">
                Mã SWIFT/BIC
                <input
                  className={`${inputClass} mt-2 font-normal`}
                  value={draft.bankCode ?? ""}
                  placeholder="Hỏi ngân hàng của bạn"
                  required
                  maxLength={11}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      bankCode: event.target.value.toUpperCase(),
                    }))
                  }
                />
                <span className="mt-2 block text-xs font-normal leading-[1.5] text-ink-soft">
                  Bạn có thể hỏi ngân hàng hoặc xem mục thông tin nhận tiền quốc
                  tế trong ứng dụng ngân hàng.
                </span>
              </label>
            </>
          ) : null}
          {(
            [
              ["accountNumber", "Số tài khoản", "Nhập số tài khoản"],
              ["accountHolder", "Chủ tài khoản", "Tên in trên tài khoản"],
              ["branch", "Chi nhánh", "Không bắt buộc"],
              [
                "recipientGivenName",
                "Tên người nhận (given name)",
                "Tên theo giấy tờ",
              ],
              [
                "recipientSurname",
                "Họ người nhận (surname)",
                "Họ theo giấy tờ",
              ],
              [
                "recipientCity",
                "Thành phố người nhận",
                "Ví dụ: Thành phố Hồ Chí Minh",
              ],
              [
                "recipientAddress",
                "Địa chỉ người nhận",
                "Số nhà, đường, phường/xã",
              ],
            ] as const
          ).map(([name, label, placeholder]) => (
            <label key={name} className="block text-sm font-bold text-ink">
              {label}
              <input
                className={`${inputClass} mt-2 font-normal`}
                name={name}
                value={draft[name] ?? ""}
                placeholder={placeholder}
                required={name !== "branch"}
                maxLength={
                  name === "accountNumber"
                    ? 100
                    : name === "recipientGivenName" ||
                        name === "recipientSurname"
                      ? 50
                      : 255
                }
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [name]: event.target.value,
                  }))
                }
              />
            </label>
          ))}
          <div className="col-span-2 flex flex-wrap gap-3 mobile:col-span-1">
            <button
              className="min-h-11 rounded-md border border-coral-dark bg-coral px-5 text-sm font-extrabold text-paper hover:bg-coral-dark disabled:opacity-50"
              type="submit"
              disabled={saving}
            >
              {saving
                ? "Đang lưu..."
                : editingId
                  ? "Lưu tài khoản"
                  : "Thêm tài khoản"}
            </button>
            {editingId ? (
              <button
                className="min-h-11 rounded-md border border-line px-5 text-sm font-bold text-ink hover:bg-paper-deep"
                type="button"
                onClick={resetForm}
              >
                Hủy sửa
              </button>
            ) : null}
          </div>
        </form>
      ) : (
        <p className="mb-0 text-sm leading-[1.6] text-ink-soft">
          {accounts.length === 1
            ? "Hồ sơ chỉ dùng một tài khoản ngân hàng. Bạn có thể sửa hoặc xóa tài khoản hiện tại."
            : "Bạn có nhiều tài khoản đã lưu từ trước. Hãy xóa bớt để chỉ giữ lại một tài khoản."}
        </p>
      )}
    </section>
  );
}
