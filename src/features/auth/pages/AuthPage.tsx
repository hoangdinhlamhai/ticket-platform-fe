import { AuthForm } from '../components/AuthForm'
import { AuthStoryPanel } from '../components/AuthStoryPanel'
import { useAuthForm } from '../hooks/useAuthForm'

export function AuthPage() {
  const authForm = useAuthForm()

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
        errors={authForm.errors}
        mode={authForm.mode}
        notice={authForm.notice}
        onForgotPassword={authForm.showForgotPasswordNotice}
        onGoogle={authForm.showGoogleNotice}
        onModeChange={authForm.selectMode}
        onSubmit={authForm.handleSubmit}
        onTermsChange={authForm.handleTermsChange}
        onTextChange={authForm.handleTextChange}
        values={authForm.values}
      />
    </div>
  )
}
