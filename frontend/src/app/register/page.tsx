'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/3 right-1/2 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-8 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl group-hover:border-emerald-500/40 transition-colors">
              <Shield className="h-8 w-8 text-emerald-400" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NotaryChain
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-400">
            Join NotaryChain for secure, enterprise-grade document authentication
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
