import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import { validateAuthForm } from '../helpers/validateAuthForm'
import type { AuthFormErrors, AuthFormValues, AuthMode } from '../types/authForm'

const initialValues: AuthFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

export function useAuthForm() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [values, setValues] = useState<AuthFormValues>(initialValues)
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [notice, setNotice] = useState('')

  const selectMode = useCallback((nextMode: AuthMode) => {
    setMode(nextMode)
    setErrors({})
    setNotice('')
  }, [])

  const updateValue = useCallback(<Key extends keyof AuthFormValues>(key: Key, value: AuthFormValues[Key]) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === 'password' ? { confirmPassword: undefined } : {}),
    }))
    setNotice('')
  }, [])

  const handleTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const key = event.target.name as Exclude<keyof AuthFormValues, 'acceptedTerms'>
      updateValue(key, event.target.value)
    },
    [updateValue],
  )

  const handleTermsChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      updateValue('acceptedTerms', event.target.checked)
    },
    [updateValue],
  )

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      const nextErrors = validateAuthForm(values, mode)
      setErrors(nextErrors)

      if (Object.keys(nextErrors).length > 0) {
        setNotice('Kiểm tra lại các thông tin được đánh dấu trước khi tiếp tục.')
        return
      }

      setNotice(
        mode === 'login'
          ? 'Thông tin hợp lệ. Kết nối đăng nhập thật sẽ được tích hợp ở bước tiếp theo.'
          : 'Tài khoản của bạn đã sẵn sàng về mặt giao diện. Dữ liệu chưa được gửi hoặc lưu lại.',
      )
    },
    [mode, values],
  )

  const showGoogleNotice = useCallback(() => {
    setNotice('Google Sign-In sẽ được kết nối khi backend xác thực sẵn sàng.')
  }, [])

  const showForgotPasswordNotice = useCallback(() => {
    setNotice('Tính năng đặt lại mật khẩu sẽ gửi hướng dẫn đến email của bạn ở phiên bản tiếp theo.')
  }, [])

  return {
    errors,
    handleSubmit,
    handleTermsChange,
    handleTextChange,
    mode,
    notice,
    selectMode,
    showForgotPasswordNotice,
    showGoogleNotice,
    values,
  }
}
