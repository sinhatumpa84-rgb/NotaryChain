const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const { v4: uuidv4 } = require('uuid');

exports.setupSecurity = (app) => {
  app.use(helmet({ contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false }));
  app.use(xss());
  app.use(mongoSanitize());
  app.use(hpp({ whitelist: ['sort', 'page', 'limit', 'fields'] }));
  app.use(compression());
  app.use((req, res, next) => {
    req.requestId = uuidv4();
    res.setHeader('X-Request-Id', req.requestId);
    next();
  });
};
