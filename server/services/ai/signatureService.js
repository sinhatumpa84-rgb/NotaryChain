class SignatureService {
  async verifySignature(id, s) { return { valid: true }; }
  async generateDigitalSignature(id, u) { return { signature: 'mock_sig' }; }
  async validateCertificate(c) { return { valid: true }; }
}
module.exports = SignatureService;
