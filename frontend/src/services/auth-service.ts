/**
 * Firebase Authentication Service
 */
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
  User,
  UserCredential,
  AuthError,
  MultiFactorError,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  multiFactor,
  PhoneMultiFactorGenerator,
  MultiFactorResolver,
  getMultiFactorResolver,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
// Removed Firestore imports - now using Supabase
// import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, microsoftProvider, getRecaptchaVerifier } from '@/lib/firebase';
import { userService, UserProfile } from '@/services/user-service';
import { normalizeAuthErrorPayload, shouldUseRedirectFlow } from '@/services/auth-error-utils';
import { UserRole } from '@/types';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

// Re-export UserProfile from user-service
export type { UserProfile } from '@/services/user-service';

class AuthService {
  /**
   * Register new user with email and password
   */
  async register(data: RegisterData): Promise<UserProfile> {
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const user = userCredential.user;

      // Update display name
      await updateProfile(user, {
        displayName: `${data.firstName} ${data.lastName}`,
      });

      // Send email verification
      await sendEmailVerification(user);

      // Create user profile in Supabase (replaces Firestore)
      const userProfile = await userService.createUserProfile(user.uid, {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
        photoURL: user.photoURL || undefined,
      });

      // Sync with backend database (for API access)
      try {
        const { apiClient } = await import('@/lib/api-client');
        await apiClient.post('/auth/firebase/sync', {
          firebase_uid: user.uid,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          role: data.role,
          photo_url: user.photoURL,
          email_verified: user.emailVerified,
        });
      } catch (backendError) {
        console.error('Backend sync failed (non-critical):', backendError);
        // Continue even if backend sync fails
      }

      return userProfile;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Update last login in Supabase
      await userService.updateLastLogin(userCredential.user.uid);

      return userCredential.user;
    } catch (error) {
      const normalizedError = this.normalizeAuthError(error, 'Invalid credentials', 'Email/password sign-in');

      if (normalizedError.code === 'auth/multi-factor-auth-required') {
        throw normalizedError;
      }

      throw normalizedError;
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<User> {
    const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isLocalhost) {
      await signInWithRedirect(auth, googleProvider);
      throw new Error('REDIRECT_REQUIRED');
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);

      // Create or update user profile in Supabase
      await userService.createOrUpdateUserProfile(
        result.user.uid,
        {
          email: result.user.email!,
          displayName: result.user.displayName || undefined,
          photoURL: result.user.photoURL || undefined,
          phoneNumber: result.user.phoneNumber || undefined,
          emailVerified: result.user.emailVerified,
        },
        UserRole.COMPANY
      );

      return result.user;
    } catch (error) {
      const normalized = this.normalizeAuthError(error, 'Google sign-in failed', 'Google sign-in');

      if (shouldUseRedirectFlow(error, typeof window !== 'undefined' ? window.location.hostname : '')) {
        try {
          await signInWithRedirect(auth, googleProvider);
          throw new Error('REDIRECT_REQUIRED');
        } catch (redirectError) {
          throw this.normalizeAuthError(redirectError, 'Google sign-in failed', 'Google sign-in');
        }
      }

      throw normalized;
    }
  }

  /**
   * Sign in with Microsoft
   */
  async signInWithMicrosoft(): Promise<User> {
    const isLocalhost = typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isLocalhost) {
      await signInWithRedirect(auth, microsoftProvider);
      throw new Error('REDIRECT_REQUIRED');
    }

    try {
      const result = await signInWithPopup(auth, microsoftProvider);

      // Create or update user profile in Supabase
      await userService.createOrUpdateUserProfile(
        result.user.uid,
        {
          email: result.user.email!,
          displayName: result.user.displayName || undefined,
          photoURL: result.user.photoURL || undefined,
          phoneNumber: result.user.phoneNumber || undefined,
          emailVerified: result.user.emailVerified,
        },
        UserRole.COMPANY
      );

      return result.user;
    } catch (error) {
      const normalized = this.normalizeAuthError(error, 'Microsoft sign-in failed', 'Microsoft sign-in');

      if (shouldUseRedirectFlow(error, typeof window !== 'undefined' ? window.location.hostname : '')) {
        try {
          await signInWithRedirect(auth, microsoftProvider);
          throw new Error('REDIRECT_REQUIRED');
        } catch (redirectError) {
          throw this.normalizeAuthError(redirectError, 'Microsoft sign-in failed', 'Microsoft sign-in');
        }
      }

      throw normalized;
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
      throw new Error('No authenticated user');
    }

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Send phone verification OTP
   */
  async sendPhoneOTP(phoneNumber: string): Promise<ConfirmationResult> {
    try {
      const recaptchaVerifier = getRecaptchaVerifier();
      if (!recaptchaVerifier) {
        throw new Error('Recaptcha not initialized');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        recaptchaVerifier
      );

      return confirmationResult;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Verify phone OTP
   */
  async verifyPhoneOTP(
    confirmationResult: ConfirmationResult,
    code: string
  ): Promise<UserCredential> {
    try {
      const result = await confirmationResult.confirm(code);
      
      // Update user profile in Supabase
      if (result.user) {
        await userService.updateUserProfile(result.user.uid, {
          isPhoneVerified: true,
          phone: result.user.phoneNumber || undefined,
        });
      }
      
      return result;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Enroll in MFA (Multi-Factor Authentication)
   */
  async enrollMFA(phoneNumber: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const multiFactorSession = await multiFactor(user).getSession();
      const recaptchaVerifier = getRecaptchaVerifier();
      
      if (!recaptchaVerifier) {
        throw new Error('Recaptcha not initialized');
      }

      const phoneInfoOptions = {
        phoneNumber,
        session: multiFactorSession,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );

      return verificationId;
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Complete MFA enrollment
   */
  async completeMFAEnrollment(verificationId: string, code: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    try {
      const cred = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      await multiFactor(user).enroll(multiFactorAssertion, 'Phone Number');

      // Update user profile in Supabase
      await userService.updateUserProfile(user.uid, {
        mfaEnabled: true,
      });
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Verify MFA during sign-in
   */
  async verifyMFASignIn(
    resolver: MultiFactorResolver,
    code: string
  ): Promise<UserCredential> {
    try {
      const phoneInfoOptions = {
        multiFactorHint: resolver.hints[0],
        session: resolver.session,
      };

      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const recaptchaVerifier = getRecaptchaVerifier();
      
      if (!recaptchaVerifier) {
        throw new Error('Recaptcha not initialized');
      }

      const verificationId = await phoneAuthProvider.verifyPhoneNumber(
        phoneInfoOptions,
        recaptchaVerifier
      );

      const cred = PhoneAuthProvider.credential(verificationId, code);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

      return await resolver.resolveSignIn(multiFactorAssertion);
    } catch (error) {
      const authError = error as AuthError;
      throw new Error(this.getErrorMessage(authError.code));
    }
  }

  /**
   * Get user profile from Supabase
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    return userService.getUserProfile(uid);
  }

  /**
   * Update user profile in Supabase
   */
  async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
    await userService.updateUserProfile(uid, data);
  }

  /**
   * Normalize Firebase auth errors so the UI can route MFA flows correctly.
   */
  private normalizeAuthError(error: unknown, fallbackMessage: string, provider: string): Error & { code?: string; resolver?: unknown; customData?: Record<string, unknown>; credential?: unknown } {
    const normalized = normalizeAuthErrorPayload(error, fallbackMessage, { provider });

    const authError = new Error(
      normalized.code === 'auth/multi-factor-auth-required' ? 'MFA_REQUIRED' : this.getErrorMessage(normalized.code || '')
    ) as Error & { code?: string; resolver?: unknown; customData?: Record<string, unknown>; credential?: unknown };

    authError.code = normalized.code;
    authError.resolver = normalized.resolver;
    authError.customData = normalized.logContext as Record<string, unknown>;
    authError.credential = normalized.logContext.credential;

    if (authError.code === 'auth/multi-factor-auth-required') {
      try {
        authError.resolver = getMultiFactorResolver(auth, error as MultiFactorError);
      } catch (resolverError) {
        console.error(`[AuthService] ${provider} MFA resolver unavailable`, resolverError);
      }
    }

    console.error(`[AuthService] ${provider} failed`, {
      code: authError.code,
      message: authError.message,
      email: authError.customData?.email || null,
      credential: authError.credential || null,
    });

    return authError;
  }

  /**
   * Get user-friendly error message
   */
  private getErrorMessage(code: string): string {
    const errorMessages: Record<string, string> = {
      'auth/email-already-in-use': 'Email already registered',
      'auth/invalid-email': 'Invalid email address',
      'auth/operation-not-allowed': 'Operation not allowed',
      'auth/weak-password': 'Password is too weak',
      'auth/user-disabled': 'Account has been disabled',
      'auth/user-not-found': 'Invalid credentials',
      'auth/wrong-password': 'Invalid credentials',
      'auth/too-many-requests': 'Too many attempts. Please try again later',
      'auth/network-request-failed': 'Network error. Please check your connection',
      'auth/popup-closed-by-user': 'Sign-in cancelled',
      'auth/cancelled-popup-request': 'Sign-in cancelled',
      'auth/invalid-verification-code': 'Invalid verification code',
      'auth/invalid-verification-id': 'Invalid verification ID',
      'auth/requires-recent-login': 'Please sign in again to perform this action',
    };

    return errorMessages[code] || 'An error occurred. Please try again';
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export const authService = new AuthService();
