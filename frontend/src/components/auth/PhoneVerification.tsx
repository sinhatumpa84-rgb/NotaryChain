'use client';

import { useState, useEffect, useRef } from 'react';
import { ConfirmationResult } from 'firebase/auth';
import toast from 'react-hot-toast';
import { Phone, Loader2, RefreshCw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authService } from '@/services/auth-service';
import { clearRecaptchaVerifier } from '@/lib/firebase';

interface PhoneVerificationProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PhoneVerification({ onSuccess, onCancel }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number with country code (e.g. +1234567890)');
      return;
    }

    setIsSending(true);
    try {
      const result = await authService.sendPhoneOTP(phoneNumber);
      setConfirmationResult(result);
      setTimer(60);
      toast.success('OTP sent to your phone number');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      toast.error(message);
      clearRecaptchaVerifier();
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      toast.error('No pending OTP request found');
      return;
    }

    setIsVerifying(true);
    try {
      await authService.verifyPhoneOTP(confirmationResult, code);
      toast.success('Phone number verified successfully!');
      clearRecaptchaVerifier();
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid OTP code';
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <Phone className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Phone Verification</h3>
        <p className="text-sm text-slate-400 mt-1">
          {confirmationResult
            ? `Enter the 6-digit code sent to ${phoneNumber}`
            : 'Enter your phone number to receive a verification code'}
        </p>
      </div>

      {!confirmationResult ? (
        <form onSubmit={handleSendOTP} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Phone Number (with Country Code)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 234 567 8900"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
                required
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">Format: +[country code][number]</p>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium border border-slate-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSending}
              className={`${
                onCancel ? 'w-1/2' : 'w-full'
              } bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center`}
            >
              {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Code'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-12 h-14 text-center text-xl font-bold bg-slate-950/60 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-colors"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            {timer > 0 ? (
              <span>Resend code in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleSendOTP}
                className="text-emerald-400 hover:underline flex items-center"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" /> Resend OTP
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmationResult(null)}
              className="hover:underline text-slate-400"
            >
              Change number
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-medium border border-slate-700 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isVerifying}
              className={`${
                onCancel ? 'w-1/2' : 'w-full'
              } bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 rounded-xl font-semibold disabled:opacity-50 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center`}
            >
              {isVerifying ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify Code'}
            </button>
          </div>
        </form>
      )}

      {/* Recaptcha container */}
      <div id="recaptcha-container" />
    </div>
  );
}
