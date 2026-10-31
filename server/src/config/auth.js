const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('[auth] JWT_SECRET is not set - using an insecure development fallback.');
}

module.exports = {
    JWT_SECRET: JWT_SECRET || 'brightloop-insecure-development-secret',
    JWT_EXPIRES_IN,
};
