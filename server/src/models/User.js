const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validatePassword } = require('../utils/password');
const { validateEmail } = require('../utils/emailValidator');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [80, 'Name cannot exceed 80 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: {
                validator(value) {
                    return validateEmail(value) === null;
                },
                message(props) {
                    return validateEmail(props.value) || 'Enter a valid email address';
                },
            },
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
            validate: {
                // Only enforce the policy when a new plain-text password is being set.
                validator(value) {
                    if (!this.isModified('password')) return true;
                    return validatePassword(value) === null;
                },
                message(props) {
                    return validatePassword(props.value) || 'Invalid password';
                },
            },
        },
        role: {
            type: String,
            enum: ['admin', 'staff', 'customer'],
            default: 'customer',
            index: true,
        },
        company: {
            type: String,
            trim: true,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
            default: null,
        },
        passwordChangedAt: {
            type: Date,
            default: null,
        },
        passwordResetToken: {
            type: String,
            select: false,
            default: null,
        },
        passwordResetExpires: {
            type: Date,
            select: false,
            default: null,
        },
        isEmailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerificationOtp: {
            type: String,
            select: false,
            default: null,
        },
        emailVerificationOtpExpires: {
            type: Date,
            select: false,
            default: null,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
    return bcrypt.compare(candidate, this.password);
};

userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret._id;
        return ret;
    },
});

module.exports = mongoose.model('User', userSchema);
