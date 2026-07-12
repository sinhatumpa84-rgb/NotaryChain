'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-secondary-200">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-secondary-900">
              Digital Notary
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/features"
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/security"
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Security
            </Link>
            <Link
              href="/pricing"
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Pricing
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/login"
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-secondary-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="/features"
              className="block text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/how-it-works"
              className="block text-secondary-700 hover:text-primary-600 transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/security"
              className="block text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Security
            </Link>
            <Link
              href="/pricing"
              className="block text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Pricing
            </Link>
            <div className="pt-4 space-y-2">
              <Link
                href="/login"
                className="block text-center text-secondary-700 hover:text-primary-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block text-center bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
