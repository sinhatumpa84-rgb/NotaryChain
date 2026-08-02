import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineCamera } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import FaceScannerModal from './FaceScannerModal';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [faceModalOpen, setFaceModalOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
      className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">Welcome to NotaryChain</h2>
        <p className="text-slate-400 mt-2">Secure digital notarization platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Input
            icon={<HiOutlineEnvelope className="text-slate-400" />}
            type="email" placeholder="Email address"
            value={email} onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-slate-800/50 border-white/10 text-white rounded-xl focus:ring-indigo-500"
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Input
            icon={<HiOutlineLockClosed className="text-slate-400" />}
            type="password" placeholder="Password"
            value={password} onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-slate-800/50 border-white/10 text-white rounded-xl focus:ring-indigo-500"
          />
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center justify-between text-sm">
          <label className="flex items-center text-slate-300">
            <input type="checkbox" className="mr-2 rounded bg-slate-800 border-white/20 text-indigo-500 focus:ring-indigo-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">Forgot password?</Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-3">
          <Button type="submit" isLoading={loading} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all">
            Sign In
          </Button>
          
          <button
            type="button"
            onClick={() => setFaceModalOpen(true)}
            className="w-full py-3 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/60 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 group hover:border-indigo-500/50"
          >
            <HiOutlineCamera className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>Login with Face ID</span>
          </button>
        </motion.div>
      </form>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center">
        <p className="text-slate-400">
          Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign up</Link>
        </p>
      </motion.div>

      <FaceScannerModal
        isOpen={faceModalOpen}
        onClose={() => setFaceModalOpen(false)}
        mode="login"
      />
    </motion.div>
  );
};

export default LoginForm;
