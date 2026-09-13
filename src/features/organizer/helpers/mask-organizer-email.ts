export function maskOrganizerEmail(email: string) {
  const [name, domain] = email.split('@')
  if (!name || !domain) return 'Ẩn email'

  return `${name.slice(0, 2)}${'*'.repeat(Math.max(1, name.length - 2))}@${domain}`
}
