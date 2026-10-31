/**
 * Email validation utility according to RFC 5322 standard
 */

const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return 'Email address is required';
  }
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return 'Email address is required';
  }
  if (trimmed.length > 254) {
    return 'Email address cannot exceed 254 characters';
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return 'Please enter a valid email address (e.g. name@company.com)';
  }
  return null;
}

module.exports = {
  EMAIL_REGEX,
  validateEmail,
};
