const test = require('node:test');
const assert = require('node:assert/strict');
const { authorize } = require('../src/middlewares/auth.middleware');
const staffRouter = require('../src/modules/users/user.routes');

const runAuthorize = (allowedRoles, userRole) => {
    const response = {
        statusCode: 200,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        },
    };

    let nextCalled = false;
    authorize(...allowedRoles)({ user: { role: userRole } }, response, () => {
        nextCalled = true;
    });

    return { response, nextCalled };
};

test('admin can access admin-only routes', () => {
    const { response, nextCalled } = runAuthorize(['admin'], 'admin');
    assert.equal(nextCalled, true);
    assert.equal(response.statusCode, 200);
});

test('staff cannot access admin-only routes', () => {
    const { response, nextCalled } = runAuthorize(['admin'], 'staff');
    assert.equal(nextCalled, false);
    assert.equal(response.statusCode, 403);
});

test('staff can access internal operations routes', () => {
    const { response, nextCalled } = runAuthorize(['admin', 'staff'], 'staff');
    assert.equal(nextCalled, true);
    assert.equal(response.statusCode, 200);
});

test('customers cannot access internal operations routes', () => {
    const { response, nextCalled } = runAuthorize(['admin', 'staff'], 'customer');
    assert.equal(nextCalled, false);
    assert.equal(response.statusCode, 403);
    assert.match(response.body.message, /permission/i);
});

test('staff management routes mount protect and admin authorize middleware', () => {
    const middlewareLayers = staffRouter.stack.filter((layer) => !layer.route);
    assert.equal(
        middlewareLayers.length,
        2,
        'the staff router must mount protect + authorize(admin) before its routes'
    );
});
