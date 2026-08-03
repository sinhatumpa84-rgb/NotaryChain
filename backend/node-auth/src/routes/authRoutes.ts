import { Router } from 'express';
import { login, logout, refreshToken, resendOtp, signup, verifyOtp } from '../controllers/authController';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);

export const authRouter = router;
