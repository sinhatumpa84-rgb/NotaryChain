'use client';

import { useRequireAuth } from '@/hooks/useAuth';
import { Shield, LogOut, User, Building2, FileText, Bell, Mail } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userProfile, loading, signOut } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-secondary-900">Digital Notary</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-secondary-600">
                {userProfile?.firstName} {userProfile?.lastName}
              </span>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 text-secondary-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm">Sign out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-secondary-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Documents</p>
                <p className="text-2xl font-bold text-secondary-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Companies</p>
                <p className="text-2xl font-bold text-secondary-900">0</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-secondary-600">Notifications</p>
                <p className="text-2xl font-bold text-secondary-900">0</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <h2 className="text-lg font-semibold text-secondary-900 mb-4">Profile</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-secondary-400" />
              <span className="text-secondary-600">
                {userProfile?.firstName} {userProfile?.lastName}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-secondary-400" />
              <span className="text-secondary-600">{userProfile?.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-secondary-400" />
              <span className="text-secondary-600 capitalize">Role: {userProfile?.role}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


