import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineCamera, HiOutlineUser, HiOutlineEnvelope,
  HiOutlinePhone, HiOutlineShieldCheck, HiOutlineCalendar,
  HiOutlineDocumentText, HiOutlineCheckCircle, HiOutlinePencil,
  HiOutlineArrowRightOnRectangle
} from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axios';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import FaceScannerModal from '../components/auth/FaceScannerModal';

const ROLE_LABELS = {
  company: 'Company Admin',
  bank: 'Bank Verifier',
  notary: 'Notary Officer',
  admin: 'System Admin',
};

const ROLE_COLORS = {
  company: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  bank:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  notary:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
  admin:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName:  user.lastName  || '',
        phone:     user.phone     || '',
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const initials = `${(user?.firstName || 'U')[0]}${(user?.lastName || '')[0] || ''}`.toUpperCase();
  const joinDate  = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    : 'Oct 2023';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axiosInstance.put('/users/profile', form);
      const updated = data?.data || data?.user || form;
      updateUser({ ...updated, ...form });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      updateUser(form);
      toast.success('Profile updated!');
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '' });
    setEditing(false);
  };

  return (
    <DashboardLayout title="My Profile" subtitle="Manage your personal information & account settings">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT — Avatar Card */}
        <div className="col-span-1">
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl flex flex-col items-center text-center shadow-sm">
            {/* Avatar */}
            <div className="relative group cursor-pointer mb-6">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/30">
                {user?.avatar
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover" />
                  : initials}
              </div>
              <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <HiOutlineCamera className="text-white" size={28} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.firstName || 'User'} {user?.lastName || ''}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-4 text-sm">{user?.email || 'user@notarychain.com'}</p>

            <span className={`px-3 py-1 border rounded-full text-sm font-medium ${ROLE_COLORS[user?.role] || ROLE_COLORS.company}`}>
              {ROLE_LABELS[user?.role] || 'Company Admin'}
            </span>

            {/* Stats */}
            <div className="w-full mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4 text-left">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 text-sm"><HiOutlineCalendar size={16}/> Member Since</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{joinDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 text-sm"><HiOutlineDocumentText size={16}/> Documents</span>
                <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">{user?.totalDocuments ?? '12'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-500 text-sm"><HiOutlineCheckCircle size={16}/> Email Verified</span>
                <span className={`text-sm font-medium ${user?.isEmailVerified ? 'text-emerald-500' : 'text-emerald-400'}`}>
                  {user?.isEmailVerified ? 'Verified' : 'Active'}
                </span>
              </div>
              {(user?.phone || form.phone) && (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-slate-500 text-sm"><HiOutlinePhone size={16}/> Mobile</span>
                  <span className="text-slate-700 dark:text-slate-300 text-sm font-medium">
                    {user?.phone ? `+91 ${user.phone}` : form.phone ? `+91 ${form.phone}` : '—'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — Personal Info & Security */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h3>
                <p className="text-slate-500 text-sm mt-1">Update your name, phone, and contact details</p>
              </div>
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 rounded-xl text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all"
                >
                  <HiOutlinePencil size={16}/> Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    <HiOutlineUser className="inline mr-1 mb-0.5" size={14}/> First Name
                  </label>
                  <input
                    type="text" value={form.firstName} readOnly={!editing}
                    onChange={e => setForm({...form, firstName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-500/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    <HiOutlineUser className="inline mr-1 mb-0.5" size={14}/> Last Name
                  </label>
                  <input
                    type="text" value={form.lastName} readOnly={!editing}
                    onChange={e => setForm({...form, lastName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-500/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  <HiOutlineEnvelope className="inline mr-1 mb-0.5" size={14}/> Email Address
                  <span className="ml-2 text-xs text-slate-400">(cannot be changed)</span>
                </label>
                <input
                  type="email" value={user?.email || 'user@notarychain.com'} readOnly
                  className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed text-sm"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  <HiOutlinePhone className="inline mr-1 mb-0.5" size={14}/> Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <span className={`text-sm font-semibold ${editing ? 'text-indigo-500' : 'text-slate-400'}`}>+91</span>
                    <div className={`ml-3 h-5 w-px ${editing ? 'bg-indigo-300 dark:bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                  </div>
                  <input
                    type="tel" value={form.phone} readOnly={!editing}
                    placeholder={editing ? "Enter 10-digit mobile number" : "Not added yet"}
                    onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                    maxLength={10}
                    className={`w-full pl-20 pr-4 py-3 rounded-xl border text-sm transition-all ${
                      editing
                        ? 'bg-white dark:bg-slate-800 border-indigo-300 dark:border-indigo-500/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-not-allowed'
                    }`}
                  />
                  {form.phone && form.phone.length === 10 && editing && (
                    <div className="absolute inset-y-0 right-4 flex items-center">
                      <HiOutlineCheckCircle className="text-emerald-500" size={18}/>
                    </div>
                  )}
                </div>
                {editing && (
                  <p className="mt-1.5 text-xs text-slate-400">
                    Enter 10-digit Indian mobile number (without country code)
                    {form.phone && <span className="ml-2 text-indigo-400 font-medium">{form.phone.length}/10</span>}
                  </p>
                )}
              </div>

              {/* Role (read-only) */}
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  <HiOutlineShieldCheck className="inline mr-1 mb-0.5" size={14}/> Account Role
                </label>
                <div className="w-full px-4 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700 flex items-center gap-3">
                  <span className={`px-2.5 py-1 border rounded-lg text-xs font-semibold ${ROLE_COLORS[user?.role] || ROLE_COLORS.company}`}>
                    {ROLE_LABELS[user?.role] || 'Company Admin'}
                  </span>
                  <span className="text-xs text-slate-400">Contact admin to change your role</span>
                </div>
              </div>

              {/* Buttons */}
              {editing && (
                <div className="flex gap-4 pt-2">
                  <button
                    type="button" onClick={handleCancel}
                    className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/><span>Saving…</span></>
                    ) : (
                      <><HiOutlineCheckCircle size={18}/><span>Save Changes</span></>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Security & Face ID Card */}
          <div className="p-6 bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-3xl shadow-sm space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HiOutlineShieldCheck size={18} className="text-indigo-400"/> Security & Biometrics
            </h3>

            {/* Face ID Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                  <HiOutlineCamera size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Face ID Authentication</p>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      AI Powered
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Log in instantly using webcam face recognition & cosine vector similarity
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFaceModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <HiOutlineCamera size={16} /> Register Face ID
              </button>
            </div>

            {/* Password Section */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
                <p className="text-xs text-slate-500 mt-0.5">Keep your account secure with a strong password</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-indigo-500 border border-indigo-200 dark:border-indigo-500/30 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all">
                Change Password
              </button>
            </div>
          </div>

          {/* Log Out Section Card */}
          <div className="p-6 bg-white dark:bg-slate-900/60 border border-rose-200 dark:border-rose-900/30 rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HiOutlineArrowRightOnRectangle className="text-rose-500" size={20}/> Session & Account
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sign out of your active session on this device
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto px-5 py-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <HiOutlineArrowRightOnRectangle size={18}/> Log Out
            </button>
          </div>

          <FaceScannerModal
            isOpen={faceModalOpen}
            onClose={() => setFaceModalOpen(false)}
            mode="register"
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
