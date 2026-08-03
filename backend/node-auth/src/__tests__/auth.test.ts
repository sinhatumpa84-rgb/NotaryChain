import { generateOtpCode, storeOtp, verifyOtpCode } from '../services/otpService';
import { authenticate } from '../middleware/authenticate';

jest.mock('../config/redisClient', () => ({
  redis: {
    setex: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn()
  }
}));

jest.mock('../config/firebase', () => ({
  verifyFirebaseIdToken: jest.fn()
}));

jest.mock('../services/sessionService', () => ({
  getSession: jest.fn()
}));

const redisMock = jest.requireMock('../config/redisClient').redis as {
  setex: jest.Mock;
  get: jest.Mock;
  del: jest.Mock;
  incr: jest.Mock;
  expire: jest.Mock;
};

describe('OTP service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a 6-digit code and stores it in Redis', async () => {
    const code = generateOtpCode();

    expect(code).toMatch(/^\d{6}$/);

    await storeOtp('user-1', code, 120);
    expect(redisMock.setex).toHaveBeenCalledWith('otp:user-1', 120, code);
  });

  it('verifies a matching OTP and deletes the Redis key', async () => {
    redisMock.get.mockResolvedValue('123456');

    const isValid = await verifyOtpCode('user-1', '123456');

    expect(isValid).toBe(true);
    expect(redisMock.del).toHaveBeenCalledWith('otp:user-1');
  });
});

describe('auth middleware', () => {
  it('accepts a valid Firebase token and Redis session', async () => {
    const verifyFirebaseIdTokenMock = jest.requireMock('../config/firebase').verifyFirebaseIdToken as jest.Mock;
    verifyFirebaseIdTokenMock.mockResolvedValue({ uid: 'firebase-user-1' });
    const { getSession } = jest.requireMock('../services/sessionService') as { getSession: jest.Mock };
    getSession.mockResolvedValue({ userId: 'firebase-user-1', sessionId: 'session-1' });

    const req: any = {
      headers: {
        authorization: 'Bearer mock-token',
        'x-session-id': 'session-1'
      }
    };
    const res: any = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await authenticate(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe('firebase-user-1');
  });
});
