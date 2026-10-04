import type { AuthUserRole } from "../types/authContract.ts";
import { AuthForm } from "../components/AuthForm";
import { AuthStoryPanel } from "../components/AuthStoryPanel";
import { useAuthForm } from "../hooks/useAuthForm";
import type { AuthMode } from "../types/authForm";

type AuthPageProps = {
  mode: AuthMode;
  onAuthenticated: (
    role: AuthUserRole,
    session?: {
      accessToken: string;
      user: import("../types/authContract.ts").AttendeeUser;
    },
  ) => void;
  onNavigateMode: (mode: AuthMode) => void;
};

export function AuthPage({
  mode,
  onAuthenticated,
  onNavigateMode,
}: AuthPageProps) {
  const form = useAuthForm({ mode, onAuthenticated, onNavigateMode });

  return (
    <div className="grid min-h-dvh grid-cols-[minmax(0,1.1fr)_minmax(26rem,0.9fr)] overflow-hidden bg-paper mobile:block mobile:overflow-visible">
      <a
        className="fixed top-3 left-3 z-[5] -translate-y-[150%] bg-pine px-4 py-[0.7rem] text-paper focus:translate-y-0"
        href="#main-content"
      >
        Bỏ qua phần giới thiệu
      </a>
      <AuthStoryPanel />
      <AuthForm
        errors={form.errors}
        isPending={form.isPending}
        mode={mode}
        notice={form.notice}
        onForgotPassword={() =>
          form.setNotice("Tính năng đặt lại mật khẩu sẽ sớm được hỗ trợ.")
        }
        onGoogle={() => form.setNotice("Đăng nhập Google sẽ sớm được hỗ trợ.")}
        onModeChange={form.onModeChange}
        onSubmit={form.onSubmit}
        onTermsChange={form.onTermsChange}
        onTextChange={form.onTextChange}
        values={form.values}
      />
    </div>
  );
}
