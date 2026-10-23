import type { OrganizerEventFinance } from "../../types/organizer-event.ts";

type Props = {
  disabled: boolean;
  finance: OrganizerEventFinance;
  onChange: (field: keyof OrganizerEventFinance, value: string) => void;
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base outline-none disabled:bg-paper-deep";

type FinanceField = keyof OrganizerEventFinance;
const financeFields: ReadonlyArray<{
  key: Exclude<FinanceField, "businessType">;
  label: string;
}> = [
  { key: "accountHolder", label: "Chủ tài khoản" },
  { key: "accountNumber", label: "Số tài khoản" },
  { key: "bankName", label: "Tên ngân hàng" },
  { key: "branch", label: "Chi nhánh" },
  { key: "invoiceName", label: "Tên xuất hóa đơn" },
  { key: "invoiceAddress", label: "Địa chỉ hóa đơn" },
  { key: "taxCode", label: "Mã số thuế" },
];

export function OrganizerEventStepFinance({
  disabled,
  finance,
  onChange,
}: Props) {
  return (
    <fieldset disabled={disabled} className="space-y-4">
      <legend className="text-xl font-extrabold">
        Thông tin thanh toán và hóa đơn
      </legend>
      <label className="block text-sm font-bold">
        Loại hình kinh doanh
        <select
          className={inputClass}
          name="businessType"
          value={finance.businessType}
          onChange={(event) => onChange("businessType", event.target.value)}
        >
          <option value="INDIVIDUAL">Cá nhân</option>
          <option value="ORGANIZATION">Tổ chức</option>
        </select>
      </label>
      {financeFields.map(({ key, label }) => (
        <label className="block text-sm font-bold" key={key}>
          {label}
          <input
            className={inputClass}
            value={finance[key] ?? ""}
            onChange={(event) => onChange(key, event.target.value)}
          />
        </label>
      ))}
    </fieldset>
  );
}
