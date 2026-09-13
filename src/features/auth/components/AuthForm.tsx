import type { ChangeEvent, FormEvent } from 'react'
import { AUTH_COPY } from '../authCopy'
import type { AuthFormErrors, AuthFormValues, AuthMode } from '../types/authForm'
import { ArrowIcon, GoogleIcon } from './AuthIcons'
import { AuthModeSwitcher } from './AuthModeSwitcher'
import { PasswordField } from './PasswordField'

type AuthFormProps = {
  errors: AuthFormErrors
  mode: AuthMode
  notice: string
  onForgotPassword: () => void
  onGoogle: () => void
  onModeChange: (mode: AuthMode) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTermsChange: (event: ChangeEvent<HTMLInputElement>) => void
  onTextChange: (event: ChangeEvent<HTMLInputElement>) => void
  values: AuthFormValues
}

const textInputClass = 'min-h-[3.15rem] w-full rounded-none border border-line bg-surface px-[0.85rem] py-[0.65rem] text-base text-ink outline-none hover:border-ink-soft focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_2px_var(--color-error-ring)] aria-[invalid=true]:focus:border-error aria-[invalid=true]:focus:shadow-[0_0_0_2px_var(--color-error-ring)]'
const fieldErrorClass = 'mt-[0.4rem] text-[0.78rem] leading-[1.45] text-error'

export function AuthForm({
  errors,
  mode, 
  onForgotPassword,
  onGoogle,
  onModeChange,
  onSubmit,
  onTermsChange,
  onTextChange,
  values,
}: AuthFormProps) {
  const copy = AUTH_COPY[mode]
  const emailErrorId = 'email-error'
  const nameErrorId = 'name-error'
  const termsErrorId = 'terms-error'

  return (
    <main
      id="main-content"
      className="grid min-w-0 place-items-center bg-paper p-[clamp(1.5rem,5vw,5rem)] mobile:min-h-dvh mobile:content-start mobile:px-5 mobile:pt-6 mobile:pb-8"
      tabIndex={-1}
    >
      <div className="hidden w-full max-w-[28rem] mx-auto mb-[2.3rem] font-body text-[1.8rem] font-extrabold tracking-[-0.08em] text-pine mobile:block">
        <span>Ticketly</span>
      </div>
      <section className="w-full max-w-[28rem]" aria-labelledby="auth-title">
        <AuthModeSwitcher mode={mode} onSelect={onModeChange} />
        <header className="mt-8 mb-7 mobile:mt-[1.6rem]">
          <p className="m-0 mb-[0.45rem] text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">
            {copy.eyebrow}
          </p>
          <h1
            id="auth-title"
            className="m-0 font-body text-[clamp(2.25rem,4vw,3.15rem)] leading-[0.95] font-bold tracking-[-0.07em] text-ink"
          >
            {copy.title}
          </h1>
        </header>

        <form noValidate onSubmit={onSubmit}>
          {mode === 'register' ? (
            <div className="mt-4">
              <label className="mb-[0.45rem] block text-[0.83rem] font-bold text-ink" htmlFor="name">
                Họ và tên
              </label>
              <input
                id="name"
                name="name"
                className={textInputClass}
                type="text"
                autoComplete="name"
                required
                value={values.name}
                onChange={onTextChange}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? nameErrorId : undefined}
              />
              {errors.name ? (
                <p id={nameErrorId} className={fieldErrorClass} role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4">
            <label className="mb-[0.45rem] block text-[0.83rem] font-bold text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              className={textInputClass}
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={values.email}
              onChange={onTextChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? emailErrorId : undefined}
            />
            {errors.email ? (
              <p id={emailErrorId} className={fieldErrorClass} role="alert">
                {errors.email}
              </p>
            ) : null}
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Mật khẩu"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            value={values.password}
            onChange={onTextChange}
            error={errors.password}
          />

          {mode === 'login' ? (
            <button
              className="mt-[0.6rem] ml-auto block cursor-pointer border-0 bg-transparent p-0 text-[0.78rem] font-bold text-blue-deep underline"
              type="button"
              onClick={onForgotPassword}
            >
              Quên mật khẩu?
            </button>
          ) : (
            <>
              <PasswordField
                id="confirm-password"
                name="confirmPassword"
                label="Xác nhận mật khẩu"
                autoComplete="new-password"
                required
                value={values.confirmPassword}
                onChange={onTextChange}
                error={errors.confirmPassword}
              />
              <div className="mt-4 grid grid-cols-[1.25rem_1fr] items-start gap-x-[0.65rem]">
                <input
                  id="terms"
                  name="acceptedTerms"
                  className="mt-[0.15rem] h-[1.1rem] w-[1.1rem] cursor-pointer accent-blue"
                  type="checkbox"
                  required
                  checked={values.acceptedTerms}
                  onChange={onTermsChange}
                  aria-invalid={Boolean(errors.acceptedTerms)}
                  aria-describedby={errors.acceptedTerms ? termsErrorId : undefined}
                />
                <label className="text-[0.78rem] leading-[1.55] text-ink-soft" htmlFor="terms">
                  Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật của Ticketly khi các nội dung này được công bố.
                </label>
                {errors.acceptedTerms ? (
                  <p id={termsErrorId} className="col-start-2 mt-[0.4rem] text-[0.78rem] leading-[1.45] text-error" role="alert">
                    {errors.acceptedTerms}
                  </p>
                ) : null}
              </div>
            </>
          )}

          <button
            className="mt-6 flex min-h-[3.3rem] w-full cursor-pointer items-center justify-center gap-[0.6rem] border border-coral-dark bg-coral text-[0.94rem] font-extrabold text-paper transition-colors duration-150 ease-out hover:bg-coral-dark motion-reduce:transition-none"
            type="submit"
          >
            <span>{copy.submitLabel}</span>
            <ArrowIcon />
          </button>
        </form>

        <div className="my-7 flex items-center gap-[0.8rem] text-[0.72rem] text-ink-soft before:h-px before:flex-1 before:bg-line before:content-[''] after:h-px after:flex-1 after:bg-line after:content-['']">
          <span>hoặc</span>
        </div>
        <button
          className="flex min-h-[3.3rem] w-full cursor-pointer items-center justify-center gap-[0.7rem] border border-line bg-surface text-[0.9rem] font-bold text-ink hover:border-blue hover:bg-google-hover hover:text-blue-deep [&>svg]:h-[1.2rem] [&>svg]:w-[1.2rem]"
          type="button"
          onClick={onGoogle}
        >
          <GoogleIcon />
          <span>Tiếp tục với Google</span>
        </button>

        <p className="mt-6 flex justify-center gap-[0.35rem] text-[0.82rem] text-ink-soft">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button
            className="cursor-pointer border-0 bg-transparent p-0 font-extrabold text-blue-deep underline"
            type="button"
            onClick={() => onModeChange(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? 'Tạo tài khoản' : 'Đăng nhập'}
          </button>
        </p>
      </section>
    </main>
  )
}
