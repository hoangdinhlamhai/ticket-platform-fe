export function getProfileInitials(fullName: string) {
  const words = fullName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 1).toLocaleUpperCase('vi-VN')
  return `${words[0][0]}${words.at(-1)?.[0] ?? ''}`.toLocaleUpperCase('vi-VN')
}
