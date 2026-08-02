const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleAuth');

router.use(protect, authorize('admin'));
router.get('/users', c.getAllUsers);
router.get('/users/:id', c.getUserById);
router.patch('/users/:id/role', c.updateUserRole);
router.patch('/users/:id/toggle-active', c.toggleUserActive);
router.get('/system-health', c.getSystemHealth);
router.get('/login-history', c.getLoginHistory);
router.get('/fraud-reports', c.getFraudReports);
router.patch('/fraud-reports/:id', c.updateFraudReport);

module.exports = router;
