function getErrorCode(error) {
  return typeof error?.code === 'string' ? error.code : undefined;
}

function shouldUseRedirectFlow(error, hostname = '') {
  const code = getErrorCode(error);
  const normalizedHostname = hostname.toLowerCase();
  const isLocalhost = ['localhost', '127.0.0.1'].includes(normalizedHostname);

  if (!isLocalhost) {
    return false;
  }

  return [
    'auth/popup-blocked',
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/operation-not-supported-in-this-environment',
    'auth/unauthorized-domain',
  ].includes(code);
}

function normalizeAuthErrorPayload(error, fallbackMessage = 'Authentication failed', options = {}) {
  const code = getErrorCode(error);
  const message = code === 'auth/multi-factor-auth-required' ? 'MFA_REQUIRED' : error?.message || fallbackMessage;

  return {
    code,
    message,
    resolver: error?.resolver ?? null,
    logContext: {
      code,
      message: error?.message || fallbackMessage,
      provider: options.provider || 'authentication',
      email: error?.customData?.email || error?.email || null,
      credential: error?.credential || null,
    },
  };
}

module.exports = {
  normalizeAuthErrorPayload,
  shouldUseRedirectFlow,
};
