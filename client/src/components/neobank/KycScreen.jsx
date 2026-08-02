import React, { useState } from 'react';
import { HiShieldCheck, HiCheckCircle } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { onboardNeobank } from '../../api/neobankApi';

export default function KycScreen({ account, onComplete }) {
  const [formData, setFormData] = useState({
    firstName: 'Ada',
    lastName: 'Lovelace',
    phone: '+12125551234',
    birthDate: '1990-05-15',
    line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    ssn: '123456789'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        birthDate: formData.birthDate,
        address: {
          line1: formData.line1,
          city: formData.city,
          state: formData.state,
          country: 'US',
          zipCode: formData.zipCode
        },
        ssn: formData.ssn
      };

      await onboardNeobank(payload);
      toast.success('KYC identity verification complete on Polygon OMS!');
      onComplete();
    } catch (err) {
      toast.error('KYC submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg">
          🛡️
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Identity Verification (KYC)</h2>
          <p className="text-[10px] text-slate-400">Polygon OMS Customer Enrollment</p>
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/30 flex items-start space-x-2.5">
        <HiCheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-200">
          <span className="font-semibold text-white">KYC Endorsements Active: </span>
          <span className="font-mono text-[10px] text-emerald-300">cryptoCustody, usd, basic</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">US Address</label>
          <input
            type="text"
            value={formData.line1}
            onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
            className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-slate-300 mb-1">Zip Code</label>
            <input
              type="text"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-300 mb-1">Social Security Number (SSN)</label>
          <input
            type="password"
            value={formData.ssn}
            onChange={(e) => setFormData({ ...formData, ssn: e.target.value })}
            placeholder="***-**-1234"
            className="w-full p-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white font-mono focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all"
        >
          {loading ? 'Submitting to Polygon OMS...' : 'Update & Verify Identity'}
        </button>
      </form>
    </div>
  );
}
