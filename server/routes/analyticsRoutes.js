const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.use(protect, authorize('admin'));
router.get('/documents', c.getDocumentStats);
router.get('/users', c.getUserStats);
router.get('/verifications', c.getVerificationStats);
router.get('/ai-usage', c.getAIUsageStats);
router.get('/overview', c.getSystemOverview);

module.exports = router;
