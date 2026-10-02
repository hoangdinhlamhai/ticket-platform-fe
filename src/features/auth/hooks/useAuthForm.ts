import { useCallback, useState, type ChangeEvent, type FormEvent } from 'react'
import axios from 'axios'
import { login, register } from '../api/authApi.ts'
import type { AuthUserRole } from '../types/authContract.ts'
import { validateAuthForm } from '../helpers/validateAuthForm'
import type { AuthFormErrors, AuthFormValues, AuthMode } from '../types/authForm'

const emptyValues: AuthFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
}

type Options = {
  mode: AuthMode
  onAuthenticated: (role: AuthUserRole) => void
  onNavigateMode: (mode: AuthMode) => void
}

function roleFromAccessToken(accessToken: string): AuthUserRole {
  const encodedPayload = accessToken.split('.')[1]
  if (!encodedPayload) throw new Error('Token đăng nhập không hợp lệ.')

  const normalizedPayload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    '=',
  )
  const payload = JSON.parse(atob(paddedPayload)) as { role?: AuthUserRole }

  if (payload.role !== 'USER' && payload.role !== 'ADMIN') {
    throw new Error('Token đăng nhập không chứa role hợp lệ.')
  }

  return payload.role
}

function mapFieldErrors(error: unknown): AuthFormErrors {
  const fieldErrors = axios.isAxiosError(error) ? error.response?.data?.fieldErrors : undefined
  const errors: AuthFormErrors = {}
  if (!fieldErrors || typeof fieldErrors !== 'object') return errors

  for (const [key, message] of Object.entries(fieldErrors)) {
    const field = key === 'fullName' ? 'name' : key
    if (['name', 'email', 'password', 'confirmPassword', 'acceptedTerms'].includes(field)) {
      errors[field as keyof AuthFormValues] = String(message)
    }
  }

  return errors
}

export function useAuthForm({ mode, onAuthenticated, onNavigateMode }: Options) {
  const [values, setValues] = useState<AuthFormValues>(emptyValues)
  const [errors, setErrors] = useState<AuthFormErrors>({})
  const [notice, setNotice] = useState('')
  const [isPending, setIsPending] = useState(false)

  const updateValue = useCallback(<Key extends keyof AuthFormValues>(
    key: Key,
    value: AuthFormValues[Key],
  ) => {
    setValues((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({
      ...current,
      [key]: undefined,
      ...(key === 'password' ? { confirmPassword: undefined } : {}),
    }))
    setNotice('')
  }, [])

  const onTextChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    updateValue(event.target.name as Exclude<keyof AuthFormValues, 'acceptedTerms'>, event.target.value)
  }, [updateValue])

  const onTermsChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    updateValue('acceptedTerms', event.target.checked)
  }, [updateValue])

  const onSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isPending) return

    const nextErrors = validateAuthForm(values, mode)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      setNotice('Vui lòng kiểm tra lại thông tin đã đánh dấu.')
      return
    }

    setIsPending(true)
    setNotice('')
    try {
      const data = mode === 'login'
        ? await login({ email: values.email.trim(), password: values.password })
        : await register({ fullName: values.name.trim(), email: values.email.trim(), password: values.password })
      const role = roleFromAccessToken(data.accessToken)
      localStorage.setItem('accessToken', data.accessToken)
      onAuthenticated(role)
    } catch (error) {
      setErrors(mapFieldErrors(error))
      setNotice(error instanceof Error ? error.message : 'Không thể xác thực. Vui lòng thử lại.')
    } finally {
      setIsPending(false)
    }
  }, [isPending, mode, onAuthenticated, values])

  const onModeChange = useCallback((nextMode: AuthMode) => {
    setValues((current) => ({ ...current, password: '', confirmPassword: '' }))
    setErrors({})
    setNotice('')
    onNavigateMode(nextMode)
  }, [onNavigateMode])

  return { values, errors, notice, isPending, onTextChange, onTermsChange, onSubmit, onModeChange, setNotice }
}
