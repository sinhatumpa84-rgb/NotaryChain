const crypto = require('crypto');
const { ENCRYPTION_KEY } = process.env;
const ALGO = 'aes-256-gcm';

exports.encrypt = t => {
  const iv = crypto.randomBytes(16);
  const c = crypto.createCipheriv(ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let e = c.update(t, 'utf8', 'hex'); e += c.final('hex');
  return iv.toString('hex') + ':' + e + ':' + c.getAuthTag().toString('hex');
};

exports.decrypt = t => {
  const [i, e, a] = t.split(':');
  const d = crypto.createDecipheriv(ALGO, Buffer.from(ENCRYPTION_KEY, 'hex'), Buffer.from(i, 'hex'));
  d.setAuthTag(Buffer.from(a, 'hex'));
  let p = d.update(e, 'hex', 'utf8'); p += d.final('utf8');
  return p;
};

exports.hashData = d => crypto.createHash('sha256').update(d).digest('hex');
exports.generateKey = () => crypto.randomBytes(32).toString('hex');
