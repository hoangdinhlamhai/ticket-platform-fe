import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { AttendeePath } from "../../../routes/attendee-route";
import type { OwnedTicket } from "../../tickets";
import {
  getMyProfile,
  updateMyProfile,
  type UpdateProfilePayload,
} from "../api/profileApi";
import { BankAccountManager } from "../components/BankAccountManager";
import {
  CustomerProfileForm,
  type PasswordChange,
} from "../components/CustomerProfileForm";
import { ProfileAvatar } from "../components/ProfileAvatar";
import { ProfileTicketOverview } from "../components/ProfileTicketOverview";
import type { CustomerProfile } from "../types/customer-profile";

type CustomerProfilePageProps = {
  onNavigate: (path: AttendeePath) => void;
  onNoticeChange: (notice: string) => void;
  onSaveProfile: (profile: CustomerProfile) => void;
  profile: CustomerProfile;
  tickets: readonly OwnedTicket[];
};

export function CustomerProfilePage({
  onNavigate,
  onNoticeChange,
  onSaveProfile,
  profile: initialProfile,
  tickets,
}: CustomerProfilePageProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        if (!active) return;
        const user = response.data.user;
        const nextProfile = {
          fullName: user.fullName,
          email: user.email,
          phone: user.phone ?? "",
        };
        setProfile(nextProfile);
        onSaveProfile(nextProfile);
      } catch {
        if (active) setError("Không tải được thông tin tài khoản.");
      }
    };
    void loadProfile();
    return () => {
      active = false;
    };
  }, [onSaveProfile]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
    password: PasswordChange,
  ) => {
    event.preventDefault();
    setError("");
    if (Boolean(password.currentPassword) !== Boolean(password.newPassword)) {
      setError("Hãy nhập cả mật khẩu hiện tại và mật khẩu mới.");
      return;
    }
    const payload: UpdateProfilePayload = {
      fullName: profile.fullName.trim(),
      phone: profile.phone.trim() || null,
    };
    if (password.currentPassword && password.newPassword) {
      payload.currentPassword = password.currentPassword;
      payload.newPassword = password.newPassword;
    }

    setIsSaving(true);
    try {
      const response = await updateMyProfile(payload);
      const user = response.data.user;
      const nextProfile = {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone ?? "",
      };
      setProfile(nextProfile);
      onSaveProfile(nextProfile);
      onNoticeChange("Đã cập nhật thông tin tài khoản.");
    } catch (cause) {
      const responseData = (
        cause as { response?: { data?: { message?: unknown } } }
      ).response?.data?.message;
      setError(
        typeof responseData === "string"
          ? responseData
          : Array.isArray(responseData)
            ? responseData.join(" ")
            : "Không cập nhật được thông tin. Vui lòng kiểm tra dữ liệu và thử lại.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-paper-deep py-[clamp(2.5rem,6vw,5rem)]">
      <div className="attendee-container">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-5 rounded-lg border border-line bg-paper p-6 mobile:p-4">
          <div className="flex items-center gap-4">
            <ProfileAvatar fullName={profile.fullName} />
            <div>
              <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">
                HỒ SƠ TÀI KHOẢN
              </p>
              <h1 className="mt-2 mb-0 font-body text-[clamp(2rem,4vw,3.8rem)] leading-[0.9] font-extrabold tracking-[-0.08em] text-ink">
                {profile.fullName || "Khách hàng Ticketly"}
              </h1>
              <p className="mt-2 mb-0 text-sm text-ink-soft">{profile.email}</p>
            </div>
          </div>
          <span className="rounded-sm border border-blue/40 bg-google-hover px-3 py-2 text-[0.7rem] font-extrabold tracking-[0.08em] text-blue-deep">
            ĐÃ ĐỒNG BỘ TÀI KHOẢN
          </span>
        </header>
        {error ? (
          <p
            className="mb-5 rounded-md border border-error/40 bg-paper p-4 text-sm text-error"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)] items-start gap-6 max-[1100px]:grid-cols-1">
          <div className="space-y-6">
            <CustomerProfileForm
              profile={profile}
              isSaving={isSaving}
              onChange={handleChange}
              onSubmit={(event, password) => void handleSubmit(event, password)}
            />
            <BankAccountManager />
          </div>
          <ProfileTicketOverview tickets={tickets} onNavigate={onNavigate} />
        </div>
      </div>
    </div>
  );
}
