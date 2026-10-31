const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/auth');
const { validatePassword } = require('../../utils/password');
const { validateEmail } = require('../../utils/emailValidator');
const { sendPasswordResetEmail, isEmailConfigured } = require('../../utils/email');
const publicUser = require('../../utils/publicUser');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes

const normalizeEmail = (email = '') => String(email).trim().toLowerCase();

const signToken = (user) =>
    jwt.sign({ sub: user._id.toString(), role: user.role }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// POST /api/auth/register
// The first account bootstraps the workspace as admin; everyone after is a customer.
exports.register = async (req, res) => {
    try {
        const { name, email, password, company } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required',
            });
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ success: false, message: emailError });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, message: passwordError });
        }

        const normalizedEmail = normalizeEmail(email);
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'username already exists',
            });
        }

        const isFirstUser = (await User.countDocuments()) === 0;

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            company: company || '',
            role: isFirstUser ? 'admin' : 'customer',
        });

        return res.status(201).json({
            success: true,
            data: { user: publicUser(user), token: signToken(user) },
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: ,'Email already in use',
            });
        }
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors)[0]?.message || 'Invalid account details';
            return res.status(400).json({ success: false, message });
        }
        return res.status(500).json({
            success: false,
            message: 'Could not create the account',
        });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required',
            });
        }

        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ success: false, message: emailError });
        }

        const user = await User.findOne({ email: normalizeEmail(email) }).select('+password');

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        const matches = await user.comparePassword(password);
        if (!matches) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        return res.json({
            success: true,
            data: { user: publicUser(user), token: signToken(user) },
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Could not sign in',
        });
    }
};

// GET /api/auth/me
exports.me = async (req, res) =>
    res.json({ success: true, data: { user: publicUser(req.user) } });

// POST /api/auth/logout
// JWTs are stateless; the client discards the token. Kept for a consistent API.
exports.logout = async (_req, res) =>
    res.json({ success: true, message: 'Logged out' });

// POST /api/auth/forgot-password
// Always returns the same message so the endpoint cannot be used to enumerate accounts.
exports.forgotPassword = async (req, res) => {
    const response = {
        success: true,
        message: 'If an account exists for that email, a reset link has been sent.',
    };

    try {
        const rawEmail = req.body.email;
        const emailError = validateEmail(rawEmail);
        if (emailError) {
            return res.status(400).json({ success: false, message: emailError });
        }
        const email = normalizeEmail(rawEmail);

        const user = await User.findOne({ email });
        if (!user || !user.isActive) {
            return res.json(response);
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = hashResetToken(rawToken);
        user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
        await user.save({ validateBeforeSave: false });

        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

        try {
            await sendPasswordResetEmail({ to: user.email, name: user.name, resetUrl });
        } catch (emailError) {
            console.error('[auth] Could not send password reset email:', emailError.message);
        }

        // In local development without SMTP, expose the link so the flow can be demoed.
        if (!isEmailConfigured() && process.env.NODE_ENV !== 'production') {
            response.devResetUrl = resetUrl;
        }

        return res.json(response);
    } catch (err) {
        console.error('[auth] Forgot-password error:', err.message);
        return res.json(response);
    }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required',
            });
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
            return res.status(400).json({ success: false, message: passwordError });
        }

        const user = await User.findOne({
            passwordResetToken: hashResetToken(token),
            passwordResetExpires: { $gt: new Date() },
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'This reset link is invalid or has expired. Request a new one.',
            });
        }

        user.password = password;
        user.passwordChangedAt = new Date();
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return res.json({
            success: true,
            message: 'Password reset successfully. You can sign in with your new password.',
        });
    } catch (err) {
        if (err.name === 'ValidationError') {
            const message = Object.values(err.errors)[0]?.message || 'Invalid password';
            return res.status(400).json({ success: false, message });
        }
        return res.status(500).json({
            success: false,
            message: 'Could not reset the password',
        });
    }
};
