const router = require('express').Router();
const faceController = require('../controllers/faceController');
const { protect } = require('../middleware/auth');
const { extractDeviceInfo } = require('../middleware/deviceInfo');

// Public route: Recognize & Login via Webcam Face Scan
router.post('/login', extractDeviceInfo, faceController.recognizeAndLogin);

// Protected routes: Register & Delete Face Template
router.post('/register', protect, faceController.registerFace);
router.get('/status', protect, faceController.getFaceStatus);
router.delete('/delete', protect, faceController.deleteFace);

module.exports = router;
