const express = require('express');
const router = express.Router();
const neobankController = require('../controllers/neobankController');
const { protect } = require('../middleware/auth');
const { extractDeviceInfo } = require('../middleware/deviceInfo');

// All Neobank routes require authentication
router.use(protect);
router.use(extractDeviceInfo);

router.post('/onboard', neobankController.onboard);
router.get('/account', neobankController.getAccount);
router.get('/cash-locations', neobankController.getCashLocations);
router.post('/cash-in', neobankController.createCashIn);
router.post('/virtual-account', neobankController.createVirtualAccount);
router.post('/send', neobankController.sendMoney);
router.post('/withdraw', neobankController.withdrawMoney);
router.get('/transactions', neobankController.getTransactions);

module.exports = router;
