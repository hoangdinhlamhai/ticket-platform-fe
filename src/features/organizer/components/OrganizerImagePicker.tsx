import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react'

type Props = {
  readonly disabled?: boolean
  readonly label: string
  readonly maxMb?: number
  readonly onChange: (value: string) => void
  readonly value?: string
}

const acceptedTypes = ['image/png', 'image/jpeg', 'image/webp'] as const
const acceptedTypeLabel = 'PNG, JPEG hoặc WebP'

export function OrganizerImagePicker({ disabled = false, label, maxMb = 3, onChange, value = '' }: Props) {
  const inputId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const readerRef = useRef<FileReader | null>(null)
  const requestIdRef = useRef(0)
  const [error, setError] = useState('')

  useEffect(() => () => {
    requestIdRef.current += 1
    readerRef.current?.abort()
  }, [])

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = ''
  }

  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!acceptedTypes.includes(file.type as (typeof acceptedTypes)[number])) {
      setError(`Chỉ chấp nhận ảnh ${acceptedTypeLabel}.`)
      clearInput()
      return
    }

    if (file.size > maxMb * 1024 * 1024) {
      setError(`Ảnh không được lớn hơn ${maxMb}MB.`)
      clearInput()
      return
    }

    readerRef.current?.abort()
    const reader = new FileReader()
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    readerRef.current = reader
    setError('')

    reader.onload = () => {
      if (requestId !== requestIdRef.current || typeof reader.result !== 'string') return
      onChange(reader.result)
      clearInput()
    }
    reader.onerror = () => {
      if (requestId === requestIdRef.current) setError('Không thể đọc ảnh. Vui lòng chọn lại tệp khác.')
      clearInput()
    }
    reader.onabort = () => {
      clearInput()
    }
    reader.readAsDataURL(file)
  }

  const remove = () => {
    requestIdRef.current += 1
    readerRef.current?.abort()
    setError('')
    clearInput()
    onChange('')
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-bold text-ink">{label}</span>
      <div className="flex flex-col gap-3 rounded-md border border-dashed border-line bg-paper-deep p-3 sm:flex-row sm:items-center">
        <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-md border border-line bg-paper sm:w-36">
          {value ? <img className="h-full w-full object-cover" src={value} alt={`${label} xem trước`} /> : <span className="px-3 text-center text-xs font-bold text-ink-soft">Chưa chọn ảnh</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <input
              ref={inputRef}
              id={inputId}
              className="block w-full max-w-xs text-sm text-ink file:mr-3 file:min-h-10 file:cursor-pointer file:rounded-md file:border file:border-blue file:bg-paper file:px-3 file:font-bold file:text-blue-deep hover:file:bg-blue/10 disabled:cursor-not-allowed disabled:opacity-60"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={disabled}
              onChange={selectFile}
              aria-label={`${value ? 'Thay ảnh' : 'Chọn ảnh'}: ${label}`}
              aria-describedby={error ? errorId : undefined}
            />
            <span className="text-xs text-ink-soft">{value ? 'Chọn ảnh khác hoặc giữ ảnh hiện tại.' : 'Chưa có ảnh, hãy chọn một tệp từ máy.'}</span>
          </div>
          {value && <button className="min-h-10 rounded-md px-3 text-sm font-bold text-coral-dark hover:bg-coral/10 disabled:opacity-60" type="button" onClick={remove} disabled={disabled}>Xóa ảnh</button>}
          <span className="basis-full text-xs text-ink-soft">{acceptedTypeLabel}, tối đa {maxMb}MB.</span>
        </div>
      </div>
      {error && <p id={errorId} className="text-sm font-bold text-error" role="alert">{error}</p>}
    </div>
  )
}
