const Joi = require('joi');
const pwd = Joi.string().min(8).pattern(/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/).required().messages({
  'string.pattern.base': 'Password must be at least 8 characters and contain at least one letter and one number',
  'string.min': 'Password must be at least 8 characters'
});

exports.signupSchema = Joi.object({
  email: Joi.string().email().required(),
  password: pwd,
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  role: Joi.string().valid('admin', 'company', 'bank', 'notary'),
  phone: Joi.string().allow('')
});

exports.loginSchema = Joi.object({ email: Joi.string().email().required(), password: Joi.string().required() });
exports.forgotPasswordSchema = Joi.object({ email: Joi.string().email().required() });
exports.resetPasswordSchema = Joi.object({ password: pwd, confirmPassword: Joi.string().valid(Joi.ref('password')).required() });

exports.documentUploadSchema = Joi.object({
  title: Joi.string().max(200).required(), description: Joi.string().max(2000).allow(''), category: Joi.string().allow(''), tags: Joi.array().items(Joi.string()).optional()
});
exports.documentUpdateSchema = Joi.object({ title: Joi.string().max(200), description: Joi.string().max(2000), category: Joi.string(), tags: Joi.array().items(Joi.string()) });
exports.documentShareSchema = Joi.object({ userId: Joi.string().required(), permission: Joi.string().valid('read', 'write', 'admin').required() });
exports.documentStatusSchema = Joi.object({ status: Joi.string().valid('draft', 'pending_verification', 'under_review', 'approved', 'rejected', 'notarized').required() });

exports.updateProfileSchema = Joi.object({ firstName: Joi.string(), lastName: Joi.string(), phone: Joi.string().allow(''), avatar: Joi.string().allow('') });
exports.changePasswordSchema = Joi.object({ currentPassword: Joi.string().required(), newPassword: pwd, confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required() });

exports.paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().allow('')
});
