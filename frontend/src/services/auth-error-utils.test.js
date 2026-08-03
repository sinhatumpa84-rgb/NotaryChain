const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeAuthErrorPayload, shouldUseRedirectFlow } = require('./auth-error-utils');

test('normalizes multi-factor auth errors into an MFA_REQUIRED payload', () => {
  const resolver = { hints: [{ factorId: 'phone' }] };
  const error = {
    code: 'auth/multi-factor-auth-required',
    message: 'Multi-factor authentication required',
    resolver,
  };

  const payload = normalizeAuthErrorPayload(error, 'Google sign-in failed', {
    provider: 'Google sign-in',
  });

  assert.equal(payload.message, 'MFA_REQUIRED');
  assert.equal(payload.code, 'auth/multi-factor-auth-required');
  assert.equal(payload.resolver, resolver);
  assert.equal(payload.logContext.provider, 'Google sign-in');
});

test('uses redirect flow for blocked popups on localhost', () => {
  const error = {
    code: 'auth/popup-blocked',
    message: 'Popup blocked',
  };

  assert.equal(shouldUseRedirectFlow(error, 'localhost'), true);
  assert.equal(shouldUseRedirectFlow(error, 'example.com'), false);
});
