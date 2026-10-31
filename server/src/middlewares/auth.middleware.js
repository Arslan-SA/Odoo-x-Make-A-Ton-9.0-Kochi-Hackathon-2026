const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../config/auth');

const unauthorized = (res, message) =>
    res.status(401).json({ success: false, message });

exports.protect = async (req, res, next) => {
    try {
        const header = req.headers.authorization || '';
        if (!header.startsWith('Bearer ')) {
            return unauthorized(res, 'Not authorized. Please sign in.');
        }

        const token = header.slice('Bearer '.length).trim();
        if (!token) {
            return unauthorized(res, 'Not authorized. Please sign in.');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.sub);

        if (!user || !user.isActive) {
            return unauthorized(res, 'This account is no longer active.');
        }

        // Tokens issued before a password reset are no longer valid.
        if (
            user.passwordChangedAt &&
            decoded.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)
        ) {
            return unauthorized(res, 'Your password was changed. Please sign in again.');
        }

        req.user = user;
        return next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return unauthorized(res, 'Your session has expired. Please sign in again.');
        }
        return unauthorized(res, 'Not authorized. Please sign in.');
    }
};

exports.authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: 'You do not have permission to perform this action.',
        });
    }
    return next();
};
