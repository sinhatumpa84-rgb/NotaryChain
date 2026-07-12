'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
              <Shield className="h-4 w-4" />
              <span>Bank-Grade Security • GDPR Compliant</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight">
              Paperless Notarization
              <span className="block text-primary-600">Made Simple</span>
            </h1>

            <p className="text-xl text-secondary-600 leading-relaxed">
              Enterprise-grade digital notary platform that eliminates paper-based workflows. 
              Secure document authentication, AI-powered fraud detection, and instant verification.
            </p>

            {/* Key Benefits */}
            <div className="space-y-3">
              {[
                'Reduce loan approval time by 80%',
                'AI-powered fraud detection',
                'Blockchain-backed audit trail',
                'Zero paper, 100% digital',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-success-600 flex-shrink-0" />
                  <span className="text-secondary-700">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center space-x-2 bg-primary-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl font-semibold"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-lg hover:bg-primary-50 transition-all font-semibold"
              >
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">99.9%</p>
                <p className="text-sm text-secondary-600">Uptime</p>
              </div>
              <div className="h-12 w-px bg-secondary-300"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">50K+</p>
                <p className="text-sm text-secondary-600">Documents</p>
              </div>
              <div className="h-12 w-px bg-secondary-300"></div>
              <div className="text-center">
                <p className="text-2xl font-bold text-secondary-900">500+</p>
                <p className="text-sm text-secondary-600">Companies</p>
              </div>
            </div>
          </div>

          {/* Right Column - Visual/Image */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-secondary-200">
              {/* Placeholder for dashboard preview or illustration */}
              <div className="aspect-video bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center">
                <Shield className="h-24 w-24 text-primary-600 opacity-20" />
              </div>
              
              {/* Floating Stats Cards */}
              <div className="absolute -right-4 -bottom-4 bg-white rounded-lg shadow-xl p-4 border border-secondary-200">
                <div className="flex items-center space-x-3">
                  <div className="bg-success-100 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-secondary-900">Verified</p>
                    <p className="text-xs text-secondary-600">Document authenticated</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
