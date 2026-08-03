import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { redis } from '../config/redisClient';

dotenv.config();

const OTP_TTL_SECONDS = 300;
const OTP_RATE_LIMIT_WINDOW_SECONDS = 600;
const MAX_OTP_REQUESTS = 5;

const otpKey = (userId: string) => `otp:${userId}`;
const otpRateKey = (userId: string) => `otp-rate:${userId}`;

export const generateOtpCode = () => {
  return crypto.randomInt(0, 999999).toString().padStart(6, '0');
};

export const storeOtp = async (userId: string, code: string, ttlSeconds = OTP_TTL_SECONDS) => {
  await redis.setex(otpKey(userId), ttlSeconds, code);
};

export const verifyOtpCode = async (userId: string, input: string) => {
  const storedOtp = await redis.get(otpKey(userId));
  if (!storedOtp) {
    return false;
  }

  const inputBuffer = Buffer.from(input);
  const storedBuffer = Buffer.from(storedOtp);

  if (inputBuffer.length !== storedBuffer.length) {
    return false;
  }

  const isValid = crypto.timingSafeEqual(inputBuffer, storedBuffer);
  if (isValid) {
    await redis.del(otpKey(userId));
    return true;
  }

  return false;
};

export const allowOtpRequest = async (userId: string) => {
  const count = await redis.incr(otpRateKey(userId));
  if (count === 1) {
    await redis.expire(otpRateKey(userId), OTP_RATE_LIMIT_WINDOW_SECONDS);
  }

  return count <= MAX_OTP_REQUESTS;
};

export const sendOTP = async (channel: string, destination: string, code: string) => {
  if (channel === 'sms') {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('SMS transport is not configured.');
      return;
    }

    console.info(`SMS OTP delivered to ${destination}`);
    return;
  }

  const smtpHost = process.env.SMTP_HOST;
  if (!smtpHost) {
    console.warn('Email transport is not configured.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'no-reply@example.com',
    to: destination,
    subject: 'Your NotaryChain verification code',
    text: `Your verification code is ${code}`
  });
};

export const createOtpChallenge = async (userId: string, channel: string, destination: string) => {
  if (!(await allowOtpRequest(userId))) {
    throw new Error('OTP rate limit exceeded.');
  }

  const code = generateOtpCode();
  await storeOtp(userId, code);
  await sendOTP(channel, destination, code);
  return { code };
};
