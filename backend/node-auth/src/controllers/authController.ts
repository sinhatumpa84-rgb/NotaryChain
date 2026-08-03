import { Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createFirebaseUser, verifyFirebaseIdToken } from '../config/firebase';
import { createOtpChallenge, verifyOtpCode } from '../services/otpService';
import { createOrGetUser } from '../services/userService';
import { deleteSession, issueTokens, revokeRefreshToken, rotateRefreshToken } from '../services/sessionService';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().optional(),
  channel: z.enum(['email', 'sms']).optional().default('email')
});

const loginSchema = z.object({
  email: z.string().email(),
  firebaseIdToken: z.string().min(10),
  channel: z.enum(['email', 'sms']).optional().default('email')
});

const otpSchema = z.object({
  userId: z.string().min(1),
  otp: z.string().length(6),
  deviceInfo: z.string().optional()
});

const resendOtpSchema = z.object({
  email: z.string().email(),
  firebaseIdToken: z.string().min(10),
  channel: z.enum(['email', 'sms']).optional().default('email')
});

const logoutSchema = z.object({
  sessionId: z.string().optional(),
  refreshToken: z.string().optional()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export const signup = async (req: Request, res: Response) => {
  try {
    const body = signupSchema.parse(req.body);
    const firebaseUser = await createFirebaseUser({
      email: body.email,
      password: body.password,
      displayName: body.displayName
    });

    createOrGetUser({
      id: firebaseUser.uid,
      email: body.email,
      displayName: body.displayName,
      firebaseUid: firebaseUser.uid
    });

    return res.status(201).json({
      message: 'User created successfully.',
      userId: firebaseUser.uid
    });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to create account.', error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);
    const decoded = await verifyFirebaseIdToken(body.firebaseIdToken);
    createOrGetUser({
      id: decoded.uid,
      email: body.email,
      firebaseUid: decoded.uid
    });

    await createOtpChallenge(decoded.uid, body.channel, body.email);

    return res.status(200).json({
      message: 'OTP sent. Complete verification to finish login.',
      otpRequired: true,
      userId: decoded.uid
    });
  } catch (error) {
    return res.status(401).json({ message: 'Unable to start login flow.', error: (error as Error).message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const body = otpSchema.parse(req.body);
    const isValid = await verifyOtpCode(body.userId, body.otp);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid verification code.' });
    }

    const sessionId = uuidv4();
    const tokens = await issueTokens(body.userId, sessionId, body.deviceInfo);

    return res.status(200).json({
      message: 'OTP verified successfully.',
      ...tokens
    });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to verify OTP.', error: (error as Error).message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const body = resendOtpSchema.parse(req.body);
    const decoded = await verifyFirebaseIdToken(body.firebaseIdToken);
    createOrGetUser({ id: decoded.uid, email: body.email, firebaseUid: decoded.uid });
    await createOtpChallenge(decoded.uid, body.channel, body.email);

    return res.status(200).json({ message: 'OTP resent.', otpRequired: true, userId: decoded.uid });
  } catch (error) {
    return res.status(401).json({ message: 'Unable to resend OTP.', error: (error as Error).message });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const body = logoutSchema.parse(req.body ?? {});
    const sessionId = body.sessionId ?? (req as any).user?.sessionId;
    if (!sessionId) {
      return res.status(400).json({ message: 'No session identifier provided.' });
    }

    await deleteSession(sessionId);
    if (body.refreshToken) {
      await revokeRefreshToken(body.refreshToken);
    }

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(400).json({ message: 'Unable to log out.', error: (error as Error).message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const body = refreshSchema.parse(req.body);
    const tokens = await rotateRefreshToken(body.refreshToken);

    return res.status(200).json({ message: 'Tokens refreshed.', ...tokens });
  } catch (error) {
    return res.status(401).json({ message: 'Unable to refresh token.', error: (error as Error).message });
  }
};
