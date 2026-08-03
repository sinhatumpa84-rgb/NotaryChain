'use client';

/**
 * Firebase Authentication Context for NotaryChain.
 *
 * Provides:
 *  - user          Firebase User object (null when signed out)
 *  - userProfile   Supabase/DB profile (null when signed out)
 *  - loading       true while the initial auth state is resolving
 *  - mfaResolver   MultiFactorResolver when MFA verification is required
 *  - signOut       Secure logout + redirect
 *  - refreshProfile Reload the DB profile on demand
 *  - setPersistence Toggle "remember me" persistence
 *
 * Token auto-refresh is handled automatically by Firebase via onIdTokenChanged.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import {
  User,
  MultiFactorResolver,
  onIdTokenChanged,
  getRedirectResult,
  signOut as firebaseSignOut,
  getMultiFactorResolver,
  AuthError,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, setAuthPersistence } from '@/lib/firebase';
import { userService, UserProfile } from '@/services/user-service';

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------
export interface AuthContextType {
  /** Firebase User — null when signed out */
  user: User | null;
  /** DB/Supabase user profile — null when signed out */
  userProfile: UserProfile | null;
  /** True while the initial auth state is being resolved */
  loading: boolean;
  /** Set when Firebase requires MFA verification to complete sign-in */
  mfaResolver: MultiFactorResolver | null;
  /** The current Firebase ID token (auto-refreshed) */
  idToken: string | null;
  /** Sign out and redirect to /login */
  signOut: () => Promise<void>;
  /** Reload the DB profile (call after updating profile) */
  refreshProfile: () => Promise<void>;
  /** Set persistent vs session-only login */
  setPersistence: (rememberMe: boolean) => Promise<void>;
  /** Store MFA resolver from a login attempt that requires 2FA */
  setMfaResolver: (resolver: MultiFactorResolver | null) => void;
}

// ---------------------------------------------------------------------------
// Context default (used before Provider mounts)
// ---------------------------------------------------------------------------
const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  mfaResolver: null,
  idToken: null,
  signOut: async () => {},
  refreshProfile: async () => {},
  setPersistence: async () => {},
  setMfaResolver: () => {},
});

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaResolver, setMfaResolver] = useState<MultiFactorResolver | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const router = useRouter();

  // Fetch DB profile for a given Firebase UID
  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      const profile = await userService.getUserProfile(uid);
      setUserProfile(profile);
    } catch (err) {
      console.error('[AuthContext] Error fetching user profile:', err);
      setUserProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchUserProfile(user.uid);
  }, [user, fetchUserProfile]);

  // ---------------------------------------------------------------------------
  // onIdTokenChanged fires:
  //   • on initial load (with null or User)
  //   • when the user signs in
  //   • when the user signs out
  //   • when Firebase automatically refreshes the ID token (~every 60 min)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let active = true;

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (!active || !result?.user) return;

        const token = await result.user.getIdToken();
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('firebase_token', token);
        }
        await fetchUserProfile(result.user.uid);
      } catch (err) {
        console.error('[AuthContext] Redirect sign-in failed:', err);
      }
    };

    void handleRedirectResult();

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          setIdToken(token);
          // Store token in sessionStorage so api-client can pick it up
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('firebase_token', token);
          }
        } catch (err) {
          console.error('[AuthContext] Failed to get ID token:', err);
          setIdToken(null);
        }
        await fetchUserProfile(firebaseUser.uid);
        if (typeof window !== 'undefined' && ['/login', '/register', '/forgot-password'].includes(window.location.pathname)) {
          router.push('/dashboard');
        }
      } else {
        setIdToken(null);
        setUserProfile(null);
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('firebase_token');
        }
      }

      setLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [fetchUserProfile, router]);

  // ---------------------------------------------------------------------------
  // Sign out
  // ---------------------------------------------------------------------------
  const signOut = useCallback(async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
      setIdToken(null);
      setMfaResolver(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('firebase_token');
      }
      router.push('/login');
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    }
  }, [router]);

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------
  const handleSetPersistence = useCallback(async (rememberMe: boolean) => {
    await setAuthPersistence(rememberMe);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        mfaResolver,
        idToken,
        signOut,
        refreshProfile,
        setPersistence: handleSetPersistence,
        setMfaResolver,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Access the auth context. Must be used inside <AuthProvider>. */
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * Protect a route: redirect to `redirectUrl` if the user is not authenticated.
 * Returns the auth context so you can use it on the same page.
 */
export function useRequireAuth(redirectUrl = '/login') {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      router.push(redirectUrl);
    }
  }, [auth.user, auth.loading, router, redirectUrl]);

  return auth;
}

/**
 * Restrict a route to users with specific roles (read from Supabase profile).
 */
export function useRequireRole(allowedRoles: string[], redirectUrl = '/') {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile && !allowedRoles.includes(userProfile.role)) {
      router.push(redirectUrl);
    }
  }, [userProfile, loading, router, allowedRoles, redirectUrl]);

  return { userProfile, loading };
}
