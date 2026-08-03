import dotenv from 'dotenv';
import { sign } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../config/redisClient';
import { RefreshTokenRecord, SessionRecord } from '../types/auth';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;

const sessionKey = (sessionId: string) => `session:${sessionId}`;
const refreshKey = (token: string) => `refresh:${token}`;

export const createSession = async (userId: string, sessionId: string, deviceInfo?: string) => {
  const now = new Date();
  const session: SessionRecord = {
    userId,
    sessionId,
    deviceInfo,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString()
  };

  await redis.setex(sessionKey(sessionId), SESSION_TTL_SECONDS, JSON.stringify(session));
  return session;
};

export const getSession = async (sessionId: string) => {
  const raw = await redis.get(sessionKey(sessionId));
  if (!raw) {
    return null;
  }

  return JSON.parse(raw) as SessionRecord;
};

export const deleteSession = async (sessionId: string) => {
  await redis.del(sessionKey(sessionId));
};

export const storeRefreshToken = async (sessionId: string, refreshToken: string) => {
  const record: RefreshTokenRecord = {
    sessionId,
    createdAt: new Date().toISOString()
  };

  await redis.setex(refreshKey(refreshToken), REFRESH_TTL_SECONDS, JSON.stringify(record));
};

export const revokeRefreshToken = async (refreshToken: string) => {
  await redis.del(refreshKey(refreshToken));
};

export const issueTokens = async (userId: string, sessionId: string, deviceInfo?: string) => {
  const session = await createSession(userId, sessionId, deviceInfo);
  const accessToken = sign({ sub: userId, sessionId, type: 'access' }, JWT_SECRET, { expiresIn: '15m' });
  const refreshTokenValue = sign({ sub: userId, sessionId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

  await storeRefreshToken(session.sessionId, refreshTokenValue);
  return {
    accessToken,
    refreshToken: refreshTokenValue,
    sessionId: session.sessionId
  };
};

export const rotateRefreshToken = async (oldRefreshToken: string) => {
  const raw = await redis.get(refreshKey(oldRefreshToken));
  if (!raw) {
    throw new Error('Invalid refresh token.');
  }

  const record = JSON.parse(raw) as RefreshTokenRecord;
  await redis.del(refreshKey(oldRefreshToken));

  const session = await getSession(record.sessionId);
  if (!session) {
    throw new Error('Session has been revoked.');
  }

  const newRefreshTokenValue = sign({ sub: session.userId, sessionId: record.sessionId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  await storeRefreshToken(record.sessionId, newRefreshTokenValue);

  return {
    accessToken: sign({ sub: session.userId, sessionId: record.sessionId, type: 'access' }, JWT_SECRET, { expiresIn: '15m' }),
    refreshToken: newRefreshTokenValue,
    sessionId: record.sessionId
  };
};
