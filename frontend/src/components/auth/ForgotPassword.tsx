'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Shield, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/auth-service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      await authService.sendPasswordReset(data.email);
      setIsSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Reset password</h2>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we&apos;ll send you instructions to reset your password.
          </p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Check your email</h3>
                <p className="text-sm text-slate-400">
                  We sent a password reset link to{' '}
                  <span className="font-semibold text-slate-200">{getValues('email')}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSent(false)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-xl font-medium transition-colors border border-slate-700"
              >
                Try another email
              </button>
            </div>
          ) : (
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3.5 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
