const d = require('../services/documentService');
const r = require('../utils/apiResponse');
const h = require('../utils/helpers');

exports.upload = async (req, res, next) => { try { r.success(res, await d.create({ ...req.body, fileUrl: '/mock.pdf', originalFileName: 'mock.pdf', uploadedBy: req.user._id }), 'Uploaded', 201); } catch (x) { next(x); } };
exports.getAll = async (req, res, next) => { try { const data = await d.getAll(req.user._id, req.user.role, h.getPaginationParams(req.query)); r.paginated(res, data.data, req.query.page || 1, req.query.limit || 10, data.total); } catch (x) { next(x); } };
exports.getById = async (req, res, next) => { try { r.success(res, await d.getById(req.params.id, req.user._id)); } catch (x) { next(x); } };
exports.update = async (req, res, next) => { try { r.success(res, await d.update(req.params.id, req.user._id, req.body)); } catch (x) { next(x); } };
exports.deleteDocument = async (req, res, next) => { try { await d.softDelete(req.params.id, req.user._id); r.success(res, null, 'Deleted'); } catch (x) { next(x); } };
exports.uploadNewVersion = async (req, res, next) => { try { r.success(res, await d.addVersion(req.params.id, req.user._id, { url: '/v2.pdf', name: 'v2', size: 100 }, 'v2')); } catch (x) { next(x); } };
exports.shareDocument = async (req, res, next) => { try { r.success(res, await d.shareDocument(req.params.id, req.user._id, { user: req.body.userId, permission: req.body.permission })); } catch (x) { next(x); } };
exports.removeShare = async (req, res, next) => { try { r.success(res, await d.removeShare(req.params.id, req.user._id, req.params.userId)); } catch (x) { next(x); } };
exports.updateStatus = async (req, res, next) => { try { r.success(res, await d.updateStatus(req.params.id, req.user._id, req.user.role, req.body.status)); } catch (x) { next(x); } };
exports.downloadDocument = async (req, res, next) => { try { r.success(res, { url: 'mock_url' }); } catch (x) { next(x); } };
exports.getTimeline = async (req, res, next) => { try { r.success(res, await d.getTimeline(req.params.id)); } catch (x) { next(x); } };
