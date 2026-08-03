'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendEmailVerification } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Shield, MailCheck, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function VerifyEmail() {
  const { user, signOut, refreshProfile } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleResend = async () => {
    if (!user) return;
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend verification email';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;
    setIsChecking(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        await refreshProfile();
        toast.success('Email verified successfully!');
        router.push('/dashboard');
      } else {
        toast.error('Email not verified yet. Please check your inbox and click the link.');
      }
    } catch (error) {
      toast.error('Error reloading user status');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group-hover:border-emerald-500/40 transition-colors">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NotaryChain
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Verify your email</h2>
          <p className="mt-2 text-sm text-slate-400">
            We sent a verification link to{' '}
            <span className="font-semibold text-slate-200">{user?.email || 'your email'}</span>
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <MailCheck className="h-10 w-10 text-emerald-400 animate-pulse" />
          </div>

          <p className="text-sm text-slate-300">
            Please click on the link in the email to verify your account and access full platform features.
          </p>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center"
            >
              {isChecking ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  I&apos;ve verified my email
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-medium disabled:opacity-50 transition-colors border border-slate-700 flex items-center justify-center"
            >
              {isResending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Resend verification email
            </button>
          </div>

          <div className="pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => signOut()}
              className="text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
            >
              Sign in with a different account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
