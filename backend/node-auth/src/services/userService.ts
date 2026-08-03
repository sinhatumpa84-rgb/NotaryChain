import { v4 as uuidv4 } from 'uuid';
import { UserRecord } from '../types/auth';

const users = new Map<string, UserRecord>();

export const createOrGetUser = (input: { id?: string; email: string; displayName?: string; firebaseUid?: string }) => {
  const existingUser = Array.from(users.values()).find((user) => user.email === input.email);
  if (existingUser) {
    return existingUser;
  }

  const user: UserRecord = {
    id: input.id ?? uuidv4(),
    email: input.email,
    displayName: input.displayName,
    firebaseUid: input.firebaseUid ?? input.id ?? uuidv4(),
    createdAt: new Date().toISOString()
  };

  users.set(user.id, user);
  return user;
};

export const getUserByEmail = (email: string) => {
  return Array.from(users.values()).find((user) => user.email === email);
};

export const getUserByFirebaseUid = (firebaseUid: string) => {
  return Array.from(users.values()).find((user) => user.firebaseUid === firebaseUid);
};
