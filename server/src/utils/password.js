const PASSWORD_MIN_LENGTH = 8;

/**
 * Returns the first password-policy violation, or null when the password is valid.
 * Policy: at least 8 characters, one uppercase, one lowercase and one special character.
 */
const validatePassword = (password) => {
    if (typeof password !== 'string' || password.length === 0) {
        return 'Password is required';
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    }
    if (!/[A-Z]/.test(password)) {
        return 'Password must include an uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
        return 'Password must include a lowercase letter';
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
        return 'Password must include a special character';
    }
    return null;
};

module.exports = { validatePassword, PASSWORD_MIN_LENGTH };
