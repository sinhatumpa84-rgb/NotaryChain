const rateLimit = require('express-rate-limit');
const { TooManyRequestsError } = require('../utils/apiError');
const cb = (req, res, next) => next(new TooManyRequestsError());

exports.globalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, handler: cb });
exports.authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, handler: cb });
exports.uploadLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20, handler: cb });
exports.apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, handler: cb });
