import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { mapAuthApiErrors } from '../helpers/map-auth-api-errors.ts'
import { validateAuthForm } from '../helpers/validateAuthForm'
import type { AuthFormErrors, AuthFormValues, AuthMode } from '../types/authForm'

type Options = {
  initialMode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onSubmit: (mode: AuthMode, values: AuthFormValues) => Promise<void>
}

const initialValues: AuthFormValues = { name: '', email: '', password: '', confirmPassword: '', acceptedTerms: false }
export function useAuthForm({ initialMode, onModeChange, onSubmit }: Options) {
  const mode = initialMode
  const [values, setValues] = useState<AuthFormValues>(initialValues)
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [notice, setNotice] = useState('')
  const [isPending, setIsPending] = useState(false)
  const submissionVersion = useRef(0)

  const selectMode = useCallback((nextMode: AuthMode) => {
    submissionVersion.current += 1
    setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
    setErrors({})
    setNotice('')
    setIsPending(false)
    onModeChange(nextMode)
  }, [onModeChange])

  const updateValue = useCallback(<Key extends keyof AuthFormValues>(key: Key, value: AuthFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined, ...(key === 'password' ? { confirmPassword: undefined } : {}) }))
    setNotice('')
  }, [])

  const handleTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    updateValue(event.target.name as Exclude<keyof AuthFormValues, 'acceptedTerms'>, event.target.value)
  }, [updateValue])
  const handleTermsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => updateValue('acceptedTerms', event.target.checked), [updateValue])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return
    const nextErrors = validateAuthForm(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) { setNotice('Kiểm tra lại các thông tin được đánh dấu trước khi tiếp tục.'); return }
    const version = ++submissionVersion.current
    setIsPending(true)
    setNotice('')
    try {
      await onSubmit(mode, values)
      if (version !== submissionVersion.current) return
      setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
    } catch (error) {
      if (version !== submissionVersion.current) return
      const serverErrors = mapAuthApiErrors(error)
      setErrors(serverErrors)
      setNotice(error instanceof Error ? error.message : 'Không thể xác thực. Vui lòng thử lại.')
    } finally {
      if (version === submissionVersion.current) setIsPending(false)
    }
  }, [isPending, mode, onSubmit, values])

  return {
    errors, handleSubmit, handleTermsChange, handleTextChange, isPending, mode, notice, selectMode,
    showGoogleNotice: () => setNotice('Đăng nhập Google sẽ sớm được hỗ trợ.'),
    showForgotPasswordNotice: () => setNotice('Tính năng đặt lại mật khẩu sẽ sớm được hỗ trợ.'), values,
  }
}
