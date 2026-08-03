'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth-service';
import { clearRecaptchaVerifier } from '@/lib/firebase';

export default function VerifyTwoFactorPage() {
  const router = useRouter();
  const { mfaResolver, setMfaResolver, loading } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!loading && !mfaResolver) {
      router.replace('/login');
    }
  }, [loading, mfaResolver, router]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value.slice(-1);
    setOtp(nextOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!mfaResolver) {
      toast.error('No MFA challenge is active. Please sign in again.');
      return;
    }

    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Enter the 6-digit verification code');
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.verifyMFASignIn(mfaResolver, code);
      clearRecaptchaVerifier();
      setMfaResolver(null);
      toast.success('2FA verification successful!');
      router.push('/dashboard');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid verification code';
      console.error('[Verify2FA] MFA verification failed', error);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-semibold text-white">Two-Factor Authentication</h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter the 6-digit code sent to your phone to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(event) => handleOtpChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className="h-14 w-12 rounded-xl border border-slate-800 bg-slate-950/60 text-center text-xl font-bold text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify & Continue'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMfaResolver(null);
            router.push('/login');
          }}
          className="mt-4 w-full text-sm text-slate-400 transition-colors hover:text-slate-200"
        >
          Cancel and return to sign in
        </button>
      </div>
    </div>
  );
}
