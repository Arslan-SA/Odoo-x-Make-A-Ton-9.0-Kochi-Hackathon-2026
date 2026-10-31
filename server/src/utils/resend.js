/**
 * Resend Email Service for Brightloop
 * Sends OTP verification codes and transactional notifications using Resend API.
 */

const { Resend } = require('resend');

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_FROM =
  process.env.RESEND_FROM || 'Brightloop <onboarding@resend.dev>';

let resendClient = null;

function getResendClient() {
  if (!resendClient) {
    if (!RESEND_API_KEY) {
      return null;
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

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

/**
 * Send 6-digit OTP email for account verification
 */
async function sendVerificationOtpEmail({ to, name = 'there', otp }) {
  const subject = `Your Brightloop Verification Code: ${otp}`;
  const safeName = escapeHtml(name);

  const text = [
    `Hi ${name},`,
    '',
    `Your Brightloop verification code is: ${otp}`,
    '',
    'This code will expire in 10 minutes.',
    'If you did not request this verification, you can safely ignore this email.',
    '',
    'Best regards,',
    'The Brightloop Team',
  ].join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0B1A35;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);">
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                            Brightloop
                          </h1>
                          <p style="margin: 4px 0 0 0; font-size: 12px; color: #e0e7ff; text-transform: uppercase; letter-spacing: 1px;">
                            Subscription Management Platform
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 32px;">
                    <h2 style="margin: 0 0 12px 0; font-size: 18px; font-weight: 600; color: #0B1A35;">
                      Verify your email address
                    </h2>
                    <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                      Hi <strong>${safeName}</strong>,<br>
                      Use the 6-digit verification code below to verify your email address and activate your account:
                    </p>

                    <!-- OTP Code Box -->
                    <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                      <span style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #4f46e5; display: inline-block;">
                        ${otp}
                      </span>
                    </div>

                    <p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                      ⏱️ <strong>Note:</strong> This verification code is valid for <strong>10 minutes</strong>.
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                      If you did not request this email, no further action is required.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                      © 2026 Brightloop. All rights reserved. Odoo x Make-A-Ton 9.0 Hackathon.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn(`[resend] RESEND_API_KEY is not set. Logging verification OTP for ${to}: ${otp}`);
      return { delivered: false, devOtp: otp, note: 'RESEND_API_KEY not configured' };
    }
    const result = await resend.emails.send({
      from: RESEND_FROM,
      to: [to],
      subject,
      text,
      html,
    });

    console.log(`[resend] OTP email dispatched to ${to} (id: ${result.data?.id || 'ok'})`);
    return { delivered: true, id: result.data?.id, devOtp: otp };
  } catch (error) {
    console.warn(`[resend] Email delivery note for ${to}:`, error.message);
    // In hackathon / dev mode, log OTP so workflow is never blocked
    console.log(`[resend-dev] Verification OTP for ${to}: ${otp}`);
    return { delivered: false, error: error.message, devOtp: otp };
  }
}

module.exports = {
  sendVerificationOtpEmail,
  getResendClient,
};
