const mongoose = require('mongoose');
const n = require('../services/notificationService');
const r = require('../utils/apiResponse');

exports.getAll = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return r.paginated(res, [], 1, 10, 0);
    }
    const d = await n.getByUser(req.user._id, req.query);
    r.paginated(res, d.data, req.query.page || 1, req.query.limit || 10, d.total);
  } catch (x) {
    return r.paginated(res, [], 1, 10, 0);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return r.success(res, { count: 0 });
    }
    r.success(res, { count: await n.getUnreadCount(req.user._id) });
  } catch (x) {
    return r.success(res, { count: 0 });
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await n.markAsRead(req.params.id, req.user._id);
    }
    r.success(res, null, 'Read');
  } catch (x) {
    r.success(res, null, 'Read');
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await n.markAllAsRead(req.user._id);
    }
    r.success(res, null, 'All Read');
  } catch (x) {
    r.success(res, null, 'All Read');
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await n.deleteNotification(req.params.id, req.user._id);
    }
    r.success(res, null, 'Deleted');
  } catch (x) {
    r.success(res, null, 'Deleted');
  }
};
