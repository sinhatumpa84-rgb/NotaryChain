const router = require('express').Router();
const c = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.use(protect);
router.get('/admin', authorize('admin'), c.getAdminDashboard);
router.get('/company', authorize('company'), c.getCompanyDashboard);
router.get('/bank', authorize('bank'), c.getBankDashboard);
router.get('/notary', authorize('notary'), c.getNotaryDashboard);

module.exports = router;
