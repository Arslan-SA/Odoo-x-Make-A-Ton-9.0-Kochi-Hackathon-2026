const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePassword } = require('../src/utils/password');

test('accepts a password that meets the full policy', () => {
    assert.equal(validatePassword('Admin@12345'), null);
});

test('accepts every seeded demo password', () => {
    for (const password of ['Admin@12345', 'Staff@12345', 'Customer@12345']) {
        assert.equal(validatePassword(password), null, `${password} should be valid`);
    }
});

test('rejects an empty password', () => {
    assert.equal(validatePassword(''), 'Password is required');
    assert.equal(validatePassword(null), 'Password is required');
});

test('rejects a password shorter than nine characters', () => {
    assert.match(validatePassword('Ab@1'), /at least 9 characters/);
});

test('rejects a password without an uppercase letter', () => {
    assert.match(validatePassword('admin@12345'), /uppercase/);
});

test('rejects a password without a lowercase letter', () => {
    assert.match(validatePassword('ADMIN@12345'), /lowercase/);
});

test('rejects a password without a special character', () => {
    assert.match(validatePassword('Admin12345'), /special character/);
});
