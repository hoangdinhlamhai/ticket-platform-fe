import type { AuthMode } from '../types/authForm'

type AuthModeSwitcherProps = {
  mode: AuthMode
  onSelect: (mode: AuthMode) => void
}

const modeButtonClass = 'min-h-11 cursor-pointer border-0 bg-transparent text-[0.84rem] font-bold text-ink-soft aria-pressed:bg-pine aria-pressed:text-paper'

export function AuthModeSwitcher({ mode, onSelect }: AuthModeSwitcherProps) {
  return (
    <div className="grid grid-cols-2 border border-line bg-paper-deep p-1" role="group" aria-label="Chọn biểu mẫu xác thực">
      <button
        type="button"
        aria-pressed={mode === 'login'}
        className={modeButtonClass}
        onClick={() => onSelect('login')}
      >
        Đăng nhập
      </button>
      <button
        type="button"
        aria-pressed={mode === 'register'}
        className={modeButtonClass}
        onClick={() => onSelect('register')}
      >
        Tạo tài khoản
      </button>
    </div>
  )
}
