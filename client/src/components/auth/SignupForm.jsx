import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineUser, HiOutlineBuildingOffice, HiOutlineShieldCheck, HiOutlineDocumentCheck, HiOutlinePhone } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';

const SignupForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', password: '', confirm: '', firstName: '', lastName: '', phone: '', role: 'company' });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await signup(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    const p = formData.password;
    let score = 0;
    if (p.length > 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
        <motion.div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500" initial={{ width: '33%' }} animate={{ width: `${(step / 3) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Create Account</h2>
        <p className="text-slate-400 mt-2">Step {step} of 3</p>
      </div>

      <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
              <Input icon={<HiOutlineEnvelope />} type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="w-full bg-slate-800/50 border-white/10 text-white" />
              <Input icon={<HiOutlineLockClosed />} type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required className="w-full bg-slate-800/50 border-white/10 text-white" />
              <div className="flex gap-1 h-1 mt-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`flex-1 rounded-full ${getPasswordStrength() >= i ? (getPasswordStrength() > 2 ? 'bg-emerald-500' : 'bg-amber-500') : 'bg-slate-700'}`} />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Min 8 characters with at least one letter and one number</p>
              <Input icon={<HiOutlineLockClosed />} type="password" placeholder="Confirm Password" value={formData.confirm} onChange={e => setFormData({...formData, confirm: e.target.value})} required className="w-full bg-slate-800/50 border-white/10 text-white" />
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl mt-4">Next</Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
              <Input icon={<HiOutlineUser />} type="text" placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required className="w-full bg-slate-800/50 border-white/10 text-white" />
              <Input icon={<HiOutlineUser />} type="text" placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required className="w-full bg-slate-800/50 border-white/10 text-white" />
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-slate-400 text-sm font-medium">+91</span>
                </div>
                <input
                  type="tel"
                  placeholder="Mobile Number"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value.replace(/\D/g,'').slice(0,10)})}
                  maxLength={10}
                  className="w-full pl-12 pr-3 py-2.5 bg-slate-800/50 border border-white/10 text-white rounded-lg placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="button" onClick={handleBack} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl">Back</Button>
                <Button type="submit" className="w-2/3 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl">Next</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'company', icon: <HiOutlineBuildingOffice className="w-6 h-6"/>, title: 'Company', desc: 'Upload & manage documents' },
                  { id: 'bank', icon: <HiOutlineShieldCheck className="w-6 h-6"/>, title: 'Bank', desc: 'Verify documents & identity' },
                  { id: 'notary', icon: <HiOutlineDocumentCheck className="w-6 h-6"/>, title: 'Notary', desc: 'Certify & notarize digitally' }
                ].map(role => (
                  <div key={role.id} onClick={() => setFormData({...formData, role: role.id})} className={`p-4 rounded-xl cursor-pointer border ${formData.role === role.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/30 hover:border-slate-500'} transition-all flex items-center gap-4`}> 
                    <div className={`p-3 rounded-lg ${formData.role === role.id ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>{role.icon}</div>
                    <div>
                      <h4 className="text-white font-medium">{role.title}</h4>
                      <p className="text-slate-400 text-sm">{role.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4">
                <Button type="button" onClick={handleBack} className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl">Back</Button>
                <Button type="submit" isLoading={loading} className="w-2/3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white py-3 rounded-xl">Complete Signup</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
      <div className="mt-6 text-center text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
      </div>
    </motion.div>
  );
};
export default SignupForm;
