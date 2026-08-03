import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PhoneVerification } from '@/components/auth/PhoneVerification';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Phone Verification - NotaryChain',
  description: 'Verify your phone number with SMS OTP',
};

export default function PhoneVerificationPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        <PhoneVerification />
      </div>
    </ProtectedRoute>
  );
}
