const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../../config/auth');
const { validatePassword } = require('../../utils/password');
const { validateEmail } = require('../../utils/emailValidator');
const { sendPasswordResetEmail, isEmailConfigured } = require('../../utils/email');
const { sendVerificationOtpEmail } = require('../../utils/resend');
const publicUser = require('../../utils/publicUser');

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 60 minutes
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

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
        const otp = generateOtp();

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            company: company || '',
            role: isFirstUser ? 'admin' : 'customer',
            isEmailVerified: false,
            emailVerificationOtp: otp,
            emailVerificationOtpExpires: new Date(Date.now() + OTP_TTL_MS),
        });

        // Send OTP verification email via Resend
        await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });

        return res.status(201).json({
            success: true,
            requireVerification: true,
            email: user.email,
            message: 'Account created! Please check your email for the 6-digit verification code.',
            data: {
                user: publicUser(user),
                devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
            },
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

        // Email verification check
        if (user.isEmailVerified === false) {
            const otp = generateOtp();
            user.emailVerificationOtp = otp;
            user.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MS);
            await user.save({ validateBeforeSave: false });
            await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });

            return res.status(200).json({
                success: true,
                requireVerification: true,
                email: user.email,
                message: 'Your email address is not verified yet. We have sent a 6-digit verification code to your email.',
                devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
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

// POST /api/auth/send-otp
exports.sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ success: false, message: emailError });
        }

        const user = await User.findOne({ email: normalizeEmail(email) });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email not found' });
        }

        const otp = generateOtp();
        user.emailVerificationOtp = otp;
        user.emailVerificationOtpExpires = new Date(Date.now() + OTP_TTL_MS);
        await user.save({ validateBeforeSave: false });

        await sendVerificationOtpEmail({ to: user.email, name: user.name, otp });

        return res.json({
            success: true,
            message: 'A 6-digit verification code has been sent to your email.',
            devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Could not send verification code' });
    }
};

// POST /api/auth/verify-otp
exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const emailError = validateEmail(email);
        if (emailError) {
            return res.status(400).json({ success: false, message: emailError });
        }

        if (!otp || String(otp).trim().length !== 6) {
            return res.status(400).json({ success: false, message: 'Please enter a valid 6-digit verification code' });
        }

        const user = await User.findOne({ email: normalizeEmail(email) }).select(
            '+emailVerificationOtp +emailVerificationOtpExpires'
        );

        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found' });
        }

        if (!user.emailVerificationOtp || user.emailVerificationOtp !== String(otp).trim()) {
            return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
        }

        if (user.emailVerificationOtpExpires && user.emailVerificationOtpExpires < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'Verification code has expired. Please request a new code.',
            });
        }

        // Verification successful!
        user.isEmailVerified = true;
        user.emailVerificationOtp = null;
        user.emailVerificationOtpExpires = null;
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        return res.json({
            success: true,
            message: 'Email verified successfully!',
            data: { user: publicUser(user), token: signToken(user) },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Verification failed' });
    }
};
