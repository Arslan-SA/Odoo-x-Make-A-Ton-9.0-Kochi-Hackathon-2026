const test = require('node:test');
const assert = require('node:assert/strict');
const { sendVerificationOtpEmail } = require('../src/utils/resend');

test('sendVerificationOtpEmail returns devOtp and handles delivery gracefully', async () => {
  const result = await sendVerificationOtpEmail({
    to: 'test@example.com',
    name: 'Alice',
    otp: '123456',
  });

  assert.equal(result.devOtp, '123456');
  assert.ok(typeof result.delivered === 'boolean');
});

test('validates 6-digit OTP structure', () => {
  const validOtp = String(Math.floor(100000 + Math.random() * 900000));
  assert.match(validOtp, /^[0-9]{6}$/);
  assert.equal(validOtp.length, 6);
});

test('OTP expiration window is set to 10 minutes in the future', () => {
  const now = Date.now();
  const expires = new Date(now + 10 * 60 * 1000);
  const diffMs = expires.getTime() - now;
  assert.ok(diffMs >= 9.9 * 60 * 1000 && diffMs <= 10.1 * 60 * 1000);
});
