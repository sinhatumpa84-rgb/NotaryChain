'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';
import { authService } from '@/services/auth-service';
import { useAuth } from '@/context/AuthContext';
import { MultiFactorResolver, AuthError, MultiFactorError, getMultiFactorResolver } from 'firebase/auth';
import { auth, clearRecaptchaVerifier } from '@/lib/firebase';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 60;

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  // MFA state when sign-in triggers multi-factor authentication
  const [mfaResolverState, setMfaResolverState] = useState<MultiFactorResolver | null>(null);
  const [mfaCode, setMfaCode] = useState(['', '', '', '', '', '']);
  const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
  const mfaInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { refreshProfile, setPersistence, setMfaResolver } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const getLockoutRemaining = () => {
    if (!lockoutUntil) return 0;
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  };

  const handleMfaChallenge = (error: unknown, providerName: string) => {
    const err = error as AuthError & {
      resolver?: MultiFactorResolver;
      code?: string;
      customData?: { email?: string };
      credential?: unknown;
    };

    if (err.code === 'auth/multi-factor-auth-required') {
      try {
        const resolver = err.resolver || getMultiFactorResolver(auth, err as MultiFactorError);
        if (resolver?.hints?.length) {
          setMfaResolverState(resolver);
          setMfaResolver(resolver);
          router.push('/verify-2fa');
          return true;
        }
      } catch (resolverError) {
        console.error(`[LoginForm] ${providerName} MFA resolver failed`, resolverError);
      }
    }

    console.error(`[LoginForm] ${providerName} failed`, {
      code: err.code,
      message: err.message,
      email: err.customData?.email || null,
      credential: err.credential || null,
    });

    return false;
  };

  const completePostAuthFlow = async () => {
    await refreshProfile();
    router.push('/dashboard');
  };

  const onSubmit = async (data: LoginFormValues) => {
    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast.error(`Too many failed attempts. Try again in ${getLockoutRemaining()}s`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (data.remember !== undefined) {
        await setPersistence(data.remember);
      }

      await authService.signIn(data.email, data.password);
      setFailedAttempts(0);
      setLockoutUntil(null);
      await completePostAuthFlow();
      toast.success('Login successful!');
    } catch (error) {
      const err = error as AuthError & { resolver?: MultiFactorResolver; code?: string };
      if (err.message === 'MFA_REQUIRED' || err.code === 'auth/multi-factor-auth-required') {
        if (handleMfaChallenge(error, 'Email/password sign-in')) {
          return;
        }
      }

      console.error('[LoginForm] Email sign-in failed', {
        code: err.code,
        message: err.message,
      });

      const message = err.message || 'Invalid credentials';
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockoutTime = Date.now() + LOCKOUT_DURATION * 1000;
        setLockoutUntil(lockoutTime);
        toast.error(`Too many failed attempts. Account locked for ${LOCKOUT_DURATION}s`);
      } else {
        toast.error(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      await authService.signInWithGoogle();
      await completePostAuthFlow();
      toast.success('Signed in with Google!');
    } catch (error) {
      const err = error as AuthError & { resolver?: MultiFactorResolver; code?: string };
      if (err.message === 'REDIRECT_REQUIRED') {
        toast.success('Redirecting to Google for sign-in...');
        return;
      }

      if (err.message === 'MFA_REQUIRED' || err.code === 'auth/multi-factor-auth-required') {
        if (handleMfaChallenge(error, 'Google sign-in')) {
          return;
        }
      }

      console.error('[LoginForm] Google sign-in failed', {
        code: err.code,
        message: err.message,
        customData: (error as any)?.customData,
        credential: (error as any)?.credential,
      });

      const message = err.message || 'Google sign-in failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setIsSubmitting(true);
      await authService.signInWithMicrosoft();
      await completePostAuthFlow();
      toast.success('Signed in with Microsoft!');
    } catch (error) {
      const err = error as AuthError & { resolver?: MultiFactorResolver; code?: string };
      if (err.message === 'REDIRECT_REQUIRED') {
        toast.success('Redirecting to Microsoft for sign-in...');
        return;
      }

      if (err.message === 'MFA_REQUIRED' || err.code === 'auth/multi-factor-auth-required') {
        if (handleMfaChallenge(error, 'Microsoft sign-in')) {
          return;
        }
      }

      console.error('[LoginForm] Microsoft sign-in failed', {
        code: err.code,
        message: err.message,
        customData: (error as any)?.customData,
        credential: (error as any)?.credential,
      });

      const message = err.message || 'Microsoft sign-in failed';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...mfaCode];
    newOtp[index] = value.slice(-1);
    setMfaCode(newOtp);

    if (value && index < 5) {
      mfaInputRefs.current[index + 1]?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      mfaInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyMFASignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = mfaCode.join('');
    if (code.length !== 6) {
      toast.error('Enter 6-digit code');
      return;
    }

    if (!mfaResolverState) return;

    setIsVerifyingMFA(true);
    try {
      await authService.verifyMFASignIn(mfaResolverState, code);
      toast.success('2FA verification successful!');
      clearRecaptchaVerifier();
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid 2FA verification code';
      toast.error(message);
    } finally {
      setIsVerifyingMFA(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
      {mfaResolverState ? (
        <form onSubmit={handleVerifyMFASignIn} className="space-y-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Two-Factor Authentication</h3>
            <p className="text-sm text-slate-400 mt-1">
              Enter the 6-digit verification code sent to your phone.
            </p>
          </div>

          <div className="flex justify-between gap-2">
            {mfaCode.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  mfaInputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleMfaOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleMfaKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setMfaResolverState(null)}
              className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium border border-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifyingMFA}
              className="w-1/2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
              {isVerifyingMFA ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Log In'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 bg-slate-950/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-slate-800'
                  }`}
                  placeholder="you@company.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3 bg-slate-950/50 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-slate-800'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-slate-800 bg-slate-950 text-emerald-500 focus:ring-emerald-500/50"
                  {...register('remember')}
                />
                <span className="text-xs text-slate-400">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : lockoutUntil && Date.now() < lockoutUntil ? (
                `Locked (${getLockoutRemaining()}s)`
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-4 text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="flex items-center justify-center px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleMicrosoftSignIn}
                disabled={isSubmitting}
                className="flex items-center justify-center px-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-slate-200 text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 23 23">
                  <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                  <rect x="12" y="1" width="10" height="10" fill="#7fba00" />
                  <rect x="1" y="12" width="10" height="10" fill="#00a4ef" />
                  <rect x="12" y="12" width="10" height="10" fill="#ffb900" />
                </svg>
                Microsoft
              </button>
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Create one
            </Link>
          </div>
        </>
      )}

      <div id="recaptcha-container" />
    </div>
  );
}
