import { BrandMark } from './AuthIcons'

export function AuthBrand() {
  return (
    <a
      className="relative z-[1] inline-flex w-max items-center gap-[0.55rem] font-body text-[1.6rem] font-extrabold tracking-[-0.08em] text-inherit no-underline"
      href="#main-content"
    >
      <BrandMark />
      <span>Ticketly</span>
    </a>
  )
}
