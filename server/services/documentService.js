const Document = require('../models/Document');
const { NotFoundError, ForbiddenError } = require('../utils/apiError');

exports.create = async (d) => await Document.create(d);

exports.getById = async (id, uId) => {
  const d = await Document.findById(id).populate('uploadedBy sharedWith.user assignedReviewer', 'firstName lastName email');
  if (!d) throw new NotFoundError();
  const isOwner = d.uploadedBy._id.toString() === uId.toString();
  const isShared = d.sharedWith.some(s => s.user._id.toString() === uId.toString());
  if (!isOwner && !isShared) throw new ForbiddenError();
  return d;
};

exports.getAll = async (uId, role, opts) => {
  const { page, limit, sort, order, search, ...filters } = opts;
  let q = { isDeleted: false, ...filters };
  if (role === 'company') q.$or = [{ uploadedBy: uId }, { 'sharedWith.user': uId }];
  if (search) q.$text = { $search: search };
  const total = await Document.countDocuments(q);
  const data = await Document.find(q).sort({ [sort]: order }).skip((page - 1) * limit).limit(limit).populate('uploadedBy', 'firstName lastName email');
  return { data, total };
};

exports.update = async (id, uId, updates) => await Document.findOneAndUpdate({ _id: id, uploadedBy: uId }, updates, { new: true });
exports.softDelete = async (id, uId) => await Document.findOneAndUpdate({ _id: id, uploadedBy: uId }, { isDeleted: true, deletedAt: Date.now(), deletedBy: uId });
exports.addVersion = async (id, uId, file, notes) => {
  const d = await Document.findOne({ _id: id, uploadedBy: uId });
  if (!d) throw new NotFoundError();
  d.versions.push({ versionNumber: d.currentVersion, fileUrl: d.fileUrl, fileName: d.originalFileName, fileSize: d.fileSize, uploadedAt: d.updatedAt, uploadedBy: uId, changeNotes: notes });
  d.currentVersion += 1;
  d.fileUrl = file.url; d.originalFileName = file.name; d.fileSize = file.size;
  return await d.save();
};
exports.shareDocument = async (id, oId, s) => await Document.findOneAndUpdate({ _id: id, uploadedBy: oId }, { $push: { sharedWith: { ...s, sharedAt: Date.now(), sharedBy: oId } } }, { new: true });
exports.removeShare = async (id, oId, tId) => await Document.findOneAndUpdate({ _id: id, uploadedBy: oId }, { $pull: { sharedWith: { user: tId } } }, { new: true });
exports.updateStatus = async (id, uId, r, s) => await Document.findByIdAndUpdate(id, { status: s }, { new: true });
exports.getTimeline = async (id) => require('../models/AuditLog').find({ documentId: id }).sort({ createdAt: -1 });
exports.getStats = async (uId, r) => await Document.aggregate([{ $match: { isDeleted: false, uploadedBy: r === 'company' ? uId : { $exists: true } } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
