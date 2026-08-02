const { ValidationError } = require('../utils/apiError');

exports.validate = (schema, property = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[property], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errDetails = error.details.map(x => x.message);
    return next(new ValidationError('Validation Error', errDetails));
  }
  req[property] = value;
  next();
};
