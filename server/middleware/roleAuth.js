const { ForbiddenError } = require('../utils/apiError');

exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ForbiddenError('User role not authorized for this route'));
  }
  next();
};
