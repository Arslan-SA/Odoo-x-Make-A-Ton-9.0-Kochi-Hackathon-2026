export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_HINT =
  'At least 8 characters with an uppercase letter, a lowercase letter and a special character.'

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  }
  if (!/[A-Z]/.test(password)) return 'Password must include an uppercase letter'
  if (!/[a-z]/.test(password)) return 'Password must include a lowercase letter'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Password must include a special character'
  return null
}
