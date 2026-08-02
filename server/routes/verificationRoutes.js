const router = require('express').Router();
const c = require('../controllers/verificationController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');
const { extractDeviceInfo } = require('../middleware/deviceInfo');

router.use(protect);
router.post('/', c.createRequest);
router.get('/', c.getAll);
router.get('/queue', authorize('bank', 'notary', 'admin'), c.getQueue);
router.get('/:id', c.getById);
router.patch('/:id/assign', authorize('admin'), c.assignReviewer);
router.patch('/:id/review', authorize('bank', 'notary', 'admin'), extractDeviceInfo, c.submitReview);

module.exports = router;
