import { NextFunction, Request, Response } from 'express';
import { verifyFirebaseIdToken } from '../config/firebase';
import { getSession } from '../services/sessionService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    sessionId: string;
    [key: string]: unknown;
  };
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const firebaseToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  const sessionId = typeof req.headers['x-session-id'] === 'string' ? req.headers['x-session-id'] : undefined;

  if (!firebaseToken || !sessionId) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  try {
    const decoded = await verifyFirebaseIdToken(firebaseToken);
    const session = await getSession(sessionId);

    if (!session || session.userId !== decoded.uid) {
      return res.status(401).json({ message: 'Invalid or expired session.' });
    }

    req.user = {
      userId: decoded.uid,
      sessionId,
      ...decoded
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unable to verify authentication token.' });
  }
};
