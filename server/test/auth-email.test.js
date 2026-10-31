const test = require('node:test');
const assert = require('node:assert/strict');
const { validateEmail } = require('../src/utils/emailValidator');

test('accepts valid email addresses', () => {
    const validEmails = [
        'admin@brightloop.dev',
        'staff@brightloop.dev',
        'customer@brightloop.dev',
        'user.name+tag@example.com',
        'support@company.co.uk',
        'billing@subdomain.domain.org',
    ];

    for (const email of validEmails) {
        assert.equal(validateEmail(email), null, `${email} should be accepted as valid`);
    }
});

test('rejects empty or null email', () => {
    assert.equal(validateEmail(''), 'Email address is required');
    assert.equal(validateEmail('   '), 'Email address is required');
    assert.equal(validateEmail(null), 'Email address is required');
    assert.equal(validateEmail(undefined), 'Email address is required');
});

test('rejects email without @ symbol', () => {
    assert.match(validateEmail('invalidemail.com'), /valid email address/i);
    assert.match(validateEmail('plaintext'), /valid email address/i);
});

test('rejects email without domain or TLD', () => {
    assert.match(validateEmail('user@'), /valid email address/i);
    assert.match(validateEmail('@domain.com'), /valid email address/i);
    assert.match(validateEmail('user@localhost'), /valid email address/i);
});

test('rejects email with spaces', () => {
    assert.match(validateEmail('user name@example.com'), /valid email address/i);
    assert.match(validateEmail('user@exam ple.com'), /valid email address/i);
});

test('rejects excessively long email (>254 chars)', () => {
    const longLocal = 'a'.repeat(250);
    assert.match(validateEmail(`${longLocal}@example.com`), /cannot exceed 254 characters/i);
});
