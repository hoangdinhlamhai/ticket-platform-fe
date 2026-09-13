import { useState, type ChangeEvent } from 'react'
import { EyeIcon } from './AuthIcons'

type PasswordFieldProps = {
  autoComplete: 'current-password' | 'new-password'
  error?: string
  id: string
  label: string
  name: 'password' | 'confirmPassword'
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  required: boolean
  value: string
}

const passwordInputClass = 'min-h-[3.15rem] w-full rounded-none border border-line bg-surface py-[0.65rem] pr-[3.25rem] pl-[0.85rem] text-base text-ink outline-none hover:border-ink-soft focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] aria-[invalid=true]:border-error aria-[invalid=true]:shadow-[0_0_0_2px_var(--color-error-ring)] aria-[invalid=true]:focus:border-error aria-[invalid=true]:focus:shadow-[0_0_0_2px_var(--color-error-ring)]'
const fieldErrorClass = 'mt-[0.4rem] text-[0.78rem] leading-[1.45] text-error'

export function PasswordField({
  autoComplete,
  error,
  id,
  label,
  name,
  onChange,
  required,
  value,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false)
  const errorId = `${id}-error`

  return (
    <div className="mt-4">
      <label className="mb-[0.45rem] block text-[0.83rem] font-bold text-ink" htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          className={passwordInputClass}
          type={isVisible ? 'text' : 'password'}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
        />
        <button
          className="absolute top-[0.2rem] right-[0.2rem] grid h-11 w-11 cursor-pointer place-items-center border-0 bg-transparent text-ink-soft [&>svg]:h-[1.2rem] [&>svg]:w-[1.2rem] [&>svg]:fill-none [&>svg]:stroke-current [&>svg]:[stroke-linecap:round] [&>svg]:[stroke-linejoin:round] [&>svg]:[stroke-width:1.8]"
          type="button"
          aria-label={isVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          onClick={() => setIsVisible((current) => !current)}
        >
          <EyeIcon open={isVisible} />
        </button>
      </div>
      {error ? (
        <p id={errorId} className={fieldErrorClass} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
