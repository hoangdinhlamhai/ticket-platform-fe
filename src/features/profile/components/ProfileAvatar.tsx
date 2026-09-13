import { getProfileInitials } from '../helpers/get-profile-initials'

type ProfileAvatarProps = {
  fullName: string
  size?: 'compact' | 'large'
}

export function ProfileAvatar({ fullName, size = 'large' }: ProfileAvatarProps) {
  const sizeClass = size === 'compact' ? 'h-9 w-9 text-[0.72rem]' : 'h-20 w-20 text-xl'

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-pine font-extrabold tracking-[0.06em] text-paper ${sizeClass}`}
      aria-hidden="true"
    >
      {getProfileInitials(fullName)}
    </span>
  )
}
