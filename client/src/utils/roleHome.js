export function roleHome(user) {
  return user?.role === 'customer' ? '/portal' : '/internal'
}
