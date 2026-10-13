import { useState, type ChangeEvent, type FormEvent } from "react";
import type { CustomerProfile } from "../types/customer-profile";

type CustomerProfileFormProps = {
  isSaving: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
    password: PasswordChange,
  ) => void;
  profile: CustomerProfile;
};

export type PasswordChange = {
  currentPassword: string;
  newPassword: string;
};

const inputClass =
  "min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)]";

export function CustomerProfileForm({
  isSaving,
  onChange,
  onSubmit,
  profile,
}: CustomerProfileFormProps) {
  const [password, setPassword] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    onSubmit(event, password);
    if (password.currentPassword || password.newPassword) {
      setPassword({ currentPassword: "", newPassword: "" });
    }
  };

  return (
    <form
      className="rounded-lg border border-line bg-surface p-6 mobile:p-4"
      onSubmit={submit}
    >
      <div className="mb-6 border-b border-line pb-4">
        <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">
          THÔNG TIN CÁ NHÂN
        </p>
        <h2 className="mt-2 mb-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-ink">
          Hồ sơ tài khoản
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1">
        <label className="col-span-2 block text-sm font-bold text-ink mobile:col-span-1">
          Email
          <input
            className={`${inputClass} mt-2 bg-paper-deep`}
            value={profile.email}
            readOnly
          />
        </label>
        <label className="col-span-2 block text-sm font-bold text-ink mobile:col-span-1">
          Họ và tên
          <input
            className={`${inputClass} mt-2`}
            name="fullName"
            autoComplete="name"
            value={profile.fullName}
            minLength={2}
            maxLength={120}
            required
            onChange={onChange}
          />
        </label>
        <label className="col-span-2 block text-sm font-bold text-ink mobile:col-span-1">
          Số điện thoại
          <input
            className={`${inputClass} mt-2`}
            name="phone"
            autoComplete="tel"
            value={profile.phone}
            maxLength={30}
            onChange={onChange}
          />
        </label>
      </div>
      <div className="mt-7 border-t border-line pt-5">
        <h3 className="m-0 text-base font-extrabold text-ink">Đổi mật khẩu</h3>
        <p className="mt-1 mb-4 text-sm text-ink-soft">
          Để trống cả hai ô nếu bạn không muốn đổi mật khẩu.
        </p>
        <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1">
          <label className="block text-sm font-bold text-ink">
            Mật khẩu hiện tại
            <input
              className={`${inputClass} mt-2`}
              type="password"
              autoComplete="current-password"
              value={password.currentPassword}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  currentPassword: event.target.value,
                }))
              }
            />
          </label>
          <label className="block text-sm font-bold text-ink">
            Mật khẩu mới
            <input
              className={`${inputClass} mt-2`}
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              value={password.newPassword}
              onChange={(event) =>
                setPassword((current) => ({
                  ...current,
                  newPassword: event.target.value,
                }))
              }
            />
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end border-t border-line pt-5">
        <button
          className="min-h-11 rounded-md border border-coral-dark bg-coral px-5 text-sm font-extrabold text-paper hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-45"
          type="submit"
          disabled={isSaving}
        >
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
