/**
 * Authentication hook
 */
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { authService, UserProfile } from '@/services/auth-service';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (uid: string) => {
    try {
      const profile = await authService.getUserProfile(uid);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  useEffect(() => {
    console.log('[Auth] Setting up onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] onAuthStateChanged fired:', firebaseUser ? `uid=${firebaseUser.uid}, email=${firebaseUser.email}` : 'null (logged out)');
      
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          console.log('[Auth] Firebase ID token obtained, length:', token.length);
        } catch (e) {
          console.error('[Auth] Failed to get ID token:', e);
        }
        console.log('[Auth] Fetching user profile from Supabase');
        await fetchUserProfile(firebaseUser.uid);
      } else {
        console.log('[Auth] No Firebase user, clearing profile');
        setUserProfile(null);
      }
      
      setLoading(false);
      console.log('[Auth] Auth state initialization complete');
    });

    return () => {
      console.log('[Auth] Cleaning up onAuthStateChanged listener');
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setUserProfile(null);
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

/**
 * Hook to protect routes
 */
export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading };
}

/**
 * Hook to check user role
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
