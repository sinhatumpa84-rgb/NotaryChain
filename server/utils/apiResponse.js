exports.success = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data, timestamp: new Date() });
};

exports.error = (res, message = 'Error', statusCode = 500, errors = null) => {
  res.status(statusCode).json({ success: false, message, errors, timestamp: new Date() });
};

exports.paginated = (res, data, page, limit, total, message = 'Success') => {
  res.status(200).json({
    success: true,
    message,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    timestamp: new Date()
  });
};
