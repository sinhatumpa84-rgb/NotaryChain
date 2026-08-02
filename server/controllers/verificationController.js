const V = require('../models/VerificationRequest');
const r = require('../utils/apiResponse');

exports.createRequest = async (req, res, next) => { try { r.success(res, await V.create({ ...req.body, requestedBy: req.user._id }), 'Created', 201); } catch (x) { next(x); } };
exports.getAll = async (req, res, next) => { try { r.success(res, await V.find()); } catch (x) { next(x); } };
exports.getQueue = async (req, res, next) => { try { r.success(res, await V.find({ assignedTo: req.user._id })); } catch (x) { next(x); } };
exports.getById = async (req, res, next) => { try { r.success(res, await V.findById(req.params.id)); } catch (x) { next(x); } };
exports.assignReviewer = async (req, res, next) => { try { r.success(res, await V.findByIdAndUpdate(req.params.id, { assignedTo: req.body.userId, status: 'assigned' }, { new: true })); } catch (x) { next(x); } };
exports.submitReview = async (req, res, next) => { try { r.success(res, await V.findByIdAndUpdate(req.params.id, { status: req.body.status, reviewNotes: req.body.notes, reviewedAt: Date.now() }, { new: true })); } catch (x) { next(x); } };
