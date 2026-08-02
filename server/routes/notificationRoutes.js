const router = require('express').Router();
const c = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', c.getAll);
router.get('/unread-count', c.getUnreadCount);
router.patch('/:id/read', c.markAsRead);
router.patch('/read-all', c.markAllAsRead);
router.delete('/:id', c.deleteNotification);

module.exports = router;
