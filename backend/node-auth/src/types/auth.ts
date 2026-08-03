export interface UserRecord {
  id: string;
  email: string;
  displayName?: string;
  firebaseUid: string;
  createdAt: string;
}

export interface SessionRecord {
  userId: string;
  sessionId: string;
  deviceInfo?: string;
  createdAt: string;
  expiresAt: string;
}

export interface RefreshTokenRecord {
  sessionId: string;
  createdAt: string;
}
