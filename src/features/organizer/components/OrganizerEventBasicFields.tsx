import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import type { OrganizerEventErrors } from '../helpers/validate-organizer-event.ts'
import type { OrganizerEventFormValues } from '../hooks/use-organizer-event-form.ts'
import { sanitizeOrganizerHtml } from '../helpers/sanitize-organizer-html.ts'
import { createEventApi } from '../../auth/api/event-api.ts'
import { OrganizerImagePicker } from './OrganizerImagePicker.tsx'

type Props = {
  disabled?: boolean
  errors: OrganizerEventErrors
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
  registerField: (field: string) => (node: HTMLInputElement | HTMLSelectElement | null) => void
  values: OrganizerEventFormValues
  onFieldChange?: (field: string, value: string) => void
}

type Option = { id: string; name: string }
type LoadState = 'idle' | 'loading' | 'error' | 'ready'

const inputClass =
  'min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base text-ink outline-none focus:border-blue disabled:bg-paper-deep aria-[invalid=true]:border-error'
const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '/api').replace(/\/$/, '')
const eventApi = createEventApi({ baseUrl: apiBase, fetch: globalThis.fetch })
const retryClass =
  'text-xs font-bold text-blue-deep underline underline-offset-2 hover:text-blue disabled:opacity-60'

export function OrganizerEventBasicFields({
  disabled,
  errors,
  onChange,
  registerField,
  values,
  onFieldChange,
}: Props) {
  const editor = useRef<HTMLDivElement>(null)
  const [categories, setCategories] = useState<Option[]>([])
  const [provinces, setProvinces] = useState<Option[]>([])
  const [wards, setWards] = useState<Option[]>([])
  const [categoryState, setCategoryState] = useState<LoadState>('loading')
  const [provinceState, setProvinceState] = useState<LoadState>('loading')
  const [wardState, setWardState] = useState<LoadState>(() =>
    values.provinceId ? 'loading' : 'idle',
  )
  const [categoryRequest, setCategoryRequest] = useState(0)

  const field = (name: string, value: string) => onFieldChange?.(name, value)

  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== values.description) {
      editor.current.innerHTML = values.description
    }
  }, [values.description])

  useEffect(() => {
    let active = true
    void eventApi
      .categories()
      .then((items) => {
        if (active) {
          setCategories(items as Option[])
          setCategoryState('ready')
        }
      })
      .catch(() => active && setCategoryState('error'))
    return () => {
      active = false
    }
  }, [categoryRequest])

  useEffect(() => {
    let active = true
    void eventApi
      .locations()
      .then((items) => {
        if (active) {
          setProvinces(items as Option[])
          setProvinceState('ready')
        }
      })
      .catch(() => active && setProvinceState('error'))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!values.provinceId) return
    let active = true
    void eventApi
      .wards(values.provinceId)
      .then((items) => {
        if (active) {
          setWards(items as Option[])
          setWardState('ready')
        }
      })
      .catch(() => active && setWardState('error'))
    return () => {
      active = false
    }
  }, [values.provinceId])

  const chooseProvince = (provinceId: string) => {
    const province = provinces.find((item) => item.id === provinceId)
    field('provinceId', provinceId)
    field('wardId', '')
    field('city', province?.name ?? '')
  }

  const error = (name: string) => errors[name as keyof OrganizerEventErrors]
  const fieldError = (name: string) =>
    error(name) && (
      <p className="text-sm font-bold text-error" role="alert">
        {error(name)}
      </p>
    )

  return (
    <fieldset disabled={disabled} className="space-y-6">
      <legend className="text-xl font-extrabold text-ink">Thông tin sự kiện</legend>

      <div className="space-y-2">
        <label className="block text-sm font-bold" htmlFor="organizer-event-title">
          Tên sự kiện *
        </label>
        <input
          ref={registerField('title')}
          id="organizer-event-title"
          name="title"
          className={inputClass}
          value={values.title}
          onChange={onChange}
          aria-invalid={Boolean(errors.title)}
        />
        {fieldError('title')}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-bold" htmlFor="organizer-event-category">
            Danh mục *
          </label>
          <select
            ref={registerField('categoryId')}
            id="organizer-event-category"
            name="category"
            className={inputClass}
            value={values.categoryId}
            disabled={categoryState === 'loading'}
            onChange={(event) => {
              const selected = categories.find((item) => item.id === event.target.value)
              field('categoryId', event.target.value)
              field('category', selected?.name ?? '')
            }}
            aria-invalid={Boolean(errors.categoryId)}
          >
            <option value="">
              {categoryState === 'loading' ? 'Đang tải danh mục…' : 'Chọn danh mục'}
            </option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {fieldError('categoryId')}
          {categoryState === 'error' && (
            <p className="text-xs text-error">
              Không tải được danh mục.{' '}
              <button
                className={retryClass}
                type="button"
                onClick={() => setCategoryRequest((value) => value + 1)}
              >
                Thử lại
              </button>
            </p>
          )}
        </div>

        <OrganizerImagePicker
          label="Ảnh thumbnail"
          value={values.thumbnail}
          onChange={(value) => field('thumbnail', value)}
          disabled={disabled}
        />
      </div>

      <OrganizerImagePicker
        label="Ảnh cover ngang"
        value={values.coverImage}
        onChange={(value) => field('coverImage', value)}
        disabled={disabled}
        maxMb={5}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <label className="block text-sm font-bold" htmlFor="organizer-event-province">
            Tỉnh/thành phố *
          </label>
          <select
            ref={registerField('provinceId')}
            id="organizer-event-province"
            name="provinceId"
            className={inputClass}
            value={values.provinceId}
            disabled={provinceState === 'loading'}
            onChange={(event) => chooseProvince(event.target.value)}
            aria-invalid={Boolean(errors.provinceId)}
          >
            <option value="">
              {provinceState === 'loading' ? 'Đang tải tỉnh/thành…' : 'Chọn tỉnh/thành phố'}
            </option>
            {provinces.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {fieldError('provinceId')}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold" htmlFor="organizer-event-ward">
            Phường/xã
          </label>
          <select
            ref={registerField('wardId')}
            id="organizer-event-ward"
            name="wardId"
            className={inputClass}
            value={values.wardId}
            onChange={onChange}
            disabled={!values.provinceId || wardState === 'loading'}
            aria-invalid={Boolean(errors.wardId)}
          >
            <option value="">
              {!values.provinceId
                ? 'Chọn tỉnh/thành phố trước'
                : 'Chọn phường/xã (tùy chọn)'}
            </option>
            {wards.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          {fieldError('wardId')}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold" htmlFor="organizer-event-street">
            Đường/phố *
          </label>
          <input
            ref={registerField('street')}
            id="organizer-event-street"
            name="street"
            className={inputClass}
            value={values.street}
            onChange={onChange}
            aria-invalid={Boolean(errors.street)}
          />
          {fieldError('street')}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-bold">Thông tin sự kiện</span>
        <div
          ref={editor}
          className="min-h-28 rounded-md border border-line bg-paper p-3 outline-none"
          contentEditable
          role="textbox"
          aria-label="Thông tin sự kiện"
          suppressContentEditableWarning
          onInput={(event) =>
            field('description', sanitizeOrganizerHtml(event.currentTarget.innerHTML))
          }
        />
      </div>

      <OrganizerImagePicker
        label="Logo ban tổ chức"
        value={values.organizerLogo}
        onChange={(value) => field('organizerLogo', value)}
        disabled={disabled}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold">
          Tên ban tổ chức
          <input
            className={inputClass}
            name="organizerName"
            value={values.organizerName}
            onChange={onChange}
          />
        </label>
        <label className="block text-sm font-bold">
          Mô tả ban tổ chức
          <textarea
            className={inputClass}
            name="organizerBio"
            value={values.organizerBio}
            onChange={onChange}
          />
        </label>
      </div>
    </fieldset>
  )
}
