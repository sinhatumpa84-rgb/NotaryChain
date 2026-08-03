'use client';

/**
 * useAuth — re-exports from AuthContext for backward compatibility.
 *
 * All existing imports of `AuthProvider`, `useAuth`, `useRequireAuth`,
 * `useRequireRole` from '@/hooks/useAuth' continue to work unchanged.
 */

export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useRequireRole,
} from '@/context/AuthContext';

export type { AuthContextType } from '@/context/AuthContext';
