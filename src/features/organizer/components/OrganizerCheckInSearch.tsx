import type { RefObject } from 'react'

type Props = {
  query: string
  resultCount: number
  inputRef: RefObject<HTMLInputElement | null>
  onChange: (query: string) => void
  onSearch: () => void
}

export function OrganizerCheckInSearch({ query, resultCount, inputRef, onChange, onSearch }: Props) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form className="rounded-lg border border-line bg-surface p-4" onSubmit={submit}>
      <label className="block text-sm font-extrabold text-ink" htmlFor="organizer-check-in-query">Tra cứu vé mô phỏng</label>
      <p className="mt-1 text-sm text-ink-soft">Nhập tên, email, mã vé hoặc mã đơn. Đây là tra cứu/check-in mô phỏng thủ công, không dùng máy quét.</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input ref={inputRef} id="organizer-check-in-query" className="min-h-12 flex-1 rounded-md border border-line bg-paper px-3" value={query} onChange={(event) => onChange(event.target.value)} placeholder="Ví dụ: Nguyễn Minh Anh hoặc SV-CHAY-001" autoComplete="off" />
        <button className="min-h-12 rounded-md bg-blue px-5 font-extrabold text-paper" type="submit">Tra cứu</button>
      </div>
      {resultCount > 1 && <p className="mt-3 text-sm font-bold text-ink-soft" role="status">Có {resultCount} kết quả. Chọn một người giữ vé trước khi xác nhận check-in.</p>}
    </form>
  )
}
