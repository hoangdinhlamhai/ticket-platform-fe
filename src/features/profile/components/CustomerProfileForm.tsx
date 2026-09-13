import type { ChangeEvent, FormEvent } from 'react'
import type { CustomerProfile, CustomerProfileErrors } from '../types/customer-profile'

type CustomerProfileFormProps = {
  errors: CustomerProfileErrors
  isDirty: boolean
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  profile: CustomerProfile
}

const inputClass = 'min-h-12 w-full rounded-md border border-line bg-surface px-3 text-base text-ink outline-none hover:border-ink-soft focus:border-blue focus:shadow-[0_0_0_3px_var(--color-focus-ring)] aria-[invalid=true]:border-error'

const fields: ReadonlyArray<{
  autoComplete: string
  label: string
  name: keyof CustomerProfile
  required?: boolean
  type: string
}> = [
  { autoComplete: 'name', label: 'Họ và tên', name: 'fullName', required: true, type: 'text' },
  { autoComplete: 'email', label: 'Email', name: 'email', required: true, type: 'email' },
  { autoComplete: 'tel', label: 'Số điện thoại', name: 'phone', type: 'tel' },
  { autoComplete: 'bday', label: 'Ngày sinh', name: 'birthDate', type: 'date' },
]

export function CustomerProfileForm({ errors, isDirty, onChange, onSubmit, profile }: CustomerProfileFormProps) {
  return (
    <form className="rounded-lg border border-line bg-surface p-6 mobile:p-4" noValidate onSubmit={onSubmit}>
      <div className="mb-6 border-b border-line pb-4">
        <p className="m-0 text-[0.7rem] font-extrabold tracking-[0.11em] text-coral-dark">THÔNG TIN CÁ NHÂN</p>
        <h2 className="mt-2 mb-0 font-body text-2xl font-extrabold tracking-[-0.05em] text-ink">Thông tin liên hệ</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 mobile:grid-cols-1">
        {fields.map((field) => {
          const errorId = `${field.name}-error`
          return (
            <div key={field.name} className={field.name === 'fullName' || field.name === 'email' ? 'col-span-2 mobile:col-span-1' : undefined}>
              <label className="mb-2 block text-[0.82rem] font-bold" htmlFor={`profile-${field.name}`}>{field.label}</label>
              <input
                id={`profile-${field.name}`}
                name={field.name}
                className={inputClass}
                type={field.type}
                autoComplete={field.autoComplete}
                required={field.required}
                value={profile[field.name]}
                onChange={onChange}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? errorId : undefined}
              />
              {errors[field.name] ? <p id={errorId} className="mt-2 mb-0 text-[0.78rem] leading-relaxed text-error" role="alert">{errors[field.name]}</p> : null}
            </div>
          )
        })}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="m-0 max-w-lg text-[0.76rem] leading-relaxed text-ink-soft">Dữ liệu chỉ được giữ trong phiên minh họa và sẽ trở về mặc định khi tải lại trang.</p>
        <button className="min-h-11 rounded-md border border-coral-dark bg-coral px-5 text-sm font-extrabold text-paper hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-45" type="submit" disabled={!isDirty}>Lưu thay đổi</button>
      </div>
    </form>
  )
}
