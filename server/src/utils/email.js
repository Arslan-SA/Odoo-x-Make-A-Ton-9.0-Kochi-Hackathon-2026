const nodemailer = require('nodemailer');

const isEmailConfigured = () =>
    Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter = null;

const getTransporter = () => {
    if (!transporter) {
        const port = Number(process.env.SMTP_PORT || 587);
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            secure: port === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};

const escapeHtml = (value = '') =>
    String(value).replace(
        /[&<>"']/g,
        (character) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[character]
    );

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
    const subject = 'Reset your Brightloop password';
    const text = [
        `Hi ${name},`,
        '',
        'We received a request to reset your Brightloop password.',
        `Reset it here: ${resetUrl}`,
        '',
        'This link expires in 60 minutes. If you did not request it, you can ignore this email.',
    ].join('\n');

    if (!isEmailConfigured()) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[auth] SMTP is not configured. Password reset link for ${to}: ${resetUrl}`);
        }
        return { delivered: false };
    }

    const html = `
        <div style="font-family:system-ui,sans-serif;line-height:1.6;color:#0B1A35;max-width:560px">
            <h2 style="margin:0 0 16px">Reset your Brightloop password</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>We received a request to reset your Brightloop password.</p>
            <p style="margin:24px 0">
                <a href="${resetUrl}" style="background:#4f46e5;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:600">
                    Reset password
                </a>
            </p>
            <p>This link expires in 60 minutes. If you did not request it, you can ignore this email.</p>
        </div>
    `;

    await getTransporter().sendMail({
        from: process.env.SMTP_FROM || 'Brightloop <no-reply@brightloop.dev>',
        to,
        subject,
        text,
        html,
    });

    return { delivered: true };
};

module.exports = { sendPasswordResetEmail, isEmailConfigured };
